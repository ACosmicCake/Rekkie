import hashlib
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from . import models, schemas, security

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Also create an empty user profile
    db_profile = models.UserProfile(user_id=db_user.id)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)

    return db_user

def get_user_profile(db: Session, user_id: int):
    return db.query(models.UserProfile).filter(models.UserProfile.user_id == user_id).first()

def update_user_profile(db: Session, user_id: int, profile_data: schemas.UserProfileUpdate):
    db_profile = get_user_profile(db, user_id)
    if db_profile:
        update_data = profile_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_profile, key, value)
        db.commit()
        db.refresh(db_profile)
    return db_profile

# --- Event CRUD functions ---

def get_events(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    category: Optional[str] = None
):
    query = db.query(models.Event)

    if start_date:
        query = query.filter(models.Event.start_time >= start_date)
    if end_date:
        query = query.filter(models.Event.start_time <= end_date)
    if category:
        query = query.filter(models.Event.category_llm.ilike(f"%{category}%"))

    return query.offset(skip).limit(limit).all()

def create_event(db: Session, event: schemas.EventDetail, is_wildcard: bool = False):
    # Create a unique identifier to prevent duplicates in a later phase
    identifier_str = f"{event.title}-{event.venue_name}-{event.start_time}"
    unique_identifier = hashlib.sha256(identifier_str.encode('utf-8')).hexdigest()

    # Check if event already exists (for robustness, though not strictly required by MVP Phase 1)
    db_event = db.query(models.Event).filter(models.Event.unique_identifier == unique_identifier).first()
    if db_event:
        return db_event

    # Convert ISO string to datetime object
    try:
        start_time_dt = datetime.fromisoformat(event.start_time)
    except ValueError:
        # Handle cases where the timestamp might not be perfectly formatted
        # For now, we'll skip events with invalid timestamps
        return None

    db_event = models.Event(
        unique_identifier=unique_identifier,
        title=event.title,
        description=event.description,
        venue_name=event.venue_name,
        venue_address=event.venue_address,
        start_time=start_time_dt,
        category_llm=event.category_llm,
        details=event.details,
        source_url=event.source_url,
        is_wildcard=is_wildcard
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

# --- Interaction CRUD functions ---

def get_interaction(db: Session, user_id: int, event_id: int):
    return db.query(models.UserEventInteraction).filter(
        models.UserEventInteraction.user_id == user_id,
        models.UserEventInteraction.event_id == event_id
    ).first()

def create_user_event_interaction(db: Session, user_id: int, interaction: schemas.InteractionCreate):
    # Check if an interaction already exists and update or create it
    db_interaction = get_interaction(db, user_id=user_id, event_id=interaction.event_id)
    if db_interaction:
        db_interaction.status = interaction.status
    else:
        db_interaction = models.UserEventInteraction(**interaction.model_dump(), user_id=user_id)
        db.add(db_interaction)

    # --- Learning Mechanism ---
    # If the user disliked the event, add its category to their negative preferences
    if interaction.status == models.InteractionStatus.DISLIKED:
        # Get the event category
        event = db.query(models.Event).filter(models.Event.id == interaction.event_id).first()
        if event:
            # Get the user profile
            profile = get_user_profile(db, user_id=user_id)
            if profile:
                # Ensure negative_preferences is a list
                if profile.negative_preferences is None:
                    profile.negative_preferences = []

                # Add the category if it's not already there
                if event.category_llm not in profile.negative_preferences:
                    # To keep the list in the database updated, we need to re-assign it
                    new_negative_preferences = profile.negative_preferences + [event.category_llm]
                    profile.negative_preferences = new_negative_preferences

    db.commit()
    db.refresh(db_interaction)
    return db_interaction

def get_saved_events(db: Session, user_id: int):
    return db.query(models.Event).join(models.UserEventInteraction).filter(
        models.UserEventInteraction.user_id == user_id,
        models.UserEventInteraction.status == models.InteractionStatus.SAVED
    ).all()
