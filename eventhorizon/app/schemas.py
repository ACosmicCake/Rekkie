from pydantic import BaseModel, HttpUrl, ConfigDict
from datetime import datetime

class Venue(BaseModel):
    name: str
    address: str

class EventBase(BaseModel):
    name: str
    description: str
    start_time: datetime
    end_time: datetime | None = None
    category: str

class EventCreate(EventBase):
    venue_name: str
    venue_address: str
    sources: list[HttpUrl] # FIX: Added the missing sources field

class Event(EventBase):
    id: int
    venue_name: str
    venue_address: str
    sources: list[HttpUrl]

    # Use ConfigDict for Pydantic v2
    model_config = ConfigDict(from_attributes=True)
