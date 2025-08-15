from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from .. import schemas
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
