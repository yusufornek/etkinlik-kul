from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class AdminLogin(BaseModel):
    username: str
    password: str


class AdminBase(BaseModel):
    username: str


class AdminCreate(AdminBase):
    password: str


class Admin(AdminBase):
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True


class AdminInDB(Admin):
    hashed_password: str
