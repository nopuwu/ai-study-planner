from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import jwt, JWTError
from pydantic import BaseModel

from app.database import AsyncSessionLocal
from app.models import User, RefreshToken
from app.schemas.user import UserCreate, UserResponse, Token
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    SECRET_KEY,
    ALGORITHM,
    REFRESH_TOKEN_EXPIRE_DAYS
)

router = APIRouter(prefix="/auth", tags=["Autoryzacja"])

# Zależność (Dependency) dostarczająca sesję bazy danych
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Dodatkowy schemat wejściowy dla endpointu /refresh
class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Rejestracja nowego konta studenta."""
    # 1. Sprawdzenie, czy email jest już w bazie
    stmt = select(User).where(User.email == user_in.email)
    result = await db.execute(stmt)
    if result.scalars().first() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Użytkownik z tym adresem e-mail już istnieje."
        )
    
    # 2. Utworzenie nowego użytkownika
    new_user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role="student"
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """Logowanie i generowanie pary tokenów (Access i Refresh)."""
    # 1. Wyszukanie użytkownika (w standardzie OAuth2 nazwa użytkownika to w naszym przypadku email)
    stmt = select(User).where(User.email == form_data.username)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    # 2. Weryfikacja danych
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nieprawidłowy adres e-mail lub hasło.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Generowanie tokenów
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    
    # 4. Zapis Refresh Tokena w bazie (hashujemy go ze względów bezpieczeństwa, tak jak hasło)
    hashed_rt = get_password_hash(refresh_token)
    
    # Postgres przechowuje daty naiwne, więc konwertujemy datę wygaśnięcia zrzucając strefę (tzinfo)
    expires = (datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)).replace(tzinfo=None)
    
    new_rt = RefreshToken(
        user_id=user.id,
        token_hash=hashed_rt,
        expires_at=expires
    )
    db.add(new_rt)
    await db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
async def refresh_access_token(request: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Wydanie nowej pary tokenów na podstawie ważnego Refresh Tokena."""
    try:
        # 1. Dekodowanie tokena i weryfikacja poprawności formatu/podpisu
        payload = jwt.decode(request.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        token_type = payload.get("type")
        
        if token_type != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Nieprawidłowy typ tokena.")
            
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token odświeżania wygasł lub jest niepoprawny.")

    # 2. Weryfikacja w bazie danych: ze względu na użycie bcrypt musimy sprawdzić tokeny przypisane do usera
    stmt = select(RefreshToken).where(RefreshToken.user_id == user_id).where(RefreshToken.revoked_at.is_(None))
    result = await db.execute(stmt)
    active_tokens = result.scalars().all()
    
    # Przeszukujemy aktywne tokeny przypisane do użytkownika w poszukiwaniu dopasowania do tego hasha
    matched_token_record = next((t for t in active_tokens if verify_password(request.refresh_token, t.token_hash)), None)
    
    if not matched_token_record:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token nie istnieje lub został unieważniony.")
        
    # 3. Jeśli token jest ważny - obracamy go (stary unieważniamy, wydajemy nowy)
    matched_token_record.revoked_at = datetime.utcnow()
    
    new_access_token = create_access_token(subject=user_id)
    new_refresh_token = create_refresh_token(subject=user_id)
    new_rt_hash = get_password_hash(new_refresh_token)
    
    expires = (datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)).replace(tzinfo=None)
    
    new_rt_record = RefreshToken(
        user_id=user_id,
        token_hash=new_rt_hash,
        expires_at=expires
    )
    
    db.add(new_rt_record)
    await db.commit()
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }