from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from .. import schemas
from ..db import models
from ..db.database import get_db
from ..security import get_password_hash, verify_password, create_access_token, get_current_user
from datetime import timedelta

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.post("/register", response_model=schemas.UserRead)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": str(user.user_id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/me/interests", response_model=schemas.UserInterestRead)
def create_user_interest(
    interest: schemas.UserInterestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db_interest = models.UserInterest(
        **interest.model_dump(), user_id=current_user.user_id
    )
    db.add(db_interest)
    db.commit()
    db.refresh(db_interest)
    return db_interest


@router.get("/me/interests", response_model=List[schemas.UserInterestRead])
def get_user_interests(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    return current_user.interests


@router.delete(
    "/me/interests/{interest_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_user_interest(
    interest_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    interest = (
        db.query(models.UserInterest)
        .filter(
            models.UserInterest.interest_id == interest_id,
            models.UserInterest.user_id == current_user.user_id,
        )
        .first()
    )
    if not interest:
        raise HTTPException(status_code=404, detail="Interest not found")

    db.delete(interest)
    db.commit()
    return {"message": "Interest deleted successfully"}
