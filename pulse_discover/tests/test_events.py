import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from backend import schemas

# The test_db and client fixtures are defined in conftest.py

def test_ingest_events_endpoint_success(client: TestClient, test_db):
    # Mock the LLM function to return a predictable list of events
    mock_event_details = [
        schemas.EventDetails(
            name="Test Event 1",
            description="A cool event",
            start_time="2025-01-01T20:00:00Z",
            location_name="Test Venue",
            address="123 Test St",
            city="Test City",
            event_type="Test",
            source_urls=[]
        ),
        schemas.EventDetails(
            name="Test Event 2",
            description="Another cool event",
            start_time="2025-01-02T20:00:00Z",
            location_name="Test Venue 2",
            address="456 Test Ave",
            city="Test City",
            event_type="Test",
            source_urls=[]
        ),
    ]
    mock_event_list = schemas.EventList(events=mock_event_details)

    with patch('backend.services.gemini.fetch_events_with_grounding', return_value=mock_event_list) as mock_fetch:
        response = client.post(
            "/events/ingest",
            json={"city": "Test City", "user_preferences": ["testing"]},
        )
        assert response.status_code == 200
        assert response.json() == {"message": "Successfully ingested 2 new events."}
        mock_fetch.assert_called_once()

def test_ingest_events_deduplication(client: TestClient, test_db):
    # Mock the LLM function
    mock_event_details = [
        schemas.EventDetails(
            name="Unique Event",
            description="A unique event",
            start_time="2025-01-03T20:00:00Z",
            location_name="Unique Venue",
            address="789 Unique Blvd",
            city="Test City",
            event_type="Test",
            source_urls=[]
        )
    ]
    mock_event_list = schemas.EventList(events=mock_event_details)

    with patch('backend.services.gemini.fetch_events_with_grounding', return_value=mock_event_list):
        # First call, should add 1 new event
        response1 = client.post(
            "/events/ingest",
            json={"city": "Test City", "user_preferences": ["unique"]},
        )
        assert response1.status_code == 200
        assert response1.json() == {"message": "Successfully ingested 1 new events."}

        # Second call with the same data, should add 0 new events
        response2 = client.post(
            "/events/ingest",
            json={"city": "Test City", "user_preferences": ["unique"]},
        )
        assert response2.status_code == 200
        assert response2.json() == {"message": "Successfully ingested 0 new events."}
