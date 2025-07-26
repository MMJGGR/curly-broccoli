from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@db:5432/app")

# Use a dictionary to store engines for persistence in tests
_engines = {}

def get_engine():
    if SQLALCHEMY_DATABASE_URL.startswith("sqlite:///:memory:"):
        if "sqlite_memory" not in _engines:
            _engines["sqlite_memory"] = create_engine(
                SQLALCHEMY_DATABASE_URL,
                connect_args={"check_same_thread": False},
                poolclass=StaticPool,
            )
        return _engines["sqlite_memory"]
    elif SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
        return create_engine(
            SQLALCHEMY_DATABASE_URL,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
    else:
        return create_engine(SQLALCHEMY_DATABASE_URL)

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
from app.models import Base  # ensure models are registered

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

