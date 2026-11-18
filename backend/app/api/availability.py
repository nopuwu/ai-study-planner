from datetime import time
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import User, StudyAvailability
from app.schemas.availability import (
    StudyAvailabilityCreate,
    StudyAvailabilityUpdate,
    StudyAvailabilityResponse,
)
from app.api.dependencies import get_db, get_current_user

router = APIRouter(prefix="/availability", tags=["Dostępność czasowa"])


async def _check_interval_overlap(
    user_id: int,
    weekday: int,
    start_time: time,
    end_time: time,
    db: AsyncSession,
    exclude_id: Optional[int] = None,
) -> None:
    """Sprawdza, czy podany przedział czasowy nie nachodzi na istniejący przedział użytkownika."""
    stmt = select(StudyAvailability).where(
        StudyAvailability.user_id == user_id,
        StudyAvailability.weekday == weekday,
        StudyAvailability.start_time < end_time,
        StudyAvailability.end_time > start_time,
    )
    if exclude_id is not None:
        stmt = stmt.where(StudyAvailability.id != exclude_id)

    result = await db.execute(stmt)
    if result.scalars().first() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Przedział czasowy nakłada się na istniejącą dostępność w tym dniu.",
        )


@router.post("", response_model=StudyAvailabilityResponse, status_code=status.HTTP_201_CREATED)
async def create_availability(
    body: StudyAvailabilityCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Dodaj nowy przedział dostępności czasowej użytkownika."""
    await _check_interval_overlap(
        user_id=current_user.id,
        weekday=body.weekday,
        start_time=body.start_time,
        end_time=body.end_time,
        db=db,
    )

    avail = StudyAvailability(
        user_id=current_user.id,
        weekday=body.weekday,
        start_time=body.start_time,
        end_time=body.end_time,
    )
    db.add(avail)
    await db.commit()
    await db.refresh(avail)
    return avail


@router.get("", response_model=list[StudyAvailabilityResponse])
async def list_availability(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Zwraca listę wszystkich przedziałów dostępności zalogowanego użytkownika."""
    stmt = (
        select(StudyAvailability)
        .where(StudyAvailability.user_id == current_user.id)
        .order_by(StudyAvailability.weekday.asc(), StudyAvailability.start_time.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/{availability_id}", response_model=StudyAvailabilityResponse)
async def get_availability(
    availability_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pobierz pojedynczy przedział dostępności po ID."""
    result = await db.execute(
        select(StudyAvailability).where(
            StudyAvailability.id == availability_id,
            StudyAvailability.user_id == current_user.id,
        )
    )
    avail = result.scalars().first()
    if not avail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Przedział dostępności nie został znaleziony.",
        )
    return avail


@router.patch("/{availability_id}", response_model=StudyAvailabilityResponse)
async def update_availability(
    availability_id: int,
    body: StudyAvailabilityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Częściowo zaktualizuj przedział dostępności z ponowną walidacją nakładania się."""
    result = await db.execute(
        select(StudyAvailability).where(
            StudyAvailability.id == availability_id,
            StudyAvailability.user_id == current_user.id,
        )
    )
    avail = result.scalars().first()
    if not avail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Przedział dostępności nie został znaleziony.",
        )

    new_weekday = body.weekday if body.weekday is not None else avail.weekday
    new_start = body.start_time if body.start_time is not None else avail.start_time
    new_end = body.end_time if body.end_time is not None else avail.end_time

    if new_start >= new_end:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="start_time musi być wcześniejszy niż end_time.",
        )

    await _check_interval_overlap(
        user_id=current_user.id,
        weekday=new_weekday,
        start_time=new_start,
        end_time=new_end,
        db=db,
        exclude_id=avail.id,
    )

    avail.weekday = new_weekday
    avail.start_time = new_start
    avail.end_time = new_end

    await db.commit()
    await db.refresh(avail)
    return avail


@router.delete("/{availability_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_availability(
    availability_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Usuń przedział dostępności."""
    result = await db.execute(
        select(StudyAvailability).where(
            StudyAvailability.id == availability_id,
            StudyAvailability.user_id == current_user.id,
        )
    )
    avail = result.scalars().first()
    if not avail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Przedział dostępności nie został znaleziony.",
        )

    await db.delete(avail)
    await db.commit()
