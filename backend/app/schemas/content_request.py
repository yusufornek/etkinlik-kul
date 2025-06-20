from pydantic import BaseModel
from typing import Optional, Any # Any for flexible event_data
from datetime import datetime
from .club import ClubRead # For context
from .user import UserRead # For reviewer context

class ContentRequestBase(BaseModel):
    club_id: int
    event_data: Any # Store as JSON, validate structure upon processing
    status: str = "pending"

class ContentRequestCreate(ContentRequestBase):
    pass

class ContentRequestUpdate(BaseModel):
    status: str # "approved" or "rejected"
    # reviewer_id is set internally by the current_user (admin)

class ContentRequestRead(ContentRequestBase):
    id: int
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewer_id: Optional[int] = None
    club: Optional[ClubRead] = None # Optional: for richer responses
    reviewer: Optional[UserRead] = None # Optional: for richer responses

    class Config:
        from_attributes = True
