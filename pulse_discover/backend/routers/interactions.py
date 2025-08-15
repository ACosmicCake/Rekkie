from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import schemas
from ..db import models
from ..db.database import get_db

router = APIRouter(
    prefix="/interactions",
    tags=["interactions"],
)

@router.post("/", response_model=schemas.UserEventInteractionRead)
def create_interaction(
    interaction: schemas.UserEventInteractionCreate, db: Session = Depends(get_db)
):
    # Check if user and event exist
    user = db.query(models.User).filter(models.User.user_id == interaction.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    event = db.query(models.Event).filter(models.Event.event_id == interaction.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    db_interaction = models.UserEventInteraction(**interaction.model_dump())
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction
