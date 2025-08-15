from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from .. import schemas
from ..db import models
from ..db.database import get_db
from .. import services

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
    events = db.query(models.Event).all()
    return events


@router.get("/recommendations/{user_id}", response_model=List[schemas.EventRead])
def get_recommendations(user_id: str, db: Session = Depends(get_db)):
    """
    Retrieves personalized event recommendations for a user.
    """
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_interests = [interest.value.lower() for interest in user.interests]
    if not user_interests:
        return []

    # Get events dismissed by the user
    dismissed_event_ids = (
        db.query(models.UserEventInteraction.event_id)
        .filter(
            models.UserEventInteraction.user_id == user_id,
            models.UserEventInteraction.interaction_type == "dismissed",
        )
        .all()
    )
    dismissed_event_ids = [event_id for (event_id,) in dismissed_event_ids]

    # Simple recommendation logic: find events where the event_type matches user interests
    # and the event has not been dismissed.
    # A more advanced implementation would involve a more sophisticated matching algorithm.
    recommended_events = (
        db.query(models.Event)
        .filter(
            models.Event.event_type.ilike(f"%{interest}%")
            for interest in user_interests
        )
        .filter(models.Event.event_id.notin_(dismissed_event_ids))
        .all()
    )

    return recommended_events
