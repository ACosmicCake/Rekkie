from pydantic import BaseModel, EmailStr
from typing import Optional
import uuid
import datetime

# Base schema for user attributes
class UserBase(BaseModel):
    username: str
    email: EmailStr

# Schema for creating a new user
class UserCreate(UserBase):
    password: str

# Schema for reading user data (from DB)
class UserRead(UserBase):
    user_id: uuid.UUID
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None

    model_config = {
        "from_attributes": True,
    }
