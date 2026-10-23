"""
MockMate AI - Backend API
FastAPI entry point with CORS configuration, database initialization,
authentication routers, interview generation routers, answer recording routers,
and /health check endpoint.
"""

import os
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base, check_db_connection
import models
import schemas
from auth import get_current_user
from routers import auth, interviews, answers

# Load environment variables
load_dotenv()

# Automatically create database tables if database engine is connected
if engine is not None:
    try:
        models.Base.metadata.create_all(bind=engine)
        print("[Database] Successfully verified and initialized database tables.")
    except Exception as exc:
        print(f"[Database Warning] Could not automatically create tables: {exc}")

# Create FastAPI application instance
app = FastAPI(
    title="MockMate AI - API",
    description="Multilingual (Tamil + English) AI Mock Interview Coach Backend",
    version="1.0.0",
)

# Configure CORS (Cross-Origin Resource Sharing)
allowed_origins_raw = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173"
)
origins = [origin.strip() for origin in allowed_origins_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Sub-Routers
app.include_router(auth.router)
app.include_router(interviews.router)
app.include_router(answers.router)

# Ensure uploads folder exists
uploads_dir = Path(__file__).resolve().parent / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)


@app.get("/")
def read_root():
    """Root endpoint providing basic API information."""
    return {
        "project": "MockMate AI",
        "description": "Multilingual (Tamil + English) AI Mock Interview Coach",
        "status": "running",
        "endpoints": {
            "signup": "/auth/signup",
            "login": "/auth/login",
            "me": "/auth/me",
            "start_interview": "/interviews/start",
            "upload_answer": "/answers/upload",
        },
        "health_check_url": "/health",
        "docs_url": "/docs",
    }


@app.get(
    "/me",
    response_model=schemas.UserResponse,
    summary="Protected /me alias endpoint"
)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    """
    Direct /me protected endpoint (alias to /auth/me)
    Requires Bearer token in Authorization header.
    """
    return current_user


@app.get("/health")
def health_check():
    """
    Health check endpoint:
    - Verifies that FastAPI server is active
    - Checks PostgreSQL database connectivity via SQLAlchemy
    - Returns current server timestamp and status breakdown
    """
    db_status = check_db_connection()
    overall_status = "ok" if db_status["status"] == "connected" else "degraded"

    return {
        "status": overall_status,
        "api": {
            "status": "ok",
            "service": "MockMate AI Backend",
            "version": "1.0.0",
        },
        "database": db_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    print(f"Starting MockMate AI backend on http://{host}:{port}")
    uvicorn.run("main:app", host=host, port=port, reload=True)
