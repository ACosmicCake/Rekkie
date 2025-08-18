from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas
from ..db import models
from ..db.database import get_db

router = APIRouter(
    prefix="/profiles",
    tags=["profiles"],
)


@router.post("/", response_model=schemas.UserProfile)
def create_user_profile(profile: schemas.UserProfileCreate, db: Session = Depends(get_db)):
    db_profile = db.query(models.UserProfile).filter(models.UserProfile.name == profile.name).first()
    if db_profile:
        db_profile.city = profile.city
        db_profile.preferences = profile.preferences
        db.commit()
        db.refresh(db_profile)
        return db_profile
    new_profile = models.UserProfile(name=profile.name, city=profile.city, preferences=profile.preferences)
    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)
    return new_profile

@router.get("/{name}", response_model=schemas.UserProfile)
def get_user_profile(name: str, db: Session = Depends(get_db)):
    db_profile = db.query(models.UserProfile).filter(models.UserProfile.name == name).first()
    if db_profile is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_profile
