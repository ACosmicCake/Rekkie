import json
from unittest.mock import patch, MagicMock

import pytest

from eventhorizon.app import services
from eventhorizon.app.schemas import EventCreate


@pytest.fixture
def mock_gemini_client():
    """Fixture to mock the google.generativeai client."""
    with patch('eventhorizon.app.services.genai.GenerativeModel') as mock_model_class:
        mock_model_instance = MagicMock()
        mock_model_class.return_value = mock_model_instance
        yield mock_model_instance

def test_discover_events_success(mock_gemini_client):
    """
    Tests the successful discovery of events from a valid API response.
    """
    # 1. Arrange: Prepare the mock response
    mock_response_data = [
        {
            "name": "Jazz Night at The Blue Note",
            "description": "A night of smooth jazz.",
            "start_time": "2024-09-21T20:00:00Z",
            "end_time": "2024-09-21T23:00:00Z",
            "category": "Music",
            "venue_name": "The Blue Note",
            "venue_address": "131 W 3rd St, New York, NY 10012",
            "sources": ["https://www.bluenotejazz.com/"]
        }
    ]
    mock_response_json = json.dumps(mock_response_data)

    # The response object from the google-generativeai library has a 'text' attribute
    mock_api_response = MagicMock()
    mock_api_response.text = mock_response_json
    mock_gemini_client.generate_content.return_value = mock_api_response

    # 2. Act: Call the service function
    user_preferences = {"interest": "jazz"}
    discovered_events = services.discover_events(user_preferences)

    # 3. Assert: Check the results
    assert isinstance(discovered_events, list)
    assert len(discovered_events) == 1
    assert isinstance(discovered_events[0], EventCreate)
    assert discovered_events[0].name == "Jazz Night at The Blue Note"
    assert discovered_events[0].venue_name == "The Blue Note"

    # Ensure the prompt was passed to the model
    mock_gemini_client.generate_content.assert_called_once()


def test_discover_events_validation_error(mock_gemini_client):
    """
    Tests that the service returns an empty list when the API response is malformed.
    """
    # 1. Arrange: Prepare a malformed response (e.g., missing a required field 'name')
    mock_response_data = [
        {
            "description": "A night of smooth jazz.",
            "start_time": "2024-09-21T20:00:00Z",
            "venue_name": "The Blue Note",
            "venue_address": "131 W 3rd St, New York, NY 10012",
            "sources": ["https://www.bluenotejazz.com/"]
        }
    ]
    mock_response_json = json.dumps(mock_response_data)
    mock_api_response = MagicMock()
    mock_api_response.text = mock_response_json
    mock_gemini_client.generate_content.return_value = mock_api_response

    # 2. Act: Call the service function
    user_preferences = {"interest": "jazz"}
    discovered_events = services.discover_events(user_preferences)

    # 3. Assert: Check that an empty list is returned
    assert isinstance(discovered_events, list)
    assert len(discovered_events) == 0
