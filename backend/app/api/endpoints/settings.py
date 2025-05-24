from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...api import deps
from ...models import Settings, Admin
from ...schemas.settings import Settings as SettingsSchema, SettingsUpdate

router = APIRouter()


@router.get("/", response_model=SettingsSchema)
def get_settings(
    db: Session = Depends(deps.get_db),
) -> Any:
    """Site ayarlarını getir (Public)"""
    settings = db.query(Settings).first()
    if not settings:
        # Eğer ayarlar yoksa varsayılan ayarları oluştur
        settings = Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.put("/", response_model=SettingsSchema)
def update_settings(
    settings_in: SettingsUpdate,
    db: Session = Depends(deps.get_db),
    current_user: Admin = Depends(deps.get_current_active_user)
) -> Any:
    """Site ayarlarını güncelle (Admin only)"""
    settings = db.query(Settings).first()
    if not settings:
        # Eğer ayarlar yoksa yeni oluştur
        settings = Settings(**settings_in.dict())
        db.add(settings)
    else:
        # Mevcut ayarları güncelle
        update_data = settings_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    return settings
