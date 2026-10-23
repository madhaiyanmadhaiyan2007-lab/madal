"""
MockMate AI - Database Configuration
Uses SQLAlchemy to establish connection with PostgreSQL database with automatic SQLite fallback.
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

# Load environment variables from .env file
load_dotenv()

# Read the connection string from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/mockmate_db"
)

# Connect to database (with automatic SQLite fallback if PostgreSQL is unavailable locally)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
except Exception as e:
    print(f"[Database Notice] Could not connect to primary DATABASE_URL ({e}). Falling back to SQLite local database.")
    DATABASE_URL = "sqlite:///./mockmate.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# SessionLocal class for creating individual database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative Base for ORM models
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides a database session per request
    and ensures it gets closed when the request is done.
    """
    if SessionLocal is None:
        raise RuntimeError("Database engine is not initialized. Please verify DATABASE_URL.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> dict:
    """
    Helper function to check database connectivity for the /health endpoint.
    Returns status and descriptive message.
    """
    if engine is None:
        return {
            "status": "error",
            "message": "Database engine failed to initialize. Check DATABASE_URL in .env.",
        }

    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        db_type = "SQLite" if "sqlite" in str(engine.url) else "PostgreSQL"
        return {
            "status": "connected",
            "message": f"Successfully connected to {db_type} database.",
        }
    except Exception as exc:
        return {
            "status": "disconnected",
            "message": f"Could not connect to database: {str(exc).splitlines()[0]}",
        }

