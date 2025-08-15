import os
import sys
from dotenv import load_dotenv
import pytest

# --- Pre-emptive Environment Loading for Pytest ---
# Load environment variables before the application modules are imported.
# This prevents import-time errors for configurations like API keys.
print("INFO: Loading .env file for tests...")
# Construct the path to the .env file in the project root
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)
dotenv_path = os.path.join(project_root, '.env')

# The .env file might not exist due to file system issues, so we create a dummy one
# if it's missing, to ensure the environment variable is set.
if not os.path.exists(dotenv_path):
    print("WARNING: .env file not found for tests. Creating a dummy one.")
    with open(dotenv_path, "w") as f:
        f.write('GEMINI_API_KEY="DUMMY_KEY_FOR_TESTING"\n')
        f.write('DATABASE_URL="sqlite:///:memory:"\n')

load_dotenv(dotenv_path)
print(f"INFO: GEMINI_API_KEY is set: {bool(os.getenv('GEMINI_API_KEY'))}")
# --- End Pre-emptive Loading ---


from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from eventhorizon.app.main import app
from eventhorizon.app.database import get_db
from eventhorizon.app.models import Base

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
