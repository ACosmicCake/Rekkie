from sqlalchemy import (
    Boolean, Column, Integer, String, Text, DateTime, Enum as SQLAlchemyEnum,
    ForeignKey, JSON
)
from sqlalchemy.orm import relationship
import enum

from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    profile = relationship("UserProfile", back_populates="user", uselist=False)
    interactions = relationship("UserEventInteraction", back_populates="user")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    location_city = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    positive_preferences = Column(JSON, nullable=True) # List of strings
    negative_preferences = Column(JSON, nullable=True) # List of strings

    user = relationship("User", back_populates="profile")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    unique_identifier = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    venue_name = Column(String, nullable=False)
    venue_address = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    category_llm = Column(String, nullable=False)
    details = Column(JSON, nullable=True)
    source_url = Column(String, nullable=False)
    is_wildcard = Column(Boolean, default=False)

    interactions = relationship("UserEventInteraction", back_populates="event")


class InteractionStatus(enum.Enum):
    SAVED = "SAVED"
    DISLIKED = "DISLIKED"

class UserEventInteraction(Base):
    __tablename__ = "user_event_interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    status = Column(SQLAlchemyEnum(InteractionStatus), nullable=False)

    user = relationship("User", back_populates="interactions")
    event = relationship("Event", back_populates="interactions")
