import os
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    PROJECT_NAME: str = "JobMatch AI"

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:////tmp/jobmatch.db" if os.getenv("VERCEL") else "sqlite:///./jobmatch.db"
    )

    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "jobmatch_ai_super_secret_jwt_key_2026_dev_prod"
    )

    ALGORITHM: str = "HS256"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000"
    ]

    UPLOAD_DIR: str = os.getenv(
        "UPLOAD_DIR",
        "/tmp/uploads" if os.getenv("VERCEL") else "./uploads"
    )

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)