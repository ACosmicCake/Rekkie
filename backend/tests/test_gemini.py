import pytest
import json
from services.gemini import find_events, google_search
from models import Event

def test_google_search(mocker):
    """
    Tests the google_search function.
    """
    mock_search = mocker.patch("backend.services.gemini.search", return_value=["http://example.com"])
    results = google_search("test query")
    assert results == {"results": ["http://example.com"]}
    mock_search.assert_called_once_with("test query", num_results=5)


def test_find_events_success(mocker):
    """
    Tests the find_events function with a mocked successful response from the Gemini API.
    """
    # A fake event that conforms to the Pydantic model
    fake_event_dict = {
        "event_id": "evt-123",
        "title": "Fake Concert",
        "city": "Testville",
        "country": "Testland",
        "venue": {
            "venue_id": "ven-456",
            "name": "The Fake Venue",
            "city": "Testville",
            "country": "Testland",
        },
        "showtimes": [
            {
                "start": "2025-09-01T20:00:00",
                "timezone": "Europe/Berlin",
            }
        ],
        "sources": [
            {
                "url": "http://example.com/source1",
                "fetched_at": "2025-08-14T12:00:00",
                "confidence": 0.9
            }
        ],
        "discovered_at": "2025-08-14T12:00:00",
        "last_verified_at": "2025-08-14T12:00:00",
        "canonical_fingerprint": "fake-concert-artist-the-fake-venue-2025-09-01t200000-testville",
        "quality_score": 0.85,
    }

    # Mock the chat object and its send_message method
    mock_chat = mocker.Mock()

    # First response with a function call
    mock_function_call_response = mocker.Mock()
    mock_function_call_response.candidates = [
        mocker.Mock(content=mocker.Mock(parts=[mocker.Mock(function_call=mocker.Mock(name="google_search", args={"query": "events in Testville"}))]))
    ]

    # Second response with the final text
    mock_text_response = mocker.Mock()
    mock_text_response.candidates = [
        mocker.Mock(content=mocker.Mock(parts=[mocker.Mock(text=json.dumps([fake_event_dict]), function_call=None)]))
    ]
    mock_text_response.text = json.dumps([fake_event_dict])


    mock_chat.send_message.side_effect = [
        mock_function_call_response,
        mock_text_response
    ]

    mocker.patch("google.generativeai.GenerativeModel.start_chat", return_value=mock_chat)
    mocker.patch("backend.services.gemini.google_search", return_value={"results": "some results"})
    mocker.patch("google.generativeai.configure")


    events = find_events(city="Testville", start="2025-09-01", end="2025-09-02")

    assert len(events) == 1
    assert isinstance(events[0], Event)
    assert events[0].title == "Fake Concert"
