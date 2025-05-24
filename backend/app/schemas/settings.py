from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime


class SettingsBase(BaseModel):
    site_name: Optional[str] = "İstanbul Üniversitesi Kampüs Etkinlikleri"
    about_content: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    mission: Optional[str] = None
    vision: Optional[str] = None
    faqs: Optional[List[Dict[str, str]]] = None
    features: Optional[List[Dict[str, str]]] = None
    club_info_steps: Optional[List[Dict[str, Any]]] = None


class SettingsUpdate(SettingsBase):
    pass


class Settings(SettingsBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
