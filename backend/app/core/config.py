from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    project_name: str = "AI Study Planner API"
    version: str = "0.1.0"
    ai_api_key: str
    ai_api_base_url: str = "https://api.openai.com/v1"
    ai_model: str = "gpt-4.1-mini"
    ai_timeout_seconds: float = Field(default=30.0, gt=0, le=120)
    ai_max_retries: int = Field(default=2, ge=0, le=5)

    model_config = SettingsConfigDict(
        env_file=(BASE_DIR / ".env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
