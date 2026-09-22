"""
Database Engine and Session Management for CMPDI Geological Intelligence Portal.
Synchronous SQLAlchemy connection over SQLite with URL scheme normalization.
"""

import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Normalize DATABASE_URL for synchronous driver if sqlite+aiosqlite is provided
raw_url = settings.DATABASE_URL
if raw_url.startswith("sqlite+aiosqlite://"):
    raw_url = raw_url.replace("sqlite+aiosqlite://", "sqlite://", 1)

# Ensure relative SQLite path is resolved relative to backend directory or project root
connect_args = {}
if raw_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    raw_url,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency yielding a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initializes database schema and tables."""
    from app.db import models  # noqa: F401 - ensure models are imported
    Base.metadata.create_all(bind=engine)
