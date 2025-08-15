from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Optional

from . import crud, models, schemas, security
from .database import SessionLocal, engine, get_db

# Create all tables
# In a production app, you'd use Alembic for migrations.
models.Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This part runs on startup
    # You could put database connection startup here
    print("Starting up...")
    yield
    # This part runs on shutdown
    # You could put database connection teardown here
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- User Authentication Endpoints ---

@app.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(
        data={"sub": user.email}
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- Dependency to get current user ---

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = security.jwt.decode(token, security.settings.SECRET_KEY, algorithms=[security.settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except security.JWTError:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user


# --- Test Endpoint ---

@app.get("/")
def read_root():
    return {"message": "Welcome to EventHorizon AI"}

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# --- User Profile Endpoints ---

@app.get("/profile/me", response_model=schemas.UserProfile)
async def read_user_profile(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = crud.get_user_profile(db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@app.put("/profile/me", response_model=schemas.UserProfile)
async def update_user_profile(
    profile_update: schemas.UserProfileUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = crud.update_user_profile(db, user_id=current_user.id, profile_data=profile_update)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

# --- Event and Recommendation Endpoints ---

@app.get("/events/", response_model=list[schemas.Event])
def read_events(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    category: Optional[str] = None
):
    events = crud.get_events(
        db, skip=skip, limit=limit, start_date=start_date, end_date=end_date, category=category
    )
    return events

@app.get("/events/saved", response_model=list[schemas.Event])
async def read_saved_events(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    events = crud.get_saved_events(db=db, user_id=current_user.id)
    return events

@app.post("/recommendations/refresh", response_model=list[schemas.Event])
async def refresh_recommendations(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Get user profile
    user_profile = crud.get_user_profile(db, user_id=current_user.id)
    if not user_profile or not user_profile.location_city:
        raise HTTPException(
            status_code=400,
            detail="User profile is incomplete. Please set a location city first."
        )

    # 2. Call the Agentic Core to get recommendations
    from . import gemini_service
    recommendations = gemini_service.get_event_recommendations(user_profile)

    if not recommendations:
        raise HTTPException(
            status_code=500,
            detail="Failed to get recommendations from the agent."
        )

    # 3. Persist the new events
    created_events = []
    for event_detail in recommendations.personalized_events:
        event = crud.create_event(db, event=event_detail, is_wildcard=False)
        if event:
            created_events.append(event)

    if recommendations.wildcard_event:
        event = crud.create_event(db, event=recommendations.wildcard_event, is_wildcard=True)
        if event:
            created_events.append(event)

    return created_events

# --- Interaction Endpoint ---

@app.post("/interactions/", response_model=schemas.Interaction)
async def create_interaction(
    interaction: schemas.InteractionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if the event exists
    db_event = db.query(models.Event).filter(models.Event.id == interaction.event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")

    return crud.create_user_event_interaction(db=db, user_id=current_user.id, interaction=interaction)
