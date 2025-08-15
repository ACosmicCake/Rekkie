import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.main import app
from backend.database import Base, get_db
from backend.tables import Event as EventTable, Venue as VenueTable, User as UserTable, Preference as PreferenceTable, Interaction as InteractionTable
from datetime import datetime
import uuid

# Setup the test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


client = TestClient(app)


@pytest.fixture(scope="function")
def db_session(mocker):
    # Create the database tables
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # We need to mock the background task function for the ingest endpoint test
    mocker.patch("backend.main.run_ingestion")

    try:
        yield db
    finally:
        db.close()
        # Drop the database tables after the test
        Base.metadata.drop_all(bind=engine)


def test_get_events(db_session):
    """
    Tests the /api/events endpoint.
    """
    # Create a dummy event
    dummy_event = EventTable(
        event_id="evt-123",
        title="Test Event",
        city="Testville",
        country="Testland",
        discovered_at=datetime.utcnow(),
        last_verified_at=datetime.utcnow(),
        canonical_fingerprint="test-event-fingerprint",
        quality_score=0.9,
        venue={
            "venue_id": "ven-456",
            "name": "The Fake Venue",
            "city": "Testville",
            "country": "Testland",
        },
        showtimes=[],
        sources=[],
    )
    db_session.add(dummy_event)
    db_session.commit()

    response = client.get("/api/events")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Test Event"


def test_get_event(db_session):
    """
    Tests the /api/events/{event_id} endpoint.
    """
    # Create a dummy event
    dummy_event = EventTable(
        event_id="evt-123",
        title="Test Event",
        city="Testville",
        country="Testland",
        discovered_at=datetime.utcnow(),
        last_verified_at=datetime.utcnow(),
        canonical_fingerprint="test-event-fingerprint",
        quality_score=0.9,
        venue={
            "venue_id": "ven-456",
            "name": "The Fake Venue",
            "city": "Testville",
            "country": "Testland",
        },
        showtimes=[],
        sources=[],
    )
    db_session.add(dummy_event)
    db_session.commit()

    response = client.get("/api/events/evt-123")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Event"

    response = client.get("/api/events/non-existent-id")
    assert response.status_code == 404


def test_get_venue(db_session):
    """
    Tests the /api/venues/{venue_id} endpoint.
    """
    # Create a dummy venue
    dummy_venue = VenueTable(
        venue_id="ven-456",
        name="The Fake Venue",
        city="Testville",
        country="Testland",
    )
    db_session.add(dummy_venue)
    db_session.commit()

    response = client.get("/api/venues/ven-456")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "The Fake Venue"

    response = client.get("/api/venues/non-existent-id")
    assert response.status_code == 404


def test_user_preferences(db_session):
    """
    Tests the /api/users/{user_id}/preferences endpoints.
    """
    # Create a dummy user
    user_id = str(uuid.uuid4())
    dummy_user = UserTable(
        user_id=user_id,
        email="test@example.com",
        hashed_password="password",
    )
    db_session.add(dummy_user)
    db_session.commit()

    # Test GET when no preferences exist
    response = client.get(f"/api/users/{user_id}/preferences")
    assert response.status_code == 404

    # Test POST to create preferences
    preferences_data = {
        "user_id": user_id,
        "liked_genres": ["jazz", "rock"],
    }
    response = client.post(f"/api/users/{user_id}/preferences", json=preferences_data)
    assert response.status_code == 200
    data = response.json()
    assert data["liked_genres"] == ["jazz", "rock"]

    # Test GET to retrieve preferences
    response = client.get(f"/api/users/{user_id}/preferences")
    assert response.status_code == 200
    data = response.json()
    assert data["liked_genres"] == ["jazz", "rock"]

    # Test POST to update preferences
    updated_preferences_data = {
        "user_id": user_id,
        "liked_genres": ["classical"],
        "price_ceiling": 100.0,
    }
    response = client.post(f"/api/users/{user_id}/preferences", json=updated_preferences_data)
    assert response.status_code == 200
    data = response.json()
    assert data["liked_genres"] == ["classical"]
    assert data["price_ceiling"] == 100.0

    # Test POST for non-existent user
    response = client.post("/api/users/non-existent-user/preferences", json=preferences_data)
    assert response.status_code == 404


def test_create_interaction(db_session):
    """
    Tests the /api/users/{user_id}/interactions endpoint.
    """
    # Create a dummy user and event
    user_id = str(uuid.uuid4())
    dummy_user = UserTable(user_id=user_id, email="test@example.com", hashed_password="password")
    db_session.add(dummy_user)

    event_id = str(uuid.uuid4())
    dummy_event = EventTable(
        event_id=event_id,
        title="Test Event",
        city="Testville",
        country="Testland",
        discovered_at=datetime.utcnow(),
        last_verified_at=datetime.utcnow(),
        canonical_fingerprint="test-event-fingerprint",
        quality_score=0.9,
        venue={"venue_id": "ven-456", "name": "The Fake Venue", "city": "Testville", "country": "Testland"},
        showtimes=[],
        sources=[],
    )
    db_session.add(dummy_event)
    db_session.commit()

    # Test creating an interaction
    interaction_data = {
        "user_id": user_id,
        "event_id": event_id,
        "action": "like",
        "ts": datetime.utcnow().isoformat(),
    }
    response = client.post(f"/api/users/{user_id}/interactions", json=interaction_data)
    assert response.status_code == 200
    data = response.json()
    assert data["action"] == "like"

    # Test with non-existent user
    response = client.post(f"/api/users/non-existent-user/interactions", json=interaction_data)
    assert response.status_code == 404

    # Test with non-existent event
    interaction_data["event_id"] = "non-existent-event"
    response = client.post(f"/api/users/{user_id}/interactions", json=interaction_data)
    assert response.status_code == 404


def test_ingest_run(mocker):
    """
    Tests the /api/ingest/run endpoint.
    """
    # We also need to mock the BackgroundTasks to check if add_task is called
    mock_add_task = mocker.Mock()
    mocker.patch("fastapi.BackgroundTasks.add_task", new=mock_add_task)

    response = client.post("/api/ingest/run?city=Testville&start_date=2025-09-01&end_date=2025-09-02")

    assert response.status_code == 200
    assert response.json() == {"message": "Ingestion started in the background."}

    # Assert that add_task was called with the correct arguments
    # The first argument is the function to call, which is run_ingestion.
    # We can't directly compare the function object, so we'll check the name.
    assert mock_add_task.call_args[0][0].__name__ == "run_ingestion"
    assert mock_add_task.call_args[1] == {
        "city": "Testville",
        "start": "2025-09-01",
        "end": "2025-09-02",
    }
