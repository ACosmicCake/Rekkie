from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional, Literal
from datetime import datetime


class SourceDoc(BaseModel):
    url: HttpUrl
    title: Optional[str] = None
    snippet: Optional[str] = None
    fetched_at: datetime
    confidence: float = Field(ge=0, le=1)


class Venue(BaseModel):
    venue_id: str
    name: str
    address: Optional[str] = None
    city: str
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    geohash: Optional[str] = None
    sources: List[SourceDoc] = []


class Showtime(BaseModel):
    start: datetime
    end: Optional[datetime] = None
    timezone: str


class TicketInfo(BaseModel):
    currency: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    availability: Optional[Literal["available", "limited", "sold_out", "unknown"]] = "unknown"
    purchase_url: Optional[HttpUrl] = None
    rating_at_showtime: Optional[float] = None  # only when applicable (e.g., movie ratings)


class Event(BaseModel):
    event_id: str  # internal UUID
    external_ids: List[str] = []  # keys from providers
    title: str
    description: Optional[str] = None
    categories: List[str] = []  # ["concert","film","go_club","chess","theater",...]
    tags: List[str] = []
    artists: List[str] = []
    related_entities: List[str] = []  # e.g., “like: Radiohead”, “similar_to: …”
    city: str
    country: str
    venue: Venue
    showtimes: List[Showtime]
    ticket: Optional[TicketInfo] = None
    images: List[HttpUrl] = []
    sources: List[SourceDoc]
    discovered_at: datetime
    last_verified_at: datetime
    canonical_fingerprint: str  # see de-dup rules
    quality_score: float  # 0..1 based on freshness, source richness, completeness


class Preference(BaseModel):
    user_id: str
    liked_genres: List[str] = []
    liked_artists: List[str] = []
    liked_venues: List[str] = []
    disliked_artists: List[str] = []
    disliked_venues: List[str] = []
    neighborhoods: List[str] = []
    price_ceiling: Optional[float] = None
    time_windows: List[str] = []  # e.g., ["weeknights","weekends","after_20:00"]
    blacklist_terms: List[str] = []


class Interaction(BaseModel):
    user_id: str
    event_id: str
    action: Literal["impression", "click", "save", "dismiss", "like", "dislike", "share", "buy"]
    ts: datetime


class User(BaseModel):
    user_id: str
    email: str

class UserCreate(User):
    password: str

class UserRegister(BaseModel):
    email: str
    password: str
