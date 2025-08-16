from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_
from .. import schemas
from ..db import models
from ..db.database import get_db
from .. import services
from ..cache import get_from_cache, set_to_cache
from ..security import get_current_user

router = APIRouter(
    prefix="/events",
    tags=["events"],
)

class IngestRequest(schemas.BaseModel):
    city: str
    user_preferences: List[str]
    max_events: int = 10

@router.post("/ingest")
def ingest_events(request: IngestRequest, db: Session = Depends(get_db)):
    """
    Triggers the ingestion of events for a given city and user preferences.
    """
    new_events_count = services.ingest_and_store_events(
        db=db,
        city=request.city,
        user_preferences=request.user_preferences,
        max_events=request.max_events,
    )
    return {"message": f"Successfully ingested {new_events_count} new events."}

@router.get("/", response_model=List[schemas.EventRead])
def get_events(db: Session = Depends(get_db)):
    """
    Retrieves all events from the database.
    """
    cache_key = "all_events"
    cached_events = get_from_cache(cache_key)
    if cached_events:
        return cached_events

    events = db.query(models.Event).all()
    set_to_cache(cache_key, [event.as_dict() for event in events])
    return events


@router.get("/recommendations", response_model=List[schemas.EventRead])
def get_recommendations(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    """
    Retrieves personalized event recommendations for the current user based on a weighted scoring model.
    """
    cache_key = f"recommendations:{current_user.user_id}"
    cached_recommendations = get_from_cache(cache_key)
    if cached_recommendations:
        return cached_recommendations

    user = current_user
    if not user.interests:
        return []

    # Get events dismissed by the user
    dismissed_event_ids = [
        interaction.event_id
        for interaction in user.interactions
        if interaction.interaction_type.value == "dismissed"
    ]

    # Fetch all events not dismissed by the user
    events = db.query(models.Event).filter(models.Event.event_id.notin_(dismissed_event_ids)).all()

    scored_events = []
    for event in events:
        score = 0
        for interest in user.interests:
            interest_value = interest.value.lower()
            # Higher score for matching event type or name
            if interest_value in event.event_type.lower():
                score += 3
            if interest_value in event.name.lower():
                score += 3
            # Lower score for matching description
            if interest_value in event.description.lower():
                score += 1
            # Score for matching raw json data
            if event.raw_json_data:
                raw_data_str = str(event.raw_json_data).lower()
                if interest_value in raw_data_str:
                    score += 2

        if score > 0:
            scored_events.append({"event": event, "score": score})

    # Sort events by score in descending order
    sorted_events = sorted(scored_events, key=lambda x: x["score"], reverse=True)

    # Return the event objects from the sorted list
    recommended_events = [item["event"] for item in sorted_events]

    # Cache the results
    set_to_cache(cache_key, [event.as_dict() for event in recommended_events])

    return recommended_events


@router.get("/wildcard", response_model=List[schemas.EventRead])
def get_wildcard(db: Session = Depends(get_db)):
    """
    Retrieves a random selection of events for the discovery feature.
    """
    cache_key = "wildcard_events"
    cached_events = get_from_cache(cache_key)
    if cached_events:
        return cached_events

    events = services.get_wildcard_events(db=db, limit=5)
    set_to_cache(cache_key, [event.as_dict() for event in events], ttl=1800)  # Cache for 30 minutes
    return events


@router.get("/search", response_model=List[schemas.EventRead])
def search_events(
    db: Session = Depends(get_db),
    keyword: Optional[str] = Query(None, min_length=2),
    start_date: Optional[datetime.date] = None,
    end_date: Optional[datetime.date] = None,
    location: Optional[str] = None,
    event_type: Optional[str] = None,
):
    """
    Searches for events based on various criteria.
    """
    cache_key = f"search:{keyword}:{start_date}:{end_date}:{location}:{event_type}"
    cached_results = get_from_cache(cache_key)
    if cached_results:
        return cached_results

    query = db.query(models.Event)

    if keyword:
        query = query.filter(
            or_(
                models.Event.name.ilike(f"%{keyword}%"),
                models.Event.description.ilike(f"%{keyword}%"),
            )
        )

    if start_date:
        query = query.filter(models.Event.start_time >= start_date)

    if end_date:
        # Add one day to the end_date to include events on that day
        query = query.filter(models.Event.start_time < (end_date + datetime.timedelta(days=1)))

    if location:
        query = query.filter(models.Event.city.ilike(f"%{location}%"))

    if event_type:
        query = query.filter(models.Event.event_type.ilike(f"%{event_type}%"))

    events = query.all()
    set_to_cache(cache_key, [event.as_dict() for event in events])
    return events
