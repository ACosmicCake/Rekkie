import datetime
import json
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    UniqueConstraint,
    Text,
    TypeDecorator
)
from sqlalchemy.orm import DeclarativeBase

# Custom Type for storing lists as JSON strings in the database
class JSONEncodedList(TypeDecorator):
    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):
        """
        Receives a Python list and serializes it to a JSON string.
        The `default=str` argument handles non-standard types like HttpUrl.
        """
        if value is not None:
            value = json.dumps(value, default=str)
        return value

    def process_result_value(self, value, dialect):
        """
        Receives a JSON string from the DB and deserializes it to a Python list.
        """
        if value is not None:
            value = json.loads(value)
        return value

class Base(DeclarativeBase):
    pass

class Event(Base):
    __tablename__ = "events"

    id: int = Column(Integer, primary_key=True, index=True)
    name: str = Column(String, index=True, nullable=False)
    description: str = Column(Text, nullable=False)
    start_time: datetime.datetime = Column(DateTime(timezone=True), nullable=False)
    end_time: datetime.datetime | None = Column(DateTime(timezone=True))
    category: str = Column(String, nullable=False)
    venue_name: str = Column(String, nullable=False)
    venue_address: str = Column(String, nullable=False)
    sources: list[str] = Column(JSONEncodedList, nullable=False)
    hashed_details: str = Column(String, nullable=False)

    __table_args__ = (
        UniqueConstraint('name', 'venue_name', 'start_time', name='_name_venue_start_uc'),
    )
