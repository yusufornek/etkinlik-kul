from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func

from ..core.database import Base


class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    site_name = Column(String(255), default="İstanbul Üniversitesi Kampüs Etkinlikleri")
    about_content = Column(Text, nullable=True)
    contact_email = Column(String(255), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    mission = Column(Text, nullable=True)
    vision = Column(Text, nullable=True)
    faqs = Column(JSON, nullable=True, default=list)  # [{"question": "...", "answer": "..."}]
    features = Column(JSON, nullable=True, default=list)  # [{"icon": "...", "title": "...", "description": "..."}]
    club_info_steps = Column(JSON, nullable=True, default=list)  # [{"step": 1, "title": "...", "description": "..."}]
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
