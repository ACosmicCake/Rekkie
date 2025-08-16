import pytest
from recommendations.content_based import get_recommendations
from recommendations.wildcard import get_wildcard_suggestions
from tables import User as UserTable, Preference as PreferenceTable, Event as EventTable, Interaction as InteractionTable
from datetime import datetime
import uuid

def test_get_recommendations(db_session):
    """
    Tests the get_recommendations function.
    """
    # Create a dummy user and preferences
    user_id = str(uuid.uuid4())
    dummy_user = UserTable(user_id=user_id, email="test@example.com", hashed_password="password")
    db_session.add(dummy_user)

    preferences = PreferenceTable(
        user_id=user_id,
        liked_artists=["Artist A", "Artist B"],
        liked_genres=["rock", "jazz"],
    )
    db_session.add(preferences)

    # Create dummy events
    event1 = EventTable(
        event_id=str(uuid.uuid4()),
        title="Event 1",
        artists=["Artist A"],
        categories=["rock"],
        city="Testville",
        country="Testland",
        discovered_at=datetime.utcnow(),
        last_verified_at=datetime.utcnow(),
        canonical_fingerprint="event-1-fingerprint",
        quality_score=0.9,
    )
    event2 = EventTable(
        event_id=str(uuid.uuid4()),
        title="Event 2",
        artists=["Artist C"],
        categories=["pop"],
        city="Testville",
        country="Testland",
        discovered_at=datetime.utcnow(),
        last_verified_at=datetime.utcnow(),
        canonical_fingerprint="event-2-fingerprint",
        quality_score=0.8,
    )
    event3 = EventTable(
        event_id=str(uuid.uuid4()),
        title="Event 3",
        artists=["Artist B"],
        categories=["jazz"],
        city="Testville",
        country="Testland",
        discovered_at=datetime.utcnow(),
        last_verified_at=datetime.utcnow(),
        canonical_fingerprint="event-3-fingerprint",
        quality_score=0.95,
    )
    db_session.add_all([event1, event2, event3])
    db_session.commit()

    recommendations = get_recommendations(user_id, db_session)

    assert len(recommendations) == 2
    assert recommendations[0].title == "Event 1"
    assert recommendations[1].title == "Event 3"


def test_get_wildcard_suggestions(db_session):
    """
    Tests the get_wildcard_suggestions function.
    """
    # Create a dummy user and preferences
    user_id = str(uuid.uuid4())
    dummy_user = UserTable(user_id=user_id, email="test@example.com", hashed_password="password")
    db_session.add(dummy_user)

    preferences = PreferenceTable(
        user_id=user_id,
        liked_genres=["jazz"],
    )
    db_session.add(preferences)

    # Create dummy events
    event1 = EventTable(
        event_id="evt-1",
        title="Jazz Event",
        categories=["jazz"],
        city="Testville",
        country="Testland",
        discovered_at=datetime.utcnow(),
        last_verified_at=datetime.utcnow(),
        canonical_fingerprint="event-1-fingerprint",
        quality_score=0.9,
    )
    event2 = EventTable(
        event_id="evt-2",
        title="Blues Event",
        categories=["blues"],
        city="Testville",
        country="Testland",
        discovered_at=datetime.utcnow(),
        last_verified_at=datetime.utcnow(),
        canonical_fingerprint="event-2-fingerprint",
        quality_score=0.8,
    )
    event3 = EventTable(
        event_id="evt-3",
        title="Soul Event",
        categories=["soul"],
        city="Testville",
        country="Testland",
        discovered_at=datetime.utcnow(),
        last_verified_at=datetime.utcnow(),
        canonical_fingerprint="event-3-fingerprint",
        quality_score=0.95,
    )
    db_session.add_all([event1, event2, event3])

    # Create a dummy interaction
    interaction = InteractionTable(
        user_id=user_id,
        event_id="evt-2",
        action="like",
        ts=datetime.utcnow(),
    )
    db_session.add(interaction)

    db_session.commit()

    suggestions = get_wildcard_suggestions(user_id, db_session)

    assert len(suggestions) == 1
    assert suggestions[0]["event"].title == "Soul Event"
    assert "Because you like jazz" in suggestions[0]["rationale"]
