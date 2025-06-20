from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Form(Base):
    __tablename__ = "forms"

    id = Column(Integer, primary_key=True, index=True)
    club_id = Column(Integer, ForeignKey("clubs.id"), nullable=False)
    # event_id = Column(Integer, ForeignKey("events.id"), nullable=True) # Optional: Link form to a specific event
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    fields_json = Column(JSON, nullable=False) # Stores the structure of the form fields
    is_active = Column(Boolean, default=False, index=True) # Default to False, activate when ready
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_onupdate=func.now())

    club = relationship("Club") # Relationship to Club model
    # event = relationship("Event") # Optional: Relationship to Event model
    applications = relationship("Application", back_populates="form", cascade="all, delete-orphan")

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey("forms.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False) # User who submitted the application
    status = Column(String, default="submitted", index=True) # e.g., submitted, under_review, accepted, rejected
    data_json = Column(JSON, nullable=False) # Stores the actual submitted data
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())

    form = relationship("Form", back_populates="applications")
    submitter = relationship("User") # Relationship to User model
    application_files = relationship("ApplicationFile", back_populates="application", cascade="all, delete-orphan")

class ApplicationFile(Base):
    __tablename__ = "application_files"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    file_path = Column(String, nullable=False) # Path to the stored file
    file_type = Column(String, nullable=True) # MIME type
    original_file_name = Column(String, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    application = relationship("Application", back_populates="application_files")
