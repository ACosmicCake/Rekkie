from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from . import schemas
from .llm import gemini
from .db import models

def ingest_and_store_events(db: Session, city: str, user_preferences: List[str], max_events: int = 10):
    """
    Fetches events from the LLM, de-duplicates them, and stores new events in the database.
    Returns the number of new events added.
    """
    try:
        event_list = gemini.fetch_events_with_grounding(
            city=city,
            user_preferences=user_preferences,
            max_events=max_events,
        )
    except Exception as e:
        # In a real app, we would have more sophisticated logging and error handling
        print(f"Error fetching events from LLM: {e}")
        return 0

    new_events_count = 0
    for event_data in event_list.events:
        # De-duplication check
        # Handle 'Z' for UTC timezone correctly
        start_time_obj = datetime.fromisoformat(event_data.start_time.replace('Z', '+00:00'))

        existing_event = db.query(models.Event).filter(
            models.Event.name == event_data.name,
            models.Event.start_time == start_time_obj,
            models.Event.location_name == event_data.location_name
        ).first()

        if not existing_event:
            # Manually map fields from Pydantic schema to SQLAlchemy model
            # to handle mismatched fields like 'ticket_price_range'.
            # TODO: Implement parsing for ticket_price_range and mapping for additional_details.
            event_dict = event_data.model_dump(exclude={'ticket_price_range', 'additional_details'})
            event_dict['start_time'] = start_time_obj # Use the parsed datetime object

            # Handle potential None for end_time
            if event_data.end_time:
                event_dict['end_time'] = datetime.fromisoformat(event_data.end_time.replace('Z', '+00:00'))

            new_event = models.Event(**event_dict)
            db.add(new_event)
            new_events_count += 1

    if new_events_count > 0:
        db.commit()

    return new_events_count
