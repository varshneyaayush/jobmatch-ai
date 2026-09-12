import os
from pydantic_settings import BaseSettings
from typing import List
from dotenv import load_dotenv

# Load env variables from backend/.env or backend/app/.env if present
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
load_dotenv()

db_url = os.getenv(
    "DATABASE_URL",
    "sqlite:////tmp/jobmatch.db" if os.getenv("VERCEL") else "sqlite:///./jobmatch.db"
)
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)


class Settings(BaseSettings):
    PROJECT_NAME: str = "JobMatch AI"

    DATABASE_URL: str = db_url

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

    # SMTP Configuration
    SMTP_HOST: str = os.getenv("SMTP_HOST", "")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
    SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "noreply@jobmatch.ai")
    SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "True").lower() in ("true", "1", "yes")

    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)