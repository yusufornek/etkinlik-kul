from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime, timedelta
from ..core.database import Base


class Story(Base):
    __tablename__ = "stories"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    image_url = Column(String, nullable=False)
    link_url = Column(String, nullable=True)  # Tıklandığında yönlendirilecek URL
    order_index = Column(Integer, default=0)  # Sıralama için
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(hours=24))
    
    @property
    def is_expired(self):
        """Story'nin süresi dolmuş mu kontrol et"""
        return datetime.utcnow() > self.expires_at
