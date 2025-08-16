import redis
import json
from typing import Optional, Any

# Connect to Redis
# In a real application, the host and port should be configurable.
redis_client = redis.Redis(host='localhost', port=6379, db=0)

def get_from_cache(key: str) -> Optional[Any]:
    """
    Retrieves data from the cache.
    """
    cached_data = redis_client.get(key)
    if cached_data:
        return json.loads(cached_data)
    return None

def set_to_cache(key: str, value: Any, ttl: int = 3600):
    """
    Sets data to the cache with a time-to-live (ttl) in seconds.
    """
    redis_client.setex(key, ttl, json.dumps(value))

def clear_cache(key: str):
    """
    Clears a specific key from the cache.
    """
    redis_client.delete(key)
