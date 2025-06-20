from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Kampüs Etkinlikleri API"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str
    
    # Admin
    ADMIN_USERNAME: str
    ADMIN_PASSWORD: str
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    
    # File Upload
    UPLOAD_FOLDER: str = "./uploads" # Existing setting, might be used by other parts
    MAX_FILE_SIZE: int = 5242880  # 5MB
    ALLOWED_EXTENSIONS: set = {"png", "jpg", "jpeg", "gif", "webp"}
    UPLOAD_DIR: str = os.path.join(os.path.abspath(os.path.dirname(__file__)), "..", "..", "uploads") # New setting for forms, more robust path

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()

# Create upload folder if it doesn't exist
os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True) # Ensure new UPLOAD_DIR is also created
