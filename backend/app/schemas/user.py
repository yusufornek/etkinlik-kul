from pydantic import BaseModel, EmailStr
from typing import Optional, List # Added List
from datetime import datetime
# Ensure UserRoleRead is importable. Using forward reference as string.
# from .user_role import UserRoleRead # This would be direct import

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    student_id: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    student_id: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None # Allow password updates

class UserRead(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    roles: List['schemas.user_role.UserRoleRead'] = [] # Forward reference

    class Config:
        from_attributes = True

# If using Pydantic V2, model_rebuild can be called globally by FastAPI/Pydantic
# or explicitly if needed after all definitions:
UserRead.model_rebuild()
