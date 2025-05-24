from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..core.database import Base


class Event(Base):
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    date = Column(String, nullable=False)  # YYYY-MM-DD formatında
    time = Column(String, nullable=False)  # HH:MM formatında
    location = Column(String, nullable=False)
    organizer = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    
    # Harita koordinatları
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(Text, nullable=True)
    
    # Kayıt bilgileri
    requires_registration = Column(Boolean, default=False)
    registration_link = Column(String, nullable=True)
    
    # Kategori ilişkisi
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    category = relationship("Category", back_populates="events")
    
    # Durum ve tarihler
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
