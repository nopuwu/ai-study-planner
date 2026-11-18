from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import User, Subject
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectResponse
from app.api.dependencies import get_db, get_current_user

router = APIRouter(prefix="/subjects", tags=["Przedmioty"])


@router.post("", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
async def create_subject(
    body: SubjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Utwórz nowy przedmiot dla zalogowanego użytkownika."""
    subject = Subject(owner_id=current_user.id, **body.model_dump())
    db.add(subject)
    await db.commit()
    await db.refresh(subject)
    return subject


@router.get("", response_model=list[SubjectResponse])
async def list_subjects(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Zwróć listę wszystkich przedmiotów zalogowanego użytkownika."""
    result = await db.execute(
        select(Subject).where(Subject.owner_id == current_user.id)
    )
    return result.scalars().all()


@router.get("/{subject_id}", response_model=SubjectResponse)
async def get_subject(
    subject_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pobierz pojedynczy przedmiot po ID."""
    result = await db.execute(
        select(Subject)
        .where(Subject.id == subject_id, Subject.owner_id == current_user.id)
    )
    subject = result.scalars().first()
    if not subject:
        raise HTTPException(status_code=404, detail="Przedmiot nie znaleziony.")
    return subject


@router.patch("/{subject_id}", response_model=SubjectResponse)
async def update_subject(
    subject_id: int,
    body: SubjectUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Częściowo zaktualizuj przedmiot (tylko przesłane pola)."""
    result = await db.execute(
        select(Subject)
        .where(Subject.id == subject_id, Subject.owner_id == current_user.id)
    )
    subject = result.scalars().first()
    if not subject:
        raise HTTPException(status_code=404, detail="Przedmiot nie znaleziony.")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(subject, field, value)

    await db.commit()
    await db.refresh(subject)
    return subject


@router.delete("/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subject(
    subject_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Usuń przedmiot i wszystkie powiązane materiały (CASCADE)."""
    result = await db.execute(
        select(Subject)
        .where(Subject.id == subject_id, Subject.owner_id == current_user.id)
    )
    subject = result.scalars().first()
    if not subject:
        raise HTTPException(status_code=404, detail="Przedmiot nie znaleziony.")

    await db.delete(subject)
    await db.commit()
