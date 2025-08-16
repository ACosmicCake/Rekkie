from sqlalchemy.orm import Session
import tables, models
from typing import List

RELATED_CATEGORIES = {
    "jazz": ["blues", "soul"],
    "rock": ["metal", "punk"],
    "classical": ["opera"],
}

def get_wildcard_suggestions(user_id: str, db: Session) -> List[dict]:
    """
    Gets wildcard event suggestions for a user.
    """
    # Get user preferences
    preferences = db.query(tables.Preference).filter(tables.Preference.user_id == user_id).first()
    if not preferences:
        return []

    liked_genres = set(preferences.liked_genres)

    # Find related categories
    suggested_categories = set()
    for genre in liked_genres:
        if genre in RELATED_CATEGORIES:
            suggested_categories.update(RELATED_CATEGORIES[genre])

    # Get all events and filter in python
    all_events = db.query(tables.Event).all()
    events = [event for event in all_events if any(cat in suggested_categories for cat in event.categories)]

    # Get events the user has interacted with
    user_interactions = db.query(tables.Interaction.event_id).filter(tables.Interaction.user_id == user_id).all()
    interacted_event_ids = {interaction.event_id for interaction in user_interactions}

    # Filter out events the user has already interacted with
    suggestions = []
    for event in events:
        if event.event_id not in interacted_event_ids:
            # Find the related category to generate the rationale
            rationale = ""
            for genre in liked_genres:
                if genre in RELATED_CATEGORIES and any(cat in event.categories for cat in RELATED_CATEGORIES[genre]):
                    rationale = f"Because you like {genre}, you might also like this."
                    break

            event_data = {
                "event_id": event.event_id,
                "external_ids": event.external_ids,
                "title": event.title,
                "description": event.description,
                "categories": event.categories,
                "tags": event.tags,
                "artists": event.artists,
                "related_entities": event.related_entities,
                "city": event.city,
                "country": event.country,
                "venue": event.venue,
                "showtimes": event.showtimes,
                "ticket": event.ticket,
                "images": event.images,
                "sources": event.sources,
                "discovered_at": event.discovered_at,
                "last_verified_at": event.last_verified_at,
                "canonical_fingerprint": event.canonical_fingerprint,
                "quality_score": event.quality_score,
            }
            suggestions.append({
                "event": models.Event.model_validate(event_data),
                "rationale": rationale,
            })

    return suggestions[:5] # Return top 5 suggestions
