from typing import Optional
from pydantic import BaseModel, Field


class MaterialCreate(BaseModel):
    """Tworzenie nowego materiału w ramach przedmiotu."""
    title: str = Field(..., max_length=255)
    type: str = Field(..., max_length=50)
    url_or_path: str
    est_minutes: Optional[int] = Field(None, ge=1)


class MaterialUpdate(BaseModel):
    """Częściowa aktualizacja materiału."""
    title: Optional[str] = Field(None, max_length=255)
    type: Optional[str] = Field(None, max_length=50)
    url_or_path: Optional[str] = None
    est_minutes: Optional[int] = Field(None, ge=1)


class MaterialResponse(BaseModel):
    """Schemat zwracany przez API."""
    id: int
    subject_id: int
    uploaded_by: Optional[int]
    title: str
    type: str
    url_or_path: str
    est_minutes: Optional[int]

    class Config:
        from_attributes = True
