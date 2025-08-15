from .celery_app import celery_app
from .db.database import SessionLocal
from . import services
from typing import List

@celery_app.task
def ingest_events_task(city: str, user_preferences: List[str], max_events: int = 10):
    """
    Celery task to ingest events in the background.
    """
    db = SessionLocal()
    try:
        services.ingest_and_store_events(
            db=db,
            city=city,
            user_preferences=user_preferences,
            max_events=max_events,
        )
    finally:
        db.close()
