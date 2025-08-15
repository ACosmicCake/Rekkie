from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from .. import schemas
from ..db import models
from ..db.database import get_db
from .. import services
from backend.cache import get_from_cache, set_in_cache

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

    events = db.query(models.Event).order_by(models.Event.start_time.desc()).limit(100).all()

    # Schemas need to be converted to dicts to be json serializable
    events_dict = [schemas.EventRead.from_orm(event).model_dump(mode='json') for event in events]
    set_in_cache(cache_key, events_dict, ttl=600) # Cache for 10 minutes

    return events


@router.get("/recommendations/{user_id}", response_model=List[schemas.EventRead])
def get_recommendations(user_id: str, db: Session = Depends(get_db)):
    """
    Retrieves personalized event recommendations for a user.
    """
    cache_key = f"recommendations:{user_id}"
    cached_recommendations = get_from_cache(cache_key)
    if cached_recommendations:
        return cached_recommendations

    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_interests = [interest.value.lower() for interest in user.interests]
    if not user_interests:
        return []

    dismissed_event_ids = (
        db.query(models.UserEventInteraction.event_id)
        .filter(
            models.UserEventInteraction.user_id == user_id,
            models.UserEventInteraction.interaction_type == "dismissed",
        )
        .all()
    )
    dismissed_event_ids = [event_id for (event_id,) in dismissed_event_ids]

    search_conditions = []
    for interest in user_interests:
        search_conditions.append(models.Event.event_type.ilike(f"%{interest}%"))
        search_conditions.append(models.Event.name.ilike(f"%{interest}%"))
        search_conditions.append(models.Event.description.ilike(f"%{interest}%"))

    recommended_events = (
        db.query(models.Event)
        .filter(or_(*search_conditions))
        .filter(models.Event.event_id.notin_(dismissed_event_ids))
        .limit(20)
        .all()
    )

    events_dict = [schemas.EventRead.from_orm(event).model_dump(mode='json') for event in recommended_events]
    set_in_cache(cache_key, events_dict, ttl=1800) # Cache for 30 minutes

    return recommended_events


@router.get("/wildcard", response_model=List[schemas.EventRead])
def get_wildcard_events(db: Session = Depends(get_db)):
    """
    Retrieves a few random events to encourage discovery.
    """
    cache_key = "wildcard_events"
    cached_events = get_from_cache(cache_key)
    if cached_events:
        return cached_events

    wildcard_events = db.query(models.Event).order_by(func.random()).limit(5).all()

    events_dict = [schemas.EventRead.from_orm(event).model_dump(mode='json') for event in wildcard_events]
    set_in_cache(cache_key, events_dict, ttl=3600) # Cache for 1 hour

    return wildcard_events


@router.get("/search", response_model=List[schemas.EventRead])
def search_events(q: str, db: Session = Depends(get_db)):
    """
    Searches for events based on a query string.
    """
    if not q:
        return []

    cache_key = f"search:{q}"
    cached_results = get_from_cache(cache_key)
    if cached_results:
        return cached_results

    search_query = f"%{q}%"

    search_results = (
        db.query(models.Event)
        .filter(
            or_(
                models.Event.name.ilike(search_query),
                models.Event.description.ilike(search_query),
                models.Event.location_name.ilike(search_query),
                models.Event.event_type.ilike(search_query),
            )
        )
        .limit(50)
        .all()
    )

    results_dict = [schemas.EventRead.from_orm(event).model_dump(mode='json') for event in search_results]
    set_in_cache(cache_key, results_dict, ttl=600) # Cache for 10 minutes

    return search_results
