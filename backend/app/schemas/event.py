from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .category import Category


class EventBase(BaseModel):
    title: str
    description: str
    date: str
    time: str
    location: str
    organizer: str
    category_id: int
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    requires_registration: bool = False
    registration_link: Optional[str] = None
    is_active: bool = True
    is_featured: bool = False


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    location: Optional[str] = None
    organizer: Optional[str] = None
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    requires_registration: Optional[bool] = None
    registration_link: Optional[str] = None
    category_id: Optional[int] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None


class Event(EventBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category: Category  # Kategori bilgisi de döneceğiz
    
    class Config:
        from_attributes = True


class EventList(BaseModel):
    """Liste görünümü için basitleştirilmiş event"""
    id: int
    title: str
    description: str
    date: str
    time: str
    location: str
    category: Category
    image_url: Optional[str] = None
    organizer: str
    
    class Config:
        from_attributes = True
