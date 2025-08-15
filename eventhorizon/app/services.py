import os
import json
import google.generativeai as genai
from pydantic import ValidationError, TypeAdapter

from . import schemas

# Configure the Gemini API client
try:
    genai.configure(api_key=os.environ["GEMINI_API_KEY"])
except KeyError:
    raise RuntimeError("GEMINI_API_KEY environment variable not set.")


def discover_events(user_preferences: dict) -> list[schemas.EventCreate]:
    """
    Finds events using the Gemini API based on user preferences.
    """
    # 1. Construct the prompt
    # The prompt is highly detailed to guide the model effectively.
    prompt = f"""
    You are an expert local event scout for New York City. Your task is to find real, upcoming events in the next 7 days based on the user's preferences.

    User Preferences: {json.dumps(user_preferences)}

    Instructions:
    1.  Use your search tool (Google Search) to find relevant, real, and upcoming events.
    2.  For each event, provide the following details:
        - name: The official name of the event.
        - description: A detailed and engaging description.
        - start_time: The start time in ISO 8601 format (e.g., "2024-09-20T19:00:00Z").
        - end_time: The end time in ISO 8601 format (if available).
        - category: A suitable category based on the event (e.g., "Music", "Art", "Tech", "Food & Drink").
        - venue_name: The name of the venue.
        - venue_address: The full address of the venue.
        - sources: A list of at least one URL confirming the event details.
    3.  Return the data as a JSON array of objects. Do not include any other text or explanations in your response.
        The JSON output must conform to the structure of the list[EventCreate] Pydantic schema provided below.

    Pydantic Schema for a single event object:
    {{
        "name": "string",
        "description": "string",
        "start_time": "datetime",
        "end_time": "datetime | None",
        "category": "string",
        "venue_name": "string",
        "venue_address": "string",
        "sources": "list[HttpUrl]"
    }}
    """

    # 2. Call the Gemini API
    print("INFO: Calling Gemini API to discover events...")
    try:
        # Using Gemini 1.5 Pro, which is well-suited for this kind of task.
        model = genai.GenerativeModel('gemini-1.5-pro-latest')

        # Enable JSON mode for a guaranteed JSON response
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json"
            )
        )

        response_text = response.text
        print(f"INFO: Received response from Gemini API.")

    except Exception as e:
        print(f"ERROR: An error occurred while calling the Gemini API: {e}")
        return []

    # 3. Parse and validate the response
    try:
        # The TypeAdapter is the correct way to validate a list of Pydantic models
        event_adapter = TypeAdapter(list[schemas.EventCreate])
        validated_events = event_adapter.validate_json(response_text)
        print(f"INFO: Successfully validated {len(validated_events)} events from API response.")
        return validated_events
    except ValidationError as e:
        print(f"ERROR: Pydantic validation failed for Gemini response.\nResponse: {response_text}\nError: {e}")
        return []
    except Exception as e:
        print(f"ERROR: An unexpected error occurred during response parsing: {e}")
        return []
