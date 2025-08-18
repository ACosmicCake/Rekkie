from google import genai
from google.genai import types
from pydantic import BaseModel



from typing import List
from .. import schemas
from config.config import settings

# Configure the API with the key from settings
api_key=settings.GEMINI_API_KEY

client = genai.Client()
model_name = "gemini-2.5-flash"
grounding_tool = types.Tool(
    google_search = types.GoogleSearch()
)

config = types.GenerateContentConfig(
    tools=[grounding_tool]
)


def fetch_events_with_grounding(city: str, user_preferences: List[str], max_events: int = 10) -> schemas.EventList:
    """
    Fetches events dynamically using Gemini Pro 1.5 with search grounding,
    tailored to user preferences.
    """
    preferences_str = ", ".join(user_preferences)
    prompt = (
        f"Find top {max_events} high-quality, relevant events in {city} "
        f"this week/month (prioritize events happening soon) that align with the following user interests: "
        f"{preferences_str}. "
        "For each event, provide comprehensive details including name, detailed description, start and end times (if applicable), "
        "venue name, full address, city, ticket price range, direct ticket link, a relevant image URL, "
        "event type/category, and the exact source URLs where this information was found. "
        "Use search tool to ensure the information is up-to-date and comes from reliable sources."
    )

    try:
        response = client.models.generate_content(
            model= model_name,
            contents = prompt,
            config = 
   
                {
        "response_mime_type": "application/json",
        "response_schema": schemas.EventList,
        
            },             

        )
        
        # The response.text should be a valid JSON string conforming to the schema
        return schemas.EventList.model_validate_json(response.text)

    except Exception as e:
        # Handle potential errors during API call or validation
        print(f"An unexpected error occurred: {e}")
        return schemas.EventList(events=[])

