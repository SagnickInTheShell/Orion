from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.connection import get_db
from app.models.entities import User, Intervention, Recommendation, Feedback, Context, PersonalProfile

router = APIRouter(prefix="/patterns", tags=["Patterns & Analytics"])

@router.get("")
def get_user_patterns(user_id: int = Query(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = db.query(PersonalProfile).filter(PersonalProfile.user_id == user_id).first()

    # 1. Intervention effectiveness from actual database feedback
    interventions = db.query(Intervention).all()
    effectiveness_stats = []
    
    score_map = {1: 0.0, 2: 0.33, 3: 0.66, 4: 1.0}

    for intv in interventions:
        feedbacks = (
            db.query(Feedback.rating)
            .join(Recommendation, Feedback.recommendation_id == Recommendation.id)
            .filter(Recommendation.user_id == user_id, Recommendation.intervention_id == intv.id)
            .all()
        )
        count = len(feedbacks)
        if count > 0:
            avg_score = sum(score_map.get(f[0], 0.66) for f in feedbacks) / count
            helpful_count = sum(1 for f in feedbacks if f[0] >= 3)
            effectiveness_pct = int(avg_score * 100)
        else:
            effectiveness_pct = 70
            helpful_count = 0

        effectiveness_stats.append({
            "id": intv.id,
            "name": intv.name,
            "category": intv.category,
            "effectiveness_percentage": effectiveness_pct,
            "sample_count": count,
            "helpful_count": helpful_count
        })

    # Sort descending by effectiveness percentage
    effectiveness_stats.sort(key=lambda x: x["effectiveness_percentage"], reverse=True)

    # 2. Context breakdown across user history
    total_contexts = db.query(Context).filter(Context.user_id == user_id).count()
    high_noise_count = db.query(Context).filter(Context.user_id == user_id, Context.noise_level >= 0.70).count()
    high_crowd_count = db.query(Context).filter(Context.user_id == user_id, Context.crowd_level >= 0.70).count()
    routine_change_count = db.query(Context).filter(Context.user_id == user_id, Context.routine_change == True).count()
    unfamiliar_count = db.query(Context).filter(Context.user_id == user_id, Context.unfamiliar_location == True).count()

    context_breakdown = [
        {"factor": "High Acoustic Load (>70%)", "occurrences": high_noise_count, "pct": int((high_noise_count / max(1, total_contexts)) * 100)},
        {"factor": "Dense Crowd (>70%)", "occurrences": high_crowd_count, "pct": int((high_crowd_count / max(1, total_contexts)) * 100)},
        {"factor": "Routine Changes", "occurrences": routine_change_count, "pct": int((routine_change_count / max(1, total_contexts)) * 100)},
        {"factor": "Unfamiliar Physical Setting", "occurrences": unfamiliar_count, "pct": int((unfamiliar_count / max(1, total_contexts)) * 100)}
    ]

    return {
        "user_id": user_id,
        "user_name": user.name,
        "is_demo_profile": "Demo" in user.name,
        "profile_version": profile.profile_version if profile else 1,
        "total_recorded_situations": total_contexts,
        "sensitivities": {
            "noise": profile.noise_sensitivity if profile else 0.86,
            "crowd": profile.crowd_sensitivity if profile else 0.78,
            "brightness": profile.brightness_sensitivity if profile else 0.65,
            "routine_change": profile.routine_change_sensitivity if profile else 0.90,
            "unfamiliar_location": profile.unfamiliar_location_sensitivity if profile else 0.72
        },
        "effectiveness": effectiveness_stats,
        "context_distribution": context_breakdown,
        "summary": "Effectiveness scores reflect Alex's recorded feedback. As more feedback is submitted, scores continuously calibrate."
    }
