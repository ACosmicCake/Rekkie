from datetime import datetime
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session

from .. import crud, schemas, services
from ..database import get_db

router = APIRouter(
    prefix="/events",
    tags=["events"],
)

@router.post("/discover", response_model=list[schemas.Event])
def discover_and_save_events(
    user_preferences: dict = Body(
        ...,
        examples=[{
            "location": "New York City",
            "interests": ["live music", "jazz", "art exhibitions"],
            "price_range": "free"
        }]
    ),
    db: Session = Depends(get_db)
):
    """
    Triggers the AI service to discover new events based on user preferences,
    saves them to the database, and returns the discovered events.

    De-duplication is handled at the database level.
    """
    # Phase 2: Call the AI service
    discovered_events_data = services.discover_events(user_preferences)

    # Phase 3: Persistence
    saved_events = []
    for event_data in discovered_events_data:
        # The crud function handles creation and de-duplication
        db_event = crud.create_event(db=db, event=event_data)
        if db_event:
            saved_events.append(db_event)

    return saved_events


@router.get("/", response_model=list[schemas.Event])
def read_events(
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieves events from the database with optional date filtering and pagination.
    """
    events = crud.get_events(
        db, start_date=start_date, end_date=end_date, skip=skip, limit=limit
    )
    return events
