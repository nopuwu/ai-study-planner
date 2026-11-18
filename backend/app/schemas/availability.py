from datetime import time
from typing import Optional
from pydantic import BaseModel, Field, model_validator


class StudyAvailabilityCreate(BaseModel):
    """Tworzenie przedziału dostępności czasowej."""
    weekday: int = Field(..., ge=0, le=6, description="0=Poniedziałek, 6=Niedziela")
    start_time: time
    end_time: time

    @model_validator(mode="after")
    def validate_time_range(self):
        if self.start_time >= self.end_time:
            raise ValueError("start_time musi być wcześniejszy niż end_time.")
        return self


class StudyAvailabilityUpdate(BaseModel):
    """Częściowa aktualizacja przedziału dostępności czasowej."""
    weekday: Optional[int] = Field(None, ge=0, le=6, description="0=Poniedziałek, 6=Niedziela")
    start_time: Optional[time] = None
    end_time: Optional[time] = None

    @model_validator(mode="after")
    def validate_time_range(self):
        if self.start_time is not None and self.end_time is not None:
            if self.start_time >= self.end_time:
                raise ValueError("start_time musi być wcześniejszy niż end_time.")
        return self


class StudyAvailabilityResponse(BaseModel):
    """Odpowiedź API dla przedziału dostępności czasowej."""
    id: int
    user_id: int
    weekday: int
    start_time: time
    end_time: time

    class Config:
        from_attributes = True
