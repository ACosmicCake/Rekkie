from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users, events, interactions
from ..config.config import settings

app = FastAPI()

# Allow all origins for development purposes
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/config")
def get_config():
    return {"anonymous_mode_enabled": settings.ANONYMOUS_MODE_ENABLED}

app.include_router(users.router)
app.include_router(events.router)
app.include_router(interactions.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}