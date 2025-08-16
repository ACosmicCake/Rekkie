from sqlalchemy.orm import Session
import tables, models
from typing import List

def get_recommendations(user_id: str, db: Session) -> List[models.Event]:
    """
    Gets event recommendations for a user based on content-based filtering.
    """
    # Get user preferences
    preferences = db.query(tables.Preference).filter(tables.Preference.user_id == user_id).first()
    if not preferences:
        return []

    liked_artists = set(preferences.liked_artists)
    liked_genres = set(preferences.liked_genres)
    disliked_artists = set(preferences.disliked_artists)

    # Get all events
    events = db.query(tables.Event).all()

    # Calculate similarity scores
    scored_events = []
    for event in events:
        score = 0

        # Features from the event
        event_artists = set(event.artists)
        event_categories = set(event.categories)

        # Jaccard similarity for artists
        intersection_artists = liked_artists.intersection(event_artists)
        union_artists = liked_artists.union(event_artists)
        if union_artists:
            score += len(intersection_artists) / len(union_artists)

        # Jaccard similarity for categories
        intersection_categories = liked_genres.intersection(event_categories)
        union_categories = liked_genres.union(event_categories)
        if union_categories:
            score += len(intersection_categories) / len(union_categories)

        # Penalize disliked artists
        if disliked_artists.intersection(event_artists):
            score -= 1

        if score > 0:
            scored_events.append((event, score))

    # Sort events by score
    scored_events.sort(key=lambda x: x[1], reverse=True)

    # Return top 10 events
    recommended_events = [event for event, score in scored_events[:10]]

    # Convert SQLAlchemy objects to Pydantic models
    pydantic_events = []
    for event in recommended_events:
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
        pydantic_events.append(models.Event.model_validate(event_data))

    return pydantic_events
