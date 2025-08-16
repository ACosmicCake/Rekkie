from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users, events, interactions

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

app.include_router(users.router)
app.include_router(events.router)
app.include_router(interactions.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}