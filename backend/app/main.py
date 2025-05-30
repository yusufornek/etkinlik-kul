from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .core.config import settings
from .core.database import engine, Base
from .api.api import api_router
from .models import Admin
from .core.security import get_password_hash
from .core.database import SessionLocal

# Veritabanı tablolarını oluştur
# Base.metadata.create_all(bind=engine) # Testler için bu satırı yorumla, conftest.py yönetecek

# FastAPI uygulaması
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API router'ını ekle
app.include_router(api_router, prefix=settings.API_V1_STR)

# Statik dosyalar (upload edilen görseller)
if os.path.exists(settings.UPLOAD_FOLDER):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_FOLDER), name="uploads")

# Ana sayfa
@app.get("/")
def read_root():
    return {
        "message": "Kampüs Etkinlikleri API",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok"}

# İlk admin kullanıcısını oluştur (eğer yoksa)
def create_initial_admin():
    db = SessionLocal()
    try:
        # Admin var mı kontrol et
        admin = db.query(Admin).filter(Admin.username == settings.ADMIN_USERNAME).first()
        if not admin:
            # Admin oluştur
            admin = Admin(
                username=settings.ADMIN_USERNAME,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD)
            )
            db.add(admin)
            db.commit()
            print(f"Initial admin user created: {settings.ADMIN_USERNAME}")
        else:
            print("Admin user already exists")
    except Exception as e:
        print(f"Error creating initial admin: {e}")
    finally:
        db.close()

# Uygulama başladığında admin oluştur
@app.on_event("startup")
async def startup_event():
    create_initial_admin()
    print(f"Application started. API docs available at http://localhost:8000/docs")
