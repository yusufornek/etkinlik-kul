from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
# from .user import UserRead # Using forward reference for UserRead in ClubMemberRead

class ClubBase(BaseModel):
    name: str
    description: Optional[str] = None
    logo: Optional[str] = None
    contact_info: Optional[str] = None
    is_active: bool = True

class ClubCreate(ClubBase):
    pass

class ClubUpdate(ClubBase):
    name: Optional[str] = None # Allow partial updates
    description: Optional[str] = None
    logo: Optional[str] = None
    contact_info: Optional[str] = None
    is_active: Optional[bool] = None

class ClubRead(ClubBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    # members: List[UserRead] = [] # Example for later if needed

    class Config:
        from_attributes = True

# Schemas for ClubMember
class ClubMemberBase(BaseModel):
    # club_id: int # Usually defined by path parameter or context
    user_id: int
    role: str # E.g., "member", "officer", "president"

class ClubMemberCreate(ClubMemberBase):
    pass

class ClubMemberRead(ClubMemberBase):
    id: int
    club_id: int # Include club_id for clarity
    joined_at: datetime
    user: Optional['schemas.user.UserRead'] = None # Forward reference for user details

    class Config:
        from_attributes = True

# If using Pydantic V2, model_rebuild can be called globally by FastAPI/Pydantic
# or explicitly if needed after all definitions:
ClubMemberRead.model_rebuild()
# ClubRead.model_rebuild() # Only if ClubRead also uses forward references. Currently, it does not.
