from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class ExamCreate(BaseModel):
    """Tworzenie nowego egzaminu."""
    subject_id: int
    title: str = Field(..., min_length=1, max_length=255)
    exam_at: datetime

    @field_validator("exam_at", mode="after")
    @classmethod
    def ensure_naive_datetime(cls, v: datetime) -> datetime:
        if v.tzinfo is not None:
            return v.replace(tzinfo=None)
        return v


class ExamUpdate(BaseModel):
    """Częściowa aktualizacja egzaminu."""
    subject_id: Optional[int] = None
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    exam_at: Optional[datetime] = None

    @field_validator("exam_at", mode="after")
    @classmethod
    def ensure_naive_datetime(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v is not None and v.tzinfo is not None:
            return v.replace(tzinfo=None)
        return v


class ExamResponse(BaseModel):
    """Odpowiedź API dla egzaminu."""
    id: int
    subject_id: int
    created_by: int
    title: str
    exam_at: datetime

    class Config:
        from_attributes = True
