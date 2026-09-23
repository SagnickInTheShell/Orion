from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    APP_NAME: str = "ORION — Personalized AI for Proactive Autism Support"
    TAGLINE: str = "It doesn't learn autism. It learns the individual."
    API_PREFIX: str = "/api"
    DEBUG: bool = True
    
    # Defaults to local SQLite for instant zero-dependency execution;
    # Can be overridden via DATABASE_URL env var (e.g. postgresql://orion:orion@postgres:5432/orion)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./orion.db")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
