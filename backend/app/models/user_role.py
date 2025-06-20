from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
from app.core.roles import RoleType

class UserRole(Base):
    __tablename__ = "user_roles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_type = Column(Enum(RoleType), nullable=False)
    club_id = Column(Integer, ForeignKey("clubs.id"), nullable=True) # Nullable if not a club-specific role
    granted_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="roles")
    club = relationship("Club", back_populates="club_specific_roles", foreign_keys=[club_id])
