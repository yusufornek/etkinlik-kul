from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings

# SQLite için özel ayarlar
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

# Engine oluştur
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args
)

# Session oluştur
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base model
Base = declarative_base()

# Dependency - her request için database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
