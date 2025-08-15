from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# Gemini API Schemas
class EventDetail(BaseModel):
    title: str = Field(description="The official title of the event.")
    venue_name: str = Field(description="The name of the location or venue.")
    venue_address: str = Field(description="The full street address of the venue.")
    start_time: str = Field(description="The start date and time of the event in ISO 8601 format.")
    description: str = Field(description="A concise, engaging description of the event.")
    category_llm: str = Field(description="A specific, descriptive category for this event, e.g., 'Live Jazz Music', 'Amateur Chess Tournament', 'Independent Film Screening'.")
    source_url: str = Field(description="The direct URL to the source page confirming the event details.")
    details: Optional[Dict[str, Any]] = Field(description="A dictionary for specific data, e.g., {'showtimes': ['7 PM', '9 PM'], 'ratings': '88%'} or {'ticket_status': 'Available'}.")

class EventRecommendations(BaseModel):
    personalized_events: List[EventDetail] = Field(description="A list of events tailored to the user's positive preferences.")
    wildcard_event: Optional[EventDetail] = Field(description="One single event that is intentionally outside the user's typical interests, meant to encourage discovery. Frame its description to be intriguing.")


# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

# User Profile Schemas
class UserProfileBase(BaseModel):
    location_city: Optional[str] = None
    age: Optional[int] = None
    positive_preferences: Optional[List[str]] = []
    negative_preferences: Optional[List[str]] = []

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileUpdate(UserProfileBase):
    pass

class UserProfile(UserProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


# Event Schemas
class EventBase(BaseModel):
    title: str
    description: str
    venue_name: str
    venue_address: str
    start_time: datetime
    end_time: Optional[datetime] = None
    category_llm: str
    details: Optional[Dict[str, Any]] = None
    source_url: str
    is_wildcard: bool = False

class EventCreate(EventBase):
    unique_identifier: str

class Event(EventBase):
    id: int
    unique_identifier: str

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

from .models import InteractionStatus

class TokenData(BaseModel):
    email: Optional[str] = None

# Interaction Schemas
class InteractionBase(BaseModel):
    event_id: int
    status: InteractionStatus

class InteractionCreate(InteractionBase):
    pass

class Interaction(InteractionBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
