from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...api import deps
from ...models import Category, Admin
from ...schemas.category import Category as CategorySchema, CategoryCreate, CategoryUpdate

router = APIRouter()


@router.get("/", response_model=List[CategorySchema])
def read_categories(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True
) -> Any:
    """Kategorileri listele (Public)"""
    query = db.query(Category)
    if active_only:
        query = query.filter(Category.is_active == True)
    categories = query.offset(skip).limit(limit).all()
    return categories


@router.get("/{category_id}", response_model=CategorySchema)
def read_category(
    category_id: int,
    db: Session = Depends(deps.get_db)
) -> Any:
    """Tek bir kategori getir (Public)"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return category


@router.post("/", response_model=CategorySchema)
def create_category(
    category_in: CategoryCreate,
    db: Session = Depends(deps.get_db),
    current_user: Admin = Depends(deps.get_current_active_user)
) -> Any:
    """Yeni kategori oluştur (Admin only)"""
    # Slug kontrolü
    if db.query(Category).filter(Category.slug == category_in.slug).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this slug already exists"
        )
    
    category = Category(**category_in.dict())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/{category_id}", response_model=CategorySchema)
def update_category(
    category_id: int,
    category_in: CategoryUpdate,
    db: Session = Depends(deps.get_db),
    current_user: Admin = Depends(deps.get_current_active_user)
) -> Any:
    """Kategori güncelle (Admin only)"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Slug kontrolü (eğer değiştiriliyorsa)
    if category_in.slug and category_in.slug != category.slug:
        if db.query(Category).filter(Category.slug == category_in.slug).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this slug already exists"
            )
    
    update_data = category_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    db.commit()
    db.refresh(category)
    return category


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Admin = Depends(deps.get_current_active_user)
) -> Any:
    """Kategori sil (Admin only)"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Kategoriye ait etkinlik var mı kontrol et
    if category.events:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete category with associated events"
        )
    
    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}


@router.patch("/{category_id}/toggle")
def toggle_category_status(
    category_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Admin = Depends(deps.get_current_active_user)
) -> Any:
    """Kategori durumunu değiştir (Admin only)"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    category.is_active = not category.is_active
    db.commit()
    db.refresh(category)
    return category
