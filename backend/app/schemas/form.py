from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime
# Assuming UserRead will be imported using forward reference or direct import if no circularity
# from .user import UserRead

# Schema for individual fields within a form's fields_json
class FormFieldSchema(BaseModel):
    name: str # Internal name for the field, e.g., 'email_address'
    label: str # User-visible label, e.g., 'Email Address'
    type: str # E.g., 'text', 'email', 'textarea', 'select', 'checkbox', 'radio', 'file', 'date'
    required: bool = False
    options: Optional[List[str]] = None # For select, radio, checkbox
    placeholder: Optional[str] = None
    # Add other properties like validation regex, min/max length, etc. as needed

class FormBase(BaseModel):
    name: str
    description: Optional[str] = None
    fields_json: List[FormFieldSchema] # Defines the structure of the form
    is_active: bool = False
    # event_id: Optional[int] = None # If forms can be linked to events

class FormCreate(FormBase):
    club_id: int # Club that owns this form

class FormUpdate(BaseModel): # Allow partial updates
    name: Optional[str] = None
    description: Optional[str] = None
    fields_json: Optional[List[FormFieldSchema]] = None
    is_active: Optional[bool] = None
    # event_id: Optional[int] = None

class FormRead(FormBase):
    id: int
    club_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Schemas for Application Files
class ApplicationFileBase(BaseModel):
    file_type: Optional[str] = None
    original_file_name: Optional[str] = None

class ApplicationFileCreate(ApplicationFileBase):
    # file_path is usually determined by the server upon upload, not by client
    # Client might send file name and type, server generates path
    # This schema might be more for reading than direct creation by client with path
    file_path: str # Path where the file is stored (server-side)

class ApplicationFileRead(ApplicationFileBase):
    id: int
    application_id: int
    file_path: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

# Schemas for Applications (Form Submissions)
class ApplicationBase(BaseModel):
    # data_json will store key-value pairs corresponding to form field names and their submitted values
    data_json: Dict[str, Any]

class ApplicationCreate(ApplicationBase):
    # form_id and user_id will typically come from path parameters and authenticated user
    pass

class ApplicationUpdateStatus(BaseModel):
    status: str # e.g., 'under_review', 'accepted', 'rejected'

class ApplicationRead(ApplicationBase):
    id: int
    form_id: int
    user_id: int
    status: str
    submitted_at: datetime
    submitter: Optional['schemas.user.UserRead'] = None # Populate user details using forward reference
    application_files: List[ApplicationFileRead] = [] # Populate submitted files

    class Config:
        from_attributes = True

# Pydantic v2 automatically handles forward references in many cases when models are defined.
# Explicit .model_rebuild() might only be needed for complex scenarios or Pydantic v1.
# For now, we assume Pydantic v2 handles it, or FastAPI will trigger it.
# If issues arise, uncomment and ensure they are at the very end of the file.
# ApplicationRead.model_rebuild()
# FormRead.model_rebuild() # Only if FormRead itself uses forward refs, which it doesn't here.
