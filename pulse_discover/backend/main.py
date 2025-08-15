from fastapi import FastAPI
from .routers import users, events, interactions

app = FastAPI()

app.include_router(users.router)
app.include_router(events.router)
app.include_router(interactions.router)

@app.get("/")
def read_root():
    return {"Hello": "World"}
