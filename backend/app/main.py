import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database.session import engine, SessionLocal, Base
from app.database.seed_data import seed_database
import app.models  # Ensure all models are registered with Base

# Import Routers
from app.routes.auth import router as auth_router
from app.routes.resume import router as resume_router
from app.routes.jobs import router as jobs_router
from app.routes.matching import router as matching_router
from app.routes.applications import router as applications_router
from app.routes.admin import router as admin_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed demo data
    print("Creating database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield
    print("Application shutdown.")

app = FastAPI(
    title="JobMatch AI API",
    description="Intelligent AI-Powered Job Portal and Resume Matching Engine API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for local dev flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API Routers
app.include_router(auth_router, prefix="/api")
app.include_router(resume_router, prefix="/api")
app.include_router(jobs_router, prefix="/api")
app.include_router(matching_router, prefix="/api")
app.include_router(applications_router, prefix="/api")
app.include_router(admin_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "JobMatch AI API",
        "version": "1.0.0",
        "mode": "production-ready"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
