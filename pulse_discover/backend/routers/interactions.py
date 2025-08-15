from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import schemas
from ..db import models
from ..db.database import get_db
from ..security import get_current_user

router = APIRouter(
    prefix="/interactions",
    tags=["interactions"],
)

@router.post("/", response_model=schemas.UserEventInteractionRead)
def create_interaction(
    interaction: schemas.UserEventInteractionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Check if event exists
    event = (
        db.query(models.Event)
        .filter(models.Event.event_id == interaction.event_id)
        .first()
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Set user_id from the authenticated user
    interaction_data = interaction.model_dump()
    interaction_data["user_id"] = current_user.user_id

    db_interaction = models.UserEventInteraction(**interaction_data)
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    return db_interaction
