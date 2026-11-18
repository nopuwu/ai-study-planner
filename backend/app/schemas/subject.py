from typing import Optional
from pydantic import BaseModel, Field


class SubjectCreate(BaseModel):
    """Tworzenie nowego przedmiotu."""
    name: str = Field(..., max_length=255)
    description: Optional[str] = None


class SubjectUpdate(BaseModel):
    """Częściowa aktualizacja przedmiotu (wszystkie pola opcjonalne)."""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None


class SubjectResponse(BaseModel):
    """Schemat zwracany przez API."""
    id: int
    owner_id: int
    name: str
    description: Optional[str]

    class Config:
        from_attributes = True
