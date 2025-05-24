from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class StoryBase(BaseModel):
    title: str
    image_url: str
    link_url: Optional[str] = None
    order_index: int = 0
    is_active: bool = True


class StoryCreate(StoryBase):
    pass


class StoryUpdate(BaseModel):
    title: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None


class Story(StoryBase):
    id: int
    created_at: datetime
    expires_at: datetime
    is_expired: bool
    
    class Config:
        from_attributes = True
