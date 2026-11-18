from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import User, Subject, Material
from app.schemas.material import MaterialCreate, MaterialUpdate, MaterialResponse
from app.api.dependencies import get_db, get_current_user

router = APIRouter(
    prefix="/subjects/{subject_id}/materials",
    tags=["Materiały"],
)


async def _get_owned_subject(
    subject_id: int, db: AsyncSession, current_user: User
) -> Subject:
    """Zwraca przedmiot należący do użytkownika lub rzuca 404."""
    result = await db.execute(
        select(Subject)
        .where(Subject.id == subject_id, Subject.owner_id == current_user.id)
    )
    subject = result.scalars().first()
    if not subject:
        raise HTTPException(status_code=404, detail="Przedmiot nie znaleziony.")
    return subject


@router.post("", response_model=MaterialResponse, status_code=status.HTTP_201_CREATED)
async def create_material(
    subject_id: int,
    body: MaterialCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Dodaj materiał do przedmiotu."""
    await _get_owned_subject(subject_id, db, current_user)
    material = Material(
        subject_id=subject_id,
        uploaded_by=current_user.id,
        **body.model_dump(),
    )
    db.add(material)
    await db.commit()
    await db.refresh(material)
    return material


@router.get("", response_model=list[MaterialResponse])
async def list_materials(
    subject_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Zwróć wszystkie materiały danego przedmiotu."""
    await _get_owned_subject(subject_id, db, current_user)
    result = await db.execute(
        select(Material).where(Material.subject_id == subject_id)
    )
    return result.scalars().all()


@router.get("/{material_id}", response_model=MaterialResponse)
async def get_material(
    subject_id: int,
    material_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Pobierz pojedynczy materiał."""
    await _get_owned_subject(subject_id, db, current_user)
    result = await db.execute(
        select(Material)
        .where(Material.id == material_id, Material.subject_id == subject_id)
    )
    material = result.scalars().first()
    if not material:
        raise HTTPException(status_code=404, detail="Materiał nie znaleziony.")
    return material


@router.patch("/{material_id}", response_model=MaterialResponse)
async def update_material(
    subject_id: int,
    material_id: int,
    body: MaterialUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Częściowo zaktualizuj materiał."""
    await _get_owned_subject(subject_id, db, current_user)
    result = await db.execute(
        select(Material)
        .where(Material.id == material_id, Material.subject_id == subject_id)
    )
    material = result.scalars().first()
    if not material:
        raise HTTPException(status_code=404, detail="Materiał nie znaleziony.")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(material, field, value)

    await db.commit()
    await db.refresh(material)
    return material


@router.delete("/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_material(
    subject_id: int,
    material_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Usuń materiał."""
    await _get_owned_subject(subject_id, db, current_user)
    result = await db.execute(
        select(Material)
        .where(Material.id == material_id, Material.subject_id == subject_id)
    )
    material = result.scalars().first()
    if not material:
        raise HTTPException(status_code=404, detail="Materiał nie znaleziony.")

    await db.delete(material)
    await db.commit()
