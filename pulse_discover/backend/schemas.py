from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
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

# Schemas for Gemini API Event Data
class EventDetails(BaseModel):
    name: str = Field(..., description="Name of the event.")
    description: str = Field(..., description="Detailed description of the event.")
    start_time: str = Field(..., description="ISO 8601 formatted start datetime of the event.")
    end_time: Optional[str] = Field(None, description="ISO 8601 formatted end datetime of the event, if applicable.")
    location_name: str = Field(..., description="Name of the venue or location.")
    address: str = Field(..., description="Full street address of the event location.")
    city: str = Field(..., description="City where the event is taking place.")
    ticket_price_range: Optional[str] = Field(None, description="Estimated ticket price range (e.g., '$20-$50' or 'Free').")
    ticket_link: Optional[str] = Field(None, description="Direct URL to purchase tickets or register.")
    image_url: Optional[str] = Field(None, description="URL to a high-quality image of the event or venue.")
    event_type: str = Field(..., description="Category or type of the event (e.g., 'Live Music', 'Art Exhibition', 'Workshop', 'Film Screening', 'Sports Event', 'Meetup').")
    source_urls: List[str] = Field(..., description="List of URLs from where the information was sourced (e.g., official venue website, ticketing platform).")
    additional_details: Optional[dict] = Field(None, description="A dictionary for category-specific details, e.g., {'genre': 'Jazz', 'artist': 'John Coltrane'} for music.")

class EventList(BaseModel):
    events: List[EventDetails] = Field(..., description="A list of discovered events.")

# Schema for reading event data from the DB
class EventRead(BaseModel):
    event_id: uuid.UUID
    name: str
    description: str
    start_time: datetime.datetime
    end_time: Optional[datetime.datetime] = None
    location_name: str
    address: str
    city: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    ticket_price_min: Optional[float] = None
    ticket_price_max: Optional[float] = None
    ticket_link: Optional[str] = None
    image_url: Optional[str] = None
    event_type: str
    source_urls: Optional[List[str]] = None
    raw_json_data: Optional[dict] = None
    created_at: datetime.datetime
    updated_at: Optional[datetime.datetime] = None

    model_config = {
        "from_attributes": True,
    }

class EventReadList(BaseModel):
    events: List[EventRead]
