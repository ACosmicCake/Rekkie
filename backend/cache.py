import redis
import json
from .config.config import settings

# Initialize Redis connection
try:
    redis_client = redis.Redis.from_url(settings.REDIS_URL)
    redis_client.ping()
    print("Successfully connected to Redis.")
except redis.exceptions.ConnectionError as e:
    print(f"Could not connect to Redis: {e}")
    redis_client = None

def get_from_cache(key: str):
    """Gets a value from the cache."""
    if not redis_client:
        return None

    cached_value = redis_client.get(key)
    if cached_value:
        return json.loads(cached_value)
    return None

def set_in_cache(key: str, value: any, ttl: int = 3600):
    """Sets a value in the cache with a TTL."""
    if not redis_client:
        return

    redis_client.set(key, json.dumps(value), ex=ttl)
