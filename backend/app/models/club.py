from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Club(Base):
    __tablename__ = "clubs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=True)
    logo = Column(String, nullable=True)
    contact_info = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_onupdate=func.now())

    members = relationship("ClubMember", back_populates="club")
    content_requests = relationship("ContentRequest", back_populates="club")
    club_specific_roles = relationship("UserRole", back_populates="club", foreign_keys="[UserRole.club_id]")

class ClubMember(Base):
    __tablename__ = "club_members"

    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False) # E.g., "member", "officer", "president"
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    club = relationship("Club", back_populates="members")
    user = relationship("User", back_populates="club_memberships")
