import os
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any, Union
import bcrypt
from jose import jwt

# Pobieranie konfiguracji ze zmiennych środowiskowych (zdefiniowanych w .env i docker-compose)
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "super_tajny_klucz_zmien_go_w_produkcji")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

def _prepare_secret(secret: str) -> bytes:
    """Pre-hashuje string algorytmem SHA-256, aby ominąć limit 72 bajtów w bcrypt."""
    return hashlib.sha256(secret.encode('utf-8')).hexdigest().encode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Sprawdza, czy podane hasło w postaci jawnej pasuje do zahashowanej wersji z bazy."""
    return bcrypt.checkpw(_prepare_secret(plain_password), hashed_password.encode('utf-8'))

def get_password_hash(password: str) -> str:
    """Zwraca zahashowaną wersję hasła do zapisu w bazie danych."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(_prepare_secret(password), salt)
    return hashed.decode('utf-8')

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    """Generuje krótko żyjący Access Token JWT dla użytkownika (subject to zazwyczaj user_id)."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

def create_refresh_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    """Generuje długo żyjący Refresh Token, który posłuży do odświeżania Access Tokena."""
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt