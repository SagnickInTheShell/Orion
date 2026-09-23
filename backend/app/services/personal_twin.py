from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.entities import User, PersonalProfile

class PersonalTwinService:
    """
    Layer 3: Personal Intelligence (Personal Digital Twin)
    Maintains the individual's trigger sensitivities and personal response weights.
    Never medical / diagnostic.
    """

    @staticmethod
    def get_or_create_profile(db: Session, user_id: int) -> PersonalProfile:
        profile = db.query(PersonalProfile).filter(PersonalProfile.user_id == user_id).first()
        if not profile:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                user = User(name="User")
                db.add(user)
                db.flush()
            profile = PersonalProfile(
                user_id=user.id,
                noise_sensitivity=0.75,
                crowd_sensitivity=0.70,
                brightness_sensitivity=0.60,
                routine_change_sensitivity=0.85,
                unfamiliar_location_sensitivity=0.65,
                profile_version=1
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
        return profile

    @staticmethod
    def get_sensitivity_weights(profile: PersonalProfile) -> Dict[str, float]:
        return {
            "noise": profile.noise_sensitivity,
            "crowd": profile.crowd_sensitivity,
            "brightness": profile.brightness_sensitivity,
            "routine_change": profile.routine_change_sensitivity,
            "unfamiliar_location": profile.unfamiliar_location_sensitivity
        }
