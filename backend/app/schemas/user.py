from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

# --- SCHEMATY UŻYTKOWNIKA ---

class UserBase(BaseModel):
    """Bazowe pola, które są wspólne dla różnych schematów użytkownika."""
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    """Schemat używany przy rejestracji (żądanie POST). Wymaga podania hasła."""
    password: str

class UserResponse(UserBase):
    """Schemat zwracany przez API. Ukrywa hasło, ale udostępnia ID, rolę i datę utworzenia."""
    id: int
    role: str
    created_at: datetime

    class Config:
        # W Pydantic V2 (używanym w FastAPI) to ustawienie pozwala na poprawne 
        # mapowanie obiektów ORM z SQLAlchemy na modele Pydantic.
        from_attributes = True


# --- SCHEMATY TOKENÓW ---

class Token(BaseModel):
    """Schemat odpowiedzi przy udanym logowaniu lub odświeżaniu tokena."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    """Schemat pomocniczy do przechowywania danych wyciągniętych z odkodowanego JWT."""
    user_id: Optional[str] = None