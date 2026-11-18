from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import User, Subject, Exam
from app.schemas.exam import ExamCreate, ExamUpdate, ExamResponse
from app.api.dependencies import get_db, get_current_user

router = APIRouter(prefix="/exams", tags=["Egzaminy"])


async def _verify_subject_ownership(subject_id: int, db: AsyncSession, user_id: int) -> Subject:
    """Weryfikuje, czy przedmiot istnieje i należy do użytkownika."""
    result = await db.execute(
        select(Subject).where(Subject.id == subject_id, Subject.owner_id == user_id)
    )
    subject = result.scalars().first()
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Przedmiot nie istnieje lub brak do niego dostępu.",
        )
    return subject


@router.post("", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
async def create_exam(
    body: ExamCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Utwórz nowy egzamin dla przedmiotu zalogowanego użytkownika."""
    await _verify_subject_ownership(body.subject_id, db, current_user.id)

    exam = Exam(
        subject_id=body.subject_id,
        created_by=current_user.id,
        title=body.title,
        exam_at=body.exam_at,
    )
    db.add(exam)
    await db.commit()
    await db.refresh(exam)
    return exam


@router.get("", response_model=list[ExamResponse])
async def list_exams(
    subject_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Zwraca listę egzaminów użytkownika, opcjonalnie przefiltrowaną po przedmiocie."""
    stmt = (
        select(Exam)
        .where(Exam.created_by == current_user.id)
        .order_by(Exam.exam_at.asc())
    )
    if subject_id is not None:
        stmt = stmt.where(Exam.subject_id == subject_id)

    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{exam_id}", response_model=ExamResponse)
async def get_exam(
    exam_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pobierz pojedynczy egzamin po ID."""
    result = await db.execute(
        select(Exam).where(Exam.id == exam_id, Exam.created_by == current_user.id)
    )
    exam = result.scalars().first()
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Egzamin nie został znaleziony.",
        )
    return exam


@router.patch("/{exam_id}", response_model=ExamResponse)
async def update_exam(
    exam_id: int,
    body: ExamUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Częściowo zaktualizuj egzamin."""
    result = await db.execute(
        select(Exam).where(Exam.id == exam_id, Exam.created_by == current_user.id)
    )
    exam = result.scalars().first()
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Egzamin nie został znaleziony.",
        )

    if body.subject_id is not None and body.subject_id != exam.subject_id:
        await _verify_subject_ownership(body.subject_id, db, current_user.id)

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(exam, field, value)

    await db.commit()
    await db.refresh(exam)
    return exam


@router.delete("/{exam_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exam(
    exam_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Usuń egzamin."""
    result = await db.execute(
        select(Exam).where(Exam.id == exam_id, Exam.created_by == current_user.id)
    )
    exam = result.scalars().first()
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Egzamin nie został znaleziony.",
        )

    await db.delete(exam)
    await db.commit()
