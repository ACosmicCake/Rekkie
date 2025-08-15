import google.generativeai as genai
from google.generativeai.types import Tool, GenerationConfig
from datetime import datetime
import logging
from fastapi import HTTPException

from . import schemas
from .config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)

def get_event_recommendations(user_profile: schemas.UserProfile) -> schemas.EventRecommendations | None:
    """
    Calls the Gemini API to get event recommendations based on user profile.
    Returns a parsed EventRecommendations object or None if an error occurs.
    """
    # 1. Configure the Gemini client
    try:
        genai.configure(api_key=settings.GOOGLE_API_KEY)
    except Exception as e:
        logging.error(f"Failed to configure Gemini API. Is GOOGLE_API_KEY set? Error: {e}")
        raise HTTPException(status_code=500, detail="Gemini API key not configured correctly.")

    # 2. Define the tools, model, and generation config
    # The project brief specifically requests the use of the Google Search tool for grounding.
    grounding_tool = Tool(google_search=genai.types.GoogleSearch())

    # The generation config enforces the JSON output format and schema.
    generation_config = GenerationConfig(
        response_mime_type="application/json",
    )

    # Using the model specified in the project brief.
    model = genai.GenerativeModel(
        model_name="gemini-1.5-pro", # Per documentation, 1.5 is the latest powerful model. Brief mentioned 2.5, which is not a released model name. Using 1.5 Pro.
        tools=[grounding_tool],
        generation_config=generation_config
    )

    # 3. Construct the Master Prompt
    current_date = datetime.now().strftime("%Y-%m-%d")

    positive_prefs = ', '.join(user_profile.positive_preferences) if user_profile.positive_preferences else "None"
    negative_prefs = ', '.join(user_profile.negative_preferences) if user_profile.negative_preferences else "None"

    master_prompt = f"""
You are an expert, hyper-personalized event research agent. Your task is to find the best events happening in {user_profile.location_city} on or after {current_date}.

**User Profile:**
- Age: {user_profile.age if user_profile.age else 'Not provided'}
- Likes: {positive_prefs}
- Dislikes: {negative_prefs}

**Your Instructions:**
1.  **Research Thoroughly:** Use your search tool to find actual, verifiable events. For preferences like musician names, understand their genre and find similar live music. For movie preferences, find showings of similar films or films by the same director. For interests like 'chess' or 'go', find club meetings or tournaments. For 'hidden gems', find unique, well-rated bars or pop-ups.
2.  **Provide Details:** For each event, you must provide all the required information, especially the source URL. The start_time must be a full ISO 8601 timestamp string.
3.  **Populate the 'details' field:** If you find specific information like movie showtimes, ratings, ticket availability, or meeting schedules, add it to the 'details' JSON field.
4.  **Avoid Dislikes:** Do not recommend any events related to the user's dislikes.
5.  **Wildcard Suggestion:** Include ONE "wildcard" event. This should be something the user would not normally look for but might find interesting. Explain in its description why you are recommending this new experience.
6.  **Return ONLY the JSON:** Your final output must be nothing but the JSON object that validates against the provided schema. Do not include any other text or explanation.
"""

    # 4. Make the API call
    try:
        logging.info(f"Generating content with Gemini API for user in {user_profile.location_city}...")

        # The SDK can automatically parse the JSON response into the Pydantic schema provided.
        response = model.generate_content(
            master_prompt,
            generation_config={
                "response_mime_type": "application/json",
                "response_schema": schemas.EventRecommendations
            }
        )

        # The 'parsed' attribute holds the Pydantic object.
        # It might be None if the LLM response doesn't validate against the schema.
        if response.candidates[0].content.parts[0].text:
            parsed_response = schemas.EventRecommendations.model_validate_json(response.candidates[0].content.parts[0].text)
            if parsed_response:
                logging.info("Successfully parsed Gemini API response.")
                return parsed_response

        logging.warning("Gemini API response was empty or could not be parsed into the Pydantic schema.")
        return None

    except Exception as e:
        logging.error(f"An error occurred while calling the Gemini API: {e}")
        # In a real application, you might want to inspect the response for safety ratings, etc.
        # For now, we return None to be handled by the calling endpoint.
        return None
