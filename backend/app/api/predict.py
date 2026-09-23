from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.entities import User, PersonalProfile
from app.schemas.schemas import PredictRequest, PredictResponse
from app.services.context_engine import ContextEngine
from app.services.predictor import SupportPredictor
from app.services.similarity import SimilarityEngine

router = APIRouter(prefix="/predict", tags=["Prediction"])

@router.post("", response_model=PredictResponse)
def predict_support_requirement(req: PredictRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = db.query(PersonalProfile).filter(PersonalProfile.user_id == req.user_id).first()
    if not profile:
        profile = PersonalProfile(
            user_id=req.user_id,
            noise_sensitivity=0.86,
            crowd_sensitivity=0.78,
            brightness_sensitivity=0.65,
            routine_change_sensitivity=0.90,
            unfamiliar_location_sensitivity=0.72
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Process and normalize context
    processed = ContextEngine.process_context(req.context.dict())

    # Find similar historical contexts
    similar = SimilarityEngine.find_similar_contexts(
        db, req.user_id, processed["feature_vector"], top_k=5
    )

    # Compute prediction
    pred = SupportPredictor.predict(processed, profile, similar)

    return PredictResponse(
        support_level=pred["support_level"],
        support_score=pred["support_score"],
        confidence=pred["confidence"],
        reasons=pred["reasons"],
        contributing_factors=pred["contributing_factors"],
        context_summary=processed["human_descriptions"]
    )
