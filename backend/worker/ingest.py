import json
import argparse
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

# It's better to configure the python path or have a proper package structure
# but for now, this will work.
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

from backend.services.gemini import find_events
from backend.database import SessionLocal, engine
from backend.tables import Event as EventTable, Base
from backend.models import Event as EventPydantic


def run_ingestion(city: str, start: str, end: str):
    """
    Runs the ingestion process for a given city and date range.
    """
    print(f"Starting ingestion for {city} from {start} to {end}...")

    db = SessionLocal()
    try:
        events: list[EventPydantic] = find_events(city, start, end)
        print(f"Found {len(events)} events from Gemini.")
    except Exception as e:
        print(f"Failed to fetch events from Gemini: {e}")
        return
    finally:
        # We found the events, now we can close the session if we opened it just for this.
        # But find_events doesn't use the db, so we are good.
        pass

    try:
        for event in events:
            # The Pydantic model has nested models. We need to convert them to dicts
            # for the JSONB columns in the SQLAlchemy model.
            event_dict = event.model_dump()

            db_event = EventTable(
                event_id=event.event_id,
                external_ids=event_dict.get("external_ids"),
                title=event.title,
                description=event.description,
                categories=event_dict.get("categories"),
                tags=event_dict.get("tags"),
                artists=event_dict.get("artists"),
                related_entities=event_dict.get("related_entities"),
                city=event.city,
                country=event.country,
                venue=event_dict.get("venue"),
                showtimes=event_dict.get("showtimes"),
                ticket=event_dict.get("ticket"),
                images=event_dict.get("images"),
                sources=event_dict.get("sources"),
                discovered_at=event.discovered_at,
                last_verified_at=event.last_verified_at,
                canonical_fingerprint=event.canonical_fingerprint,
                quality_score=event.quality_score,
            )

            try:
                db.add(db_event)
                db.commit()
                print(f"Successfully ingested event: {event.title}")
            except IntegrityError:
                db.rollback()
                print(f"Event already exists, skipping: {event.title}")
            except Exception as e:
                db.rollback()
                print(f"Failed to ingest event {event.title}: {e}")
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Run the event ingestion worker.")
    parser.add_argument("--city", type=str, required=True, help="City to search for events.")
    parser.add_argument("--start", type=str, required=True, help="Start date (YYYY-MM-DD).")
    parser.add_argument("--end", type=str, required=True, help="End date (YYYY-MM-DD).")
    args = parser.parse_args()

    # Create tables if they don't exist.
    # In a real application, this would be handled by Alembic migrations.
    Base.metadata.create_all(bind=engine)

    run_ingestion(args.city, args.start, args.end)


if __name__ == "__main__":
    main()
