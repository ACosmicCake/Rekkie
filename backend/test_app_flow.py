import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the backend directory to the Python path to allow for absolute imports
# This is necessary because we are running this script directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import crud, models, schemas, security, gemini_service
from backend.app.database import Base

# --- Test Setup ---
# Use an in-memory SQLite database for this test
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the database tables
Base.metadata.create_all(bind=engine)

def run_test_flow():
    """
    Simulates the entire application flow without running the web server.
    """
    db = TestingSessionLocal()
    print("--- Test Flow Started ---")

    # 1. Create a user
    print("\n[Step 1] Creating a new user...")
    user_create = schemas.UserCreate(email="test.user@example.com", password="password123")
    user = crud.create_user(db=db, user=user_create)
    if user and user.email == "test.user@example.com":
        print(f"✅ User '{user.email}' created successfully with ID: {user.id}")
    else:
        print("❌ Failed to create user.")
        return

    # 2. Update user profile
    print("\n[Step 2] Updating user profile...")
    profile_update = schemas.UserProfileUpdate(
        location_city="San Francisco, CA",
        age=30,
        positive_preferences=["live indie music", "Wes Anderson films", "bouldering"]
    )
    profile = crud.update_user_profile(db=db, user_id=user.id, profile_data=profile_update)
    if profile and profile.location_city == "San Francisco, CA":
        print("✅ User profile updated successfully:")
        print(f"   - Location: {profile.location_city}")
        print(f"   - Preferences: {profile.positive_preferences}")
    else:
        print("❌ Failed to update user profile.")
        return

    # 3. Get event recommendations from Gemini
    print("\n[Step 3] Getting event recommendations from Gemini service...")
    # The GOOGLE_API_KEY must be set in the environment for this to work
    try:
        recommendations = gemini_service.get_event_recommendations(user_profile=profile)
        if recommendations and recommendations.personalized_events:
            print(f"✅ Received {len(recommendations.personalized_events)} personalized events.")
            if recommendations.wildcard_event:
                print("✅ Received 1 wildcard event.")
        elif recommendations:
             print("✅ Received 0 personalized events, but the call was successful.")
        else:
            print("❌ Failed to get recommendations from Gemini service. The service returned None.")
            print("   (Is the GOOGLE_API_KEY environment variable set correctly?)")
            return
    except Exception as e:
        print(f"❌ An exception occurred during the Gemini API call: {e}")
        return

    # 4. Save events to the database
    print("\n[Step 4] Saving new events to the database...")
    created_events = []
    for event_detail in recommendations.personalized_events:
        event = crud.create_event(db, event=event_detail, is_wildcard=False)
        if event:
            created_events.append(event)

    if recommendations.wildcard_event:
        event = crud.create_event(db, event=recommendations.wildcard_event, is_wildcard=True)
        if event:
            created_events.append(event)

    if created_events:
        print(f"✅ Successfully saved {len(created_events)} events to the database.")
    else:
        print("❌ Failed to save any events to the database.")
        return

    # 5. Retrieve events from the database
    print("\n[Step 5] Retrieving events from the database...")
    all_events = crud.get_events(db=db)
    print(f"✅ Found {len(all_events)} events in the database.")
    for i, event in enumerate(all_events):
        print(f"   - Event {i+1}: '{event.title}' ({event.category_llm}) {'✨' if event.is_wildcard else ''}")

    print("\n--- Test Flow Completed Successfully ---")

    print("\n--- Phase 2 Tests Started ---")

    # 6. Test "Dislike" interaction and learning mechanism
    print("\n[Step 6] Testing 'DISLIKE' interaction...")
    if all_events:
        event_to_dislike = all_events[0]
        interaction_create = schemas.InteractionCreate(event_id=event_to_dislike.id, status=models.InteractionStatus.DISLIKED)
        crud.create_user_event_interaction(db=db, user_id=user.id, interaction=interaction_create)

        # Verify the learning mechanism
        updated_profile = crud.get_user_profile(db, user_id=user.id)
        if event_to_dislike.category_llm in updated_profile.negative_preferences:
            print(f"✅ Learning mechanism works: Category '{event_to_dislike.category_llm}' added to negative preferences.")
        else:
            print("❌ Learning mechanism failed.")

    # 7. Test "Save" interaction
    print("\n[Step 7] Testing 'SAVE' interaction...")
    if len(all_events) > 1:
        event_to_save = all_events[1]
        interaction_create = schemas.InteractionCreate(event_id=event_to_save.id, status=models.InteractionStatus.SAVED)
        interaction_db = crud.create_user_event_interaction(db=db, user_id=user.id, interaction=interaction_create)
        if interaction_db.status == models.InteractionStatus.SAVED:
            print(f"✅ Successfully saved event '{event_to_save.title}'.")
        else:
            print("❌ Failed to save event.")

    # 8. Test event filtering
    print("\n[Step 8] Testing event filtering...")
    if all_events:
        category_to_filter = all_events[0].category_llm
        print(f"   - Filtering by category: '{category_to_filter}'")
        filtered_events = crud.get_events(db=db, category=category_to_filter)
        if filtered_events and all(evt.category_llm == category_to_filter for evt in filtered_events):
            print(f"✅ Filtering by category successful. Found {len(filtered_events)} event(s).")
        else:
            print("❌ Filtering by category failed.")

    print("\n--- Phase 2 Tests Completed ---")

    print("\n--- Phase 3 Tests Started ---")

    # 9. Test getting saved events
    print("\n[Step 9] Testing retrieval of saved events...")
    saved_events = crud.get_saved_events(db=db, user_id=user.id)
    if len(saved_events) == 1 and saved_events[0].id == event_to_save.id:
        print(f"✅ Successfully retrieved {len(saved_events)} saved event(s).")
    else:
        print(f"❌ Failed to retrieve the correct saved events. Expected 1, got {len(saved_events)}.")

    print("\n--- Phase 3 Tests Completed ---")


    db.close()

if __name__ == "__main__":
    run_test_flow()
