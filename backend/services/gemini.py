import google.generativeai as genai
from decouple import config
from typing import List
import pydantic
import json
from googlesearch import search

from backend.models import Event

# Configure the Gemini API client
GEMINI_API_KEY = config("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)


def google_search(query: str) -> dict:
    """
    Performs a Google search and returns the results.
    """
    print(f"Searching for: {query}")
    try:
        # Using a more robust search implementation
        search_results = list(search(query, num_results=5))
        return {"results": search_results}
    except Exception as e:
        print(f"An error occurred during search: {e}")
        return {"error": str(e)}


tools = [
    {
        "function_declarations": [
            {
                "name": "google_search",
                "description": "Performs a google search.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The search query."
                        }
                    },
                    "required": ["query"]
                }
            }
        ]
    }
]


def find_events(city: str, start: str, end: str) -> List[Event]:
    """
    Finds events in a given city and date range using the Gemini API with search grounding.
    """
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        tools=tools,
    )

    prompt = f"""
    You are a data-reliability-first events researcher.

    Task: Find events in {city} for date range {start}–{end} across concerts, film showings (with ratings per showtime when available), chess/Go clubs, local meetups, and unique experiences.

    Requirements:
    - Use the `google_search` tool to find authoritative sources.
    - For each event, include at least 1 source URL (prefer 2–3).
    - Normalize times to the event's local timezone and include timezone string.
    - Provide ticket availability and price range if present.
    - Avoid duplicates; compute 'canonical_fingerprint' as lowercased slug of:
      title + primary_artist + venue_name + first_showtime_start (ISO) + city.
    - Populate 'quality_score' ∈ [0,1] (freshness, #sources, completeness).
    - Only return valid JSON conforming to the Event schema. No prose.
    - The JSON output should be a list of Event objects.
    """

    chat = model.start_chat()
    response = chat.send_message(prompt)

    while True:
        if not response.candidates or not response.candidates[0].content or not response.candidates[0].content.parts:
            break

        part = response.candidates[0].content.parts[0]
        if not hasattr(part, "function_call") or not part.function_call or not part.function_call.name:
            break

        function_call = part.function_call
        if function_call.name == "google_search":
            search_results = google_search(function_call.args["query"])
            response = chat.send_message(
                [
                    {
                        "function_response": {
                            "name": "google_search",
                            "response": search_results,
                        }
                    }
                ]
            )
        else:
            response = chat.send_message(
                [
                    {
                        "function_response": {
                            "name": function_call.name,
                            "response": {"error": "Unknown function"},
                        }
                    }
                ]
            )

    try:
        # The final response should be a JSON string.
        events_data = json.loads(response.text)
        validated_events = [Event.model_validate(event_data) for event_data in events_data]
        return validated_events
    except (pydantic.ValidationError, json.JSONDecodeError) as e:
        print(f"Response validation failed: {e}")
        raise e
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise e
