from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.subjects import router as subjects_router
from app.api.materials import router as materials_router

app = FastAPI(
    title=settings.project_name,
    version=settings.version,
    description="Szkielet backendu dla AI Study Planner"
)

# Konfiguracja CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(subjects_router, prefix="/api")
app.include_router(materials_router, prefix="/api")