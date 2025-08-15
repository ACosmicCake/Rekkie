import datetime
from unittest.mock import patch

from eventhorizon.app import schemas
from eventhorizon.app import models

def test_discover_events_endpoint(client, db_session):
    """
    Tests the POST /events/discover endpoint.
    Mocks the AI service and verifies that the endpoint correctly saves the
    discovered events to the database.
    """
    # 1. Arrange: Mock the service function
    mock_event_data = [
        schemas.EventCreate(
            name="Test Event from AI",
            description="A test event.",
            start_time=datetime.datetime.now(datetime.timezone.utc),
            end_time=None,
            category="Test",
            venue_name="Test Venue",
            venue_address="123 Test St, Test City, TS 12345",
            sources=["http://test.com"]
        )
    ]

    with patch('eventhorizon.app.routers.events.services.discover_events') as mock_discover:
        mock_discover.return_value = mock_event_data

        # 2. Act: Call the API endpoint
        response = client.post("/events/discover", json={"interest": "testing"})

        # 3. Assert: Check the API response
        assert response.status_code == 200
        response_data = response.json()
        assert len(response_data) == 1
        assert response_data[0]['name'] == "Test Event from AI"
        assert response_data[0]['venue_name'] == "Test Venue"

        # 4. Assert: Check the database state
        db_events = db_session.query(models.Event).all()
        assert len(db_events) == 1
        assert db_events[0].name == "Test Event from AI"
        assert db_events[0].venue_name == "Test Venue"
        assert db_events[0].sources == ["http://test.com/"] # Check deserialization

        mock_discover.assert_called_once()

def test_get_events_no_filter(client, db_session):
    """
    Tests the GET /events/ endpoint without any filtering.
    """
    # 1. Arrange: Populate the database
    event1 = models.Event(
        name="Past Event",
        description="...",
        start_time=datetime.datetime(2023, 1, 1, tzinfo=datetime.timezone.utc),
        category="History",
        venue_name="Museum",
        venue_address="...",
        sources=["http://past.com"],
        hashed_details="hash1"
    )
    event2 = models.Event(
        name="Future Event",
        description="...",
        start_time=datetime.datetime(2025, 1, 1, tzinfo=datetime.timezone.utc),
        category="Future",
        venue_name="Crystal Ball",
        venue_address="...",
        sources=["http://future.com"],
        hashed_details="hash2"
    )
    db_session.add_all([event1, event2])
    db_session.commit()

    # 2. Act: Call the endpoint
    response = client.get("/events/")

    # 3. Assert
    assert response.status_code == 200
    response_data = response.json()
    assert len(response_data) == 2
    assert {e['name'] for e in response_data} == {"Past Event", "Future Event"}
    future_event_response = next(e for e in response_data if e['name'] == 'Future Event')
    # FIX: Expect the normalized URL with a trailing slash
    assert future_event_response['sources'] == ["http://future.com/"]


def test_get_events_with_date_filter(client, db_session):
    """
    Tests the GET /events/ endpoint with start_date and end_date filters.
    """
    # 1. Arrange: Populate the database
    event1 = models.Event(
        name="Event in January",
        description="...",
        start_time=datetime.datetime(2024, 1, 15, tzinfo=datetime.timezone.utc),
        category="History",
        venue_name="Museum",
        venue_address="...",
        sources=["http://jan.com"],
        hashed_details="hash1"
    )
    event2 = models.Event(
        name="Event in February",
        description="...",
        start_time=datetime.datetime(2024, 2, 15, tzinfo=datetime.timezone.utc),
        category="Future",
        venue_name="Crystal Ball",
        venue_address="...",
        sources=["http://feb.com"],
        hashed_details="hash2"
    )
    db_session.add_all([event1, event2])
    db_session.commit()

    # 2. Act: Call the endpoint with date filters for January
    response = client.get("/events/?start_date=2024-01-01T00:00:00Z&end_date=2024-01-31T23:59:59Z")

    # 3. Assert
    assert response.status_code == 200
    response_data = response.json()
    assert len(response_data) == 1
    assert response_data[0]['name'] == "Event in January"
    assert response_data[0]['sources'] == ["http://jan.com/"]
