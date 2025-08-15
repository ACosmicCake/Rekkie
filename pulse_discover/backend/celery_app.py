from celery import Celery
from config.config import settings

celery_app = Celery(
    "tasks",
    broker=settings.REDIS_BROKER_URL,
    backend=settings.REDIS_BROKER_URL, # Use redis for results as well
    include=["pulse_discover.backend.tasks"]
)
