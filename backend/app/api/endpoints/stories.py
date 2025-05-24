from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime
import os
import uuid
from PIL import Image

from ...api import deps
from ...models import Story, Admin
from ...schemas.story import Story as StorySchema, StoryCreate, StoryUpdate
from ...core.config import settings

router = APIRouter()


@router.get("/", response_model=List[StorySchema])
def read_stories(
    db: Session = Depends(deps.get_db),
    active_only: bool = True
) -> Any:
    """Storyleri listele (Public)"""
    query = db.query(Story)
    
    if active_only:
        # Aktif ve süresi dolmamış storyleri getir
        current_time = datetime.utcnow()
        query = query.filter(
            Story.is_active == True,
            Story.expires_at > current_time
        )
    
    # Sıralama indexine göre sırala
    stories = query.order_by(Story.order_index, Story.created_at.desc()).all()
    
    return stories


@router.get("/{story_id}", response_model=StorySchema)
def read_story(
    story_id: int,
    db: Session = Depends(deps.get_db)
) -> Any:
    """Tek bir story getir (Public)"""
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Story not found"
        )
    return story


@router.post("/", response_model=StorySchema)
def create_story(
    story_in: StoryCreate,
    db: Session = Depends(deps.get_db),
    current_user: Admin = Depends(deps.get_current_active_user)
) -> Any:
    """Yeni story oluştur (Admin only)"""
    story = Story(**story_in.dict())
    db.add(story)
    db.commit()
    db.refresh(story)
    return story


@router.put("/{story_id}", response_model=StorySchema)
def update_story(
    story_id: int,
    story_in: StoryUpdate,
    db: Session = Depends(deps.get_db),
    current_user: Admin = Depends(deps.get_current_active_user)
) -> Any:
    """Story güncelle (Admin only)"""
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Story not found"
        )
    
    update_data = story_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(story, field, value)
    
    db.commit()
    db.refresh(story)
    return story


@router.delete("/{story_id}")
def delete_story(
    story_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Admin = Depends(deps.get_current_active_user)
) -> Any:
    """Story sil (Admin only)"""
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Story not found"
        )
    
    # Görsel dosyasını sil (eğer varsa ve local ise)
    if story.image_url and story.image_url.startswith("/uploads/"):
        file_path = story.image_url.replace("/uploads/", settings.UPLOAD_FOLDER + "/")
        if os.path.exists(file_path):
            os.remove(file_path)
    
    db.delete(story)
    db.commit()
    return {"message": "Story deleted successfully"}


@router.post("/{story_id}/upload-image")
async def upload_story_image(
    story_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: Admin = Depends(deps.get_current_active_user)
) -> Any:
    """Story görseli yükle (Admin only)"""
    story = db.query(Story).filter(Story.id == story_id).first()
    if not story:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Story not found"
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
    file_name = f"story_{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(settings.UPLOAD_FOLDER, file_name)
    
    # Dosyayı kaydet
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Görseli optimize et (stories için kare format)
    try:
        img = Image.open(file_path)
        # Stories için 1:1 oran, maksimum 800x800
        size = min(img.width, img.height)
        left = (img.width - size) // 2
        top = (img.height - size) // 2
        right = left + size
        bottom = top + size
        
        img_cropped = img.crop((left, top, right, bottom))
        img_cropped.thumbnail((800, 800), Image.Resampling.LANCZOS)
        img_cropped.save(file_path, optimize=True, quality=85)
    except Exception:
        # Görsel işlenemezse orijinal haliyle bırak
        pass
    
    # Eski görseli sil (varsa)
    if story.image_url and story.image_url.startswith("/uploads/"):
        old_file_path = story.image_url.replace("/uploads/", settings.UPLOAD_FOLDER + "/")
        if os.path.exists(old_file_path):
            os.remove(old_file_path)
    
    # Veritabanını güncelle
    story.image_url = f"/uploads/{file_name}"
    db.commit()
    db.refresh(story)
    
    return {"image_url": story.image_url}


@router.delete("/expired/cleanup")
def cleanup_expired_stories(
    db: Session = Depends(deps.get_db),
    current_user: Admin = Depends(deps.get_current_active_user)
) -> Any:
    """Süresi dolmuş storyleri temizle (Admin only)"""
    current_time = datetime.utcnow()
    expired_stories = db.query(Story).filter(Story.expires_at < current_time).all()
    
    deleted_count = 0
    for story in expired_stories:
        # Görsel dosyasını sil
        if story.image_url and story.image_url.startswith("/uploads/"):
            file_path = story.image_url.replace("/uploads/", settings.UPLOAD_FOLDER + "/")
            if os.path.exists(file_path):
                os.remove(file_path)
        
        db.delete(story)
        deleted_count += 1
    
    db.commit()
    return {"message": f"{deleted_count} expired stories cleaned up"}
