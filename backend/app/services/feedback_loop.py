from datetime import datetime
from sqlalchemy.orm import Session
from app.models.entities import Feedback, Recommendation, PersonalProfile, Context

class FeedbackLoopService:
    """
    Layer 5: Learning & Feedback Loop
    Closes the feedback loop by recording user rating on interventions and updating
    the personal model weights and intervention effectiveness.
    
    Learning formula:
      feedback_score: 1 -> 0.0, 2 -> 0.33, 3 -> 0.66, 4 -> 1.0
      new_score = old_score * 0.8 + feedback_score * 0.2
    """

    SCORE_MAP = {
        1: 0.00,  # Not helpful
        2: 0.33,  # Slightly helpful
        3: 0.66,  # Helpful
        4: 1.00   # Very helpful
    }

    @classmethod
    def record_feedback(
        cls,
        db: Session,
        recommendation_id: int,
        rating: int,
        comment: str = None
    ) -> dict:
        if rating not in cls.SCORE_MAP:
            raise ValueError(f"Invalid rating {rating}. Must be between 1 and 4.")

        rec = db.query(Recommendation).filter(Recommendation.id == recommendation_id).first()
        if not rec:
            raise ValueError(f"Recommendation with ID {recommendation_id} not found.")

        # Check if feedback already exists for this recommendation
        existing_fb = db.query(Feedback).filter(Feedback.recommendation_id == recommendation_id).first()
        if existing_fb:
            existing_fb.rating = rating
            existing_fb.comment = comment
            existing_fb.created_at = datetime.utcnow()
            fb = existing_fb
        else:
            fb = Feedback(
                recommendation_id=recommendation_id,
                rating=rating,
                comment=comment,
                created_at=datetime.utcnow()
            )
            db.add(fb)

        # Apply learning update formula
        previous_score = rec.score
        fb_score = cls.SCORE_MAP[rating]
        updated_score = (previous_score * 0.8) + (fb_score * 0.2)
        rec.score = round(updated_score, 3)

        # Update Personal Profile version & subtle sensitivity adaptation
        profile = db.query(PersonalProfile).filter(PersonalProfile.user_id == rec.user_id).first()
        if profile:
            profile.profile_version += 1
            profile.updated_at = datetime.utcnow()
            
            # Subtle learning calibration on sensitivities based on context
            ctx = db.query(Context).filter(Context.id == rec.context_id).first()
            if ctx and rating == 1:
                # If intervention wasn't helpful in high sensory load, sensitivity weight is slightly elevated
                if ctx.noise_level >= 0.7:
                    profile.noise_sensitivity = min(1.0, profile.noise_sensitivity + 0.02)
                if ctx.crowd_level >= 0.7:
                    profile.crowd_sensitivity = min(1.0, profile.crowd_sensitivity + 0.02)
                if ctx.routine_change:
                    profile.routine_change_sensitivity = min(1.0, profile.routine_change_sensitivity + 0.02)

        db.commit()
        db.refresh(fb)

        learning_delta = round(updated_score - previous_score, 3)
        direction = "increased" if learning_delta >= 0 else "adjusted downward"

        return {
            "feedback_id": fb.id,
            "recommendation_id": rec.id,
            "rating": rating,
            "previous_score": round(previous_score, 2),
            "updated_score": round(updated_score, 2),
            "learning_delta": learning_delta,
            "profile_version": profile.profile_version if profile else 1,
            "message": f"Personal model updated (v{profile.profile_version if profile else 1}). Intervention score {direction} by {abs(learning_delta):.2f}."
        }
