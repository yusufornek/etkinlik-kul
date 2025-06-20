from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class ContentRequest(Base):
    __tablename__ = "content_requests"

    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id"), nullable=False)
    event_data = Column(JSON, nullable=False) # Could store a JSON representation of the event to be created
    status = Column(String, default="pending") # E.g., "pending", "approved", "rejected"
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewer_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Admin/SuperAdmin who reviewed

    club = relationship("Club", back_populates="content_requests")
    reviewer = relationship("User", back_populates="reviewed_requests", foreign_keys=[reviewer_id])
