from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

# Construct an absolute path to the .env file.
# __file__ is the path to the current file (backend/app/config.py)
# .parent.parent gives us the 'backend' directory.
# Then we append '.env' to get 'backend/.env'
env_path = Path(__file__).parent.parent / ".env"

class Settings(BaseSettings):
    GOOGLE_API_KEY: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    model_config = SettingsConfigDict(env_file=str(env_path))

settings = Settings()
