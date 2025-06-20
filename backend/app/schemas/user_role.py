from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.core.roles import RoleType

class UserRoleBase(BaseModel):
    user_id: int
    role_type: RoleType
    club_id: Optional[int] = None # Required if role_type is "club_manager"

class UserRoleCreate(UserRoleBase):
    pass

class UserRoleRead(UserRoleBase):
    id: int
    granted_at: datetime

    class Config:
        from_attributes = True
