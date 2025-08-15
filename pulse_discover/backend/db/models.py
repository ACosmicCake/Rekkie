import uuid
import enum
import json
from sqlalchemy import (
    create_engine,
    Column,
    String,
    Float,
    DateTime,
    Text,
    ForeignKey,
    Enum,
    TypeDecorator,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql import func
from sqlalchemy.types import UUID as UUID_TYPE

Base = declarative_base()

# Custom TypeDecorators to handle types not supported by SQLite
class JsonEncoded(TypeDecorator):
    """Enables JSON storage by encoding and decoding on the fly."""
    impl = Text

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        return json.dumps(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        return json.loads(value)

# Use postgresql JSONB if available, otherwise use the custom JsonEncoded type
JSONB_TYPE = JSONB().with_variant(JsonEncoded, "sqlite")


class User(Base):
    __tablename__ = "users"

    user_id = Column(UUID_TYPE(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    interests = relationship("UserInterest", back_populates="user")
    interactions = relationship("UserEventInteraction", back_populates="user")


class UserInterest(Base):
    __tablename__ = "user_interests"

    interest_id = Column(UUID_TYPE(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID_TYPE(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    category = Column(String, nullable=False)
    value = Column(String, nullable=False)
    preference_score = Column(Float, default=1.0)

    user = relationship("User", back_populates="interests")


class Event(Base):
    __tablename__ = "events"

    event_id = Column(UUID_TYPE(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    location_name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    city = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    ticket_price_min = Column(Float, nullable=True)
    ticket_price_max = Column(Float, nullable=True)
    ticket_link = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    event_type = Column(String, nullable=False)
    source_urls = Column(JsonEncoded, nullable=True)  # Use JsonEncoded for ARRAY
    raw_json_data = Column(JSONB_TYPE, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    interactions = relationship("UserEventInteraction", back_populates="event")


class InteractionType(enum.Enum):
    SAVED = "saved"
    DISMISSED = "dismissed"
    ATTENDED = "attended"


class UserEventInteraction(Base):
    __tablename__ = "user_event_interactions"

    interaction_id = Column(UUID_TYPE(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID_TYPE(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    event_id = Column(UUID_TYPE(as_uuid=True), ForeignKey("events.event_id"), nullable=False)
    interaction_type = Column(Enum(InteractionType), nullable=False)
    feedback_score = Column(Float, nullable=True)
    interaction_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="interactions")
    event = relationship("Event", back_populates="interactions")
