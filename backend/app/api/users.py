from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.entities import User, PersonalProfile
from app.schemas.schemas import UserCreate, UserResponse, ProfileUpdate, ProfileResponse

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users

@router.post("", response_model=UserResponse)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    user = User(name=user_in.name)
    db.add(user)
    db.flush()

    # Default profile
    profile = PersonalProfile(
        user_id=user.id,
        noise_sensitivity=0.75,
        crowd_sensitivity=0.70,
        brightness_sensitivity=0.60,
        routine_change_sensitivity=0.85,
        unfamiliar_location_sensitivity=0.65
    )
    db.add(profile)
    db.commit()
    db.refresh(user)
    return user

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/{user_id}/profile", response_model=ProfileResponse)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(PersonalProfile).filter(PersonalProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("/{user_id}/profile", response_model=ProfileResponse)
def update_profile(user_id: int, profile_in: ProfileUpdate, db: Session = Depends(get_db)):
    profile = db.query(PersonalProfile).filter(PersonalProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    update_data = profile_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        if val is not None:
            setattr(profile, field, val)

    profile.profile_version += 1
    db.commit()
    db.refresh(profile)
    return profile
