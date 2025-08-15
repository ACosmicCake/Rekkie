import json
import hashlib
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy.dialects.sqlite import insert

from . import models, schemas

def _hash_event_details(event: schemas.EventCreate) -> str:
    """Creates a SHA-256 hash of the event details for de-duplication."""
    canonical_representation = event.model_dump_json()
    return hashlib.sha256(canonical_representation.encode()).hexdigest()


def create_event(db: Session, event: schemas.EventCreate) -> models.Event:
    """
    Creates a new event in the database, ignoring it if it already exists
    based on the unique constraint (name, venue_name, start_time).
    Returns the final event object from the database.
    """
    # FIX: Construct the values dictionary explicitly to ensure all fields,
    # especially the 'sources' field handled by a TypeDecorator, are included.
    insert_values = {
        "name": event.name,
        "description": event.description,
        "start_time": event.start_time,
        "end_time": event.end_time,
        "category": event.category,
        "venue_name": event.venue_name,
        "venue_address": event.venue_address,
        "sources": event.sources,
        "hashed_details": _hash_event_details(event),
    }

    stmt = insert(models.Event).values(insert_values)

    stmt = stmt.on_conflict_do_nothing()

    db.execute(stmt)

    db_event = db.query(models.Event).filter(
        models.Event.name == event.name,
        models.Event.venue_name == event.venue_name,
        models.Event.start_time == event.start_time
    ).first()

    db.commit()

    return db_event


def get_events(
    db: Session,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    skip: int = 0,
    limit: int = 100
) -> list[models.Event]:
    """
    Retrieves a list of events with optional date filtering and pagination.
    """
    query = db.query(models.Event)

    if start_date:
        query = query.filter(models.Event.start_time >= start_date)

    if end_date:
        query = query.filter(models.Event.start_time <= end_date)

    return query.offset(skip).limit(limit).all()
