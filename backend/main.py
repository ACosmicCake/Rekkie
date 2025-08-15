from fastapi import FastAPI, BackgroundTasks
from datetime import date

# It's better to configure the python path or have a proper package structure
# but for now, this will work.
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.worker.ingest import run_ingestion
from backend.database import get_db
from backend import tables, models
from sqlalchemy.orm import Session
from backend.recommendations.content_based import get_recommendations as get_content_based_recommendations
from backend.recommendations.wildcard import get_wildcard_suggestions
from fastapi import Depends, HTTPException, status, Response
from typing import List, Optional
from backend import auth
import uuid
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from .logging_config import setup_logging
from prometheus_client import Counter, generate_latest, REGISTRY

setup_logging()
app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.post("/api/ingest/run")
def ingest_run(
    city: str,
    start_date: date,
    end_date: date,
    background_tasks: BackgroundTasks,
):
    """
    Triggers the event ingestion process in the background.
    """
    background_tasks.add_task(
        run_ingestion,
        city=city,
        start=start_date.isoformat(),
        end=end_date.isoformat(),
    )
    return {"message": "Ingestion started in the background."}


@app.get("/api/events", response_model=List[models.Event])
def get_events(
    city: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    """
    Gets a list of events from the database.
    """
    query = db.query(tables.Event)
    if city:
        query = query.filter(tables.Event.city == city)
    if start_date:
        query = query.filter(tables.Event.discovered_at >= start_date)
    if end_date:
        query = query.filter(tables.Event.discovered_at <= end_date)

    db_events = query.all()

    # The SQLAlchemy models have JSONB columns, so we need to parse them
    # before creating the Pydantic models.
    events = []
    for db_event in db_events:
        event_data = {
            "event_id": db_event.event_id,
            "external_ids": db_event.external_ids,
            "title": db_event.title,
            "description": db_event.description,
            "categories": db_event.categories,
            "tags": db_event.tags,
            "artists": db_event.artists,
            "related_entities": db_event.related_entities,
            "city": db_event.city,
            "country": db_event.country,
            "venue": db_event.venue,
            "showtimes": db_event.showtimes,
            "ticket": db_event.ticket,
            "images": db_event.images,
            "sources": db_event.sources,
            "discovered_at": db_event.discovered_at,
            "last_verified_at": db_event.last_verified_at,
            "canonical_fingerprint": db_event.canonical_fingerprint,
            "quality_score": db_event.quality_score,
        }
        events.append(models.Event.model_validate(event_data))

    return events


@app.get("/api/events/{event_id}", response_model=models.Event)
def get_event(event_id: str, db: Session = Depends(get_db)):
    """
    Gets a single event by its ID.
    """
    db_event = db.query(tables.Event).filter(tables.Event.event_id == event_id).first()
    if db_event is None:
        raise HTTPException(status_code=404, detail="Event not found")

    event_data = {
        "event_id": db_event.event_id,
        "external_ids": db_event.external_ids,
        "title": db_event.title,
        "description": db_event.description,
        "categories": db_event.categories,
        "tags": db_event.tags,
        "artists": db_event.artists,
        "related_entities": db_event.related_entities,
        "city": db_event.city,
        "country": db_event.country,
        "venue": db_event.venue,
        "showtimes": db_event.showtimes,
        "ticket": db_event.ticket,
        "images": db_event.images,
        "sources": db_event.sources,
        "discovered_at": db_event.discovered_at,
        "last_verified_at": db_event.last_verified_at,
        "canonical_fingerprint": db_event.canonical_fingerprint,
        "quality_score": db_event.quality_score,
    }
    return models.Event.model_validate(event_data)


@app.get("/api/venues/{venue_id}", response_model=models.Venue)
def get_venue(venue_id: str, db: Session = Depends(get_db)):
    """
    Gets a single venue by its ID.
    """
    db_venue = db.query(tables.Venue).filter(tables.Venue.venue_id == venue_id).first()
    if db_venue is None:
        raise HTTPException(status_code=404, detail="Venue not found")

    venue_data = {
        "venue_id": db_venue.venue_id,
        "name": db_venue.name,
        "address": db_venue.address,
        "city": db_venue.city,
        "country": db_venue.country,
        "latitude": db_venue.latitude,
        "longitude": db_venue.longitude,
        "geohash": db_venue.geohash,
        "sources": db_venue.sources,
    }
    return models.Venue.model_validate(venue_data)


@app.get("/api/users/{user_id}/preferences", response_model=models.Preference)
def get_user_preferences(user_id: str, db: Session = Depends(get_db)):
    """
    Gets the preferences for a given user.
    """
    db_preferences = db.query(tables.Preference).filter(tables.Preference.user_id == user_id).first()
    if db_preferences is None:
        raise HTTPException(status_code=404, detail="Preferences not found for this user.")

    return db_preferences


@app.post("/api/users/{user_id}/preferences", response_model=models.Preference)
def create_or_update_user_preferences(
    user_id: str,
    preferences: models.Preference,
    db: Session = Depends(get_db),
):
    """
    Creates or updates the preferences for a given user.
    """
    # Check if user exists
    user = db.query(tables.User).filter(tables.User.user_id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    db_preferences = db.query(tables.Preference).filter(tables.Preference.user_id == user_id).first()

    if db_preferences:
        # Update existing preferences
        for key, value in preferences.model_dump().items():
            setattr(db_preferences, key, value)
        db.commit()
        db.refresh(db_preferences)
        return db_preferences
    else:
        # Create new preferences
        new_preferences = tables.Preference(**preferences.model_dump())
        db.add(new_preferences)
        db.commit()
        db.refresh(new_preferences)
        return new_preferences


@app.post("/api/users/{user_id}/interactions", response_model=models.Interaction)
def create_interaction(
    user_id: str,
    interaction: models.Interaction,
    db: Session = Depends(get_db),
):
    """
    Logs a user interaction with an event.
    """
    # Check if user and event exist
    user = db.query(tables.User).filter(tables.User.user_id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    event = db.query(tables.Event).filter(tables.Event.event_id == interaction.event_id).first()
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")

    new_interaction = tables.Interaction(**interaction.model_dump())
    db.add(new_interaction)
    db.commit()
    db.refresh(new_interaction)
    return new_interaction


@app.get("/api/recommendations", response_model=List[models.Event])
def get_recommendations(user_id: str, db: Session = Depends(get_db)):
    """
    Gets event recommendations for a user.
    """
    return get_content_based_recommendations(user_id, db)


@app.get("/api/wildcard-suggestions", response_model=List[dict])
def get_wildcard_suggestions_api(user_id: str, db: Session = Depends(get_db)):
    """
    Gets wildcard event suggestions for a user.
    """
    return get_wildcard_suggestions(user_id, db)


@app.post("/api/register", response_model=models.User)
def register_user(user: models.UserRegister, db: Session = Depends(get_db)):
    """
    Registers a new user.
    """
    db_user = db.query(tables.User).filter(tables.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = auth.get_password_hash(user.password)
    user_id = str(uuid.uuid4())
    db_user = tables.User(
        user_id=user_id,
        email=user.email,
        hashed_password=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/api/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(tables.User).filter(tables.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/users/me", response_model=models.User)
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


@app.get("/metrics")
def get_metrics():
    return Response(content=generate_latest(REGISTRY), media_type="text/plain")
