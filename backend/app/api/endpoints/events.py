from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_
import os
import uuid
from PIL import Image
from datetime import datetime

from ...api import deps
from ...models import Event, Category, Admin
from ...schemas.event import Event as EventSchema, EventCreate, EventUpdate, EventList
from ...core.config import settings

router = APIRouter()


@router.get("/", response_model=List[EventList])
def read_events(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    active_only: bool = True,
    search: Optional[str] = None
) -> Any:
    """Etkinlikleri listele (Public)"""
    query = db.query(Event).join(Category)
    
    if active_only:
        query = query.filter(Event.is_active == True)
    
    if category_id:
        query = query.filter(Event.category_id == category_id)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            or_(
                Event.title.ilike(search_filter),
                Event.description.ilike(search_filter),
                Event.location.ilike(search_filter),
                Event.organizer.ilike(search_filter)
            )
        )
    
    # Tarihe göre sırala (yaklaşan etkinlikler önce)
    query = query.order_by(Event.date, Event.time)
    
    events = query.offset(skip).limit(limit).all()
    return events


@router.get("/featured", response_model=List[EventList])
def read_featured_events(
    db: Session = Depends(deps.get_db)
) -> Any:
    """Öne çıkan etkinlikleri listele (Public)"""
    events = db.query(Event).join(Category).filter(
        Event.is_active == True,
        Event.is_featured == True
    ).order_by(Event.date, Event.time).all()
    return events


@router.get("/{event_id}", response_model=EventSchema)
def read_event(
    event_id: int,
    db: Session = Depends(deps.get_db)
) -> Any:
    """Tek bir etkinlik getir (Public)"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    return event


@router.post("/", response_model=EventSchema)
def create_event(
    event_in: EventCreate,
    db: Session = Depends(deps.get_db),
    current_user: Admin = Depends(deps.get_current_active_user)
) -> Any:
    """Yeni etkinlik oluştur (Admin only)"""
    # Kategori kontrolü
    category = db.query(Category).filter(Category.id == event_in.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid category ID"
        )
    
    event = Event(**event_in.dict())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.put("/{event_id}", response_model=EventSchema)
def update_event(
    event_id: int,
    event_in: EventUpdate,
    db: Session = Depends(deps.get_db),
    current_user: Admin = Depends(deps.get_current_active_user)
) -> Any:
    """Etkinlik güncelle (Admin only)"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Kategori kontrolü (eğer değiştiriliyorsa)
    if event_in.category_id:
        category = db.query(Category).filter(Category.id == event_in.category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid category ID"
            )
    
    update_data = event_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)
    
    event.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Admin = Depends(deps.get_current_active_user)
) -> Any:
    """Etkinlik sil (Admin only)"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Görsel dosyasını sil (eğer varsa ve local ise)
    if event.image_url and event.image_url.startswith("/uploads/"):
        file_path = event.image_url.replace("/uploads/", settings.UPLOAD_FOLDER + "/")
        if os.path.exists(file_path):
            os.remove(file_path)
    
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}


@router.post("/{event_id}/upload-image")
async def upload_event_image(
    event_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: Admin = Depends(deps.get_current_active_user)
) -> Any:
    """Etkinlik görseli yükle (Admin only)"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    # Dosya uzantısı kontrolü
    file_extension = file.filename.split(".")[-1].lower()
    if file_extension not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {settings.ALLOWED_EXTENSIONS}"
        )
    
    # Dosya boyutu kontrolü
    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Max size: {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
        )
    
    # Dosya adı oluştur
    file_name = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(settings.UPLOAD_FOLDER, file_name)
    
    # Dosyayı kaydet
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Görseli optimize et
    try:
        img = Image.open(file_path)
        # Maksimum boyut 1200x800
        img.thumbnail((1200, 800), Image.Resampling.LANCZOS)
        img.save(file_path, optimize=True, quality=85)
    except Exception:
        # Görsel işlenemezse orijinal haliyle bırak
        pass
    
    # Eski görseli sil (varsa)
    if event.image_url and event.image_url.startswith("/uploads/"):
        old_file_path = event.image_url.replace("/uploads/", settings.UPLOAD_FOLDER + "/")
        if os.path.exists(old_file_path):
            os.remove(old_file_path)
    
    # Veritabanını güncelle
    event.image_url = f"/uploads/{file_name}"
    db.commit()
    db.refresh(event)
    
    return {"image_url": event.image_url}


@router.patch("/{event_id}/toggle-featured")
def toggle_event_featured(
    event_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Admin = Depends(deps.get_current_active_user)
) -> Any:
    """Etkinliği öne çıkar/kaldır (Admin only)"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    
    event.is_featured = not event.is_featured
    db.commit()
    db.refresh(event)
    return event
