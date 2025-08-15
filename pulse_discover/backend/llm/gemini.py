import google.generativeai as genai
from typing import List

from .. import schemas
from config.config import settings

# Configure the API with the key from settings
genai.configure(api_key=settings.GEMINI_API_KEY)

# TODO: Implement search grounding correctly. The following tool definition code
# from the prompt causes an AttributeError, likely due to a library version
# mismatch or incorrect API usage. Search grounding might be enabled via a
# different parameter in the model or generation config.

# google_search_tool = genai.Tool(...)

# Instantiate the model without the tool for now
model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    # tools=[google_search_tool]
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
        "Use the google_search tool to ensure the information is up-to-date and comes from reliable sources."
    )

    # Generate content with the model, enabling automatic function calling
    response = model.generate_content(
        prompt,
        tool_config={'function_calling_config': 'AUTO'},
    )

    # Assuming the response contains the JSON data in the text part
    # The actual response object might need to be handled differently based on the tool call results.
    # This part will likely need refinement during testing.
    return schemas.EventList.model_validate_json(response.text)
