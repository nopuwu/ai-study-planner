from fastapi import FastAPI
from app.core.config import settings
from app.api.health import router as health_router

app = FastAPI(
    title=settings.project_name,
    version=settings.version,
    description="Szkielet backendu dla AI Study Planner"
)

app.include_router(health_router, prefix="/api")