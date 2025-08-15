from fastapi import FastAPI
from .routers import events

app = FastAPI(
    title="EventHorizon API",
    description="AI-powered event discovery.",
    version="0.1.0",
)

# Include the API endpoints for events
app.include_router(events.router)

@app.get("/")
def read_root():
    """A simple health check endpoint."""
    return {"status": "ok", "message": "Welcome to the EventHorizon API!"}
