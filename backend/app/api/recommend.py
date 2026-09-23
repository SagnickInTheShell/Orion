from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.entities import User, Context, Intervention, Recommendation, PersonalProfile
from app.schemas.schemas import RecommendRequest, RecommendResponse, RecommendationItem, InterventionResponse
from app.services.context_engine import ContextEngine
from app.services.predictor import SupportPredictor
from app.services.similarity import SimilarityEngine
from app.services.recommender import RecommenderService

router = APIRouter(tags=["Recommendations"])

@router.get("/interventions", response_model=List[InterventionResponse])
def get_interventions(db: Session = Depends(get_db)):
    return db.query(Intervention).all()

@router.post("/recommend", response_model=RecommendResponse)
def get_recommendations(req: RecommendRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Determine or create context
    ctx = None
    if req.context_id:
        ctx = db.query(Context).filter(Context.id == req.context_id).first()
        if not ctx:
            raise HTTPException(status_code=404, detail="Context not found")
        raw_ctx = {
            "noise_level": ctx.noise_level,
            "crowd_level": ctx.crowd_level,
            "brightness": ctx.brightness,
            "activity_level": ctx.activity_level,
            "routine_change": ctx.routine_change,
            "unfamiliar_location": ctx.unfamiliar_location,
            "event_type": ctx.event_type,
            "location_type": ctx.location_type
        }
    elif req.context:
        raw_ctx = req.context.dict()
        processed = ContextEngine.process_context(raw_ctx)
        ctx = Context(
            user_id=req.user_id,
            noise_level=processed["noise_level"],
            crowd_level=processed["crowd_level"],
            brightness=processed["brightness"],
            activity_level=processed["activity_level"],
            routine_change=processed["routine_change"],
            unfamiliar_location=processed["unfamiliar_location"],
            event_type=processed["event_type"],
            location_type=processed["location_type"]
        )
        db.add(ctx)
        db.commit()
        db.refresh(ctx)
    else:
        raise HTTPException(status_code=400, detail="Must provide either context_id or context object")

    processed = ContextEngine.process_context(raw_ctx)
    profile = db.query(PersonalProfile).filter(PersonalProfile.user_id == req.user_id).first()

    similar = SimilarityEngine.find_similar_contexts(
        db, req.user_id, processed["feature_vector"], top_k=5, exclude_context_id=ctx.id
    )

    pred = SupportPredictor.predict(processed, profile, similar)
    recommended_items = RecommenderService.recommend(db, req.user_id, processed, similar, top_n=4)

    # Persist recommendation entities in db so feedback can be attached
    persisted_recs = []
    for item in recommended_items:
        rec_record = Recommendation(
            user_id=req.user_id,
            context_id=ctx.id,
            intervention_id=item["intervention_id"],
            score=item["score"],
            rank=item["rank"],
            explanation=item["reason"]
        )
        db.add(rec_record)
        db.flush()

        persisted_recs.append(RecommendationItem(
            recommendation_id=rec_record.id,
            intervention_id=item["intervention_id"],
            intervention=item["intervention"],
            description=item["description"],
            category=item["category"],
            score=item["score"],
            rank=item["rank"],
            reason=item["reason"]
        ))

    db.commit()

    # Formulate overall explainability summary
    explanation_parts = [
        f"ORION analyzed current sensory load and identified {len(similar)} similar historical situations."
    ]
    if len(similar) > 0:
        top_match = similar[0]
        explanation_parts.append(
            f"Most similar previous context was '{top_match['event_type']}' ({int(top_match['similarity'] * 100)}% match)."
        )
    explanation_parts.append(
        "Ranked strategies reflect both immediate contextual mitigation and Alex's recorded historical feedback."
    )

    return RecommendResponse(
        user_id=req.user_id,
        context_id=ctx.id,
        support_level=pred["support_level"],
        support_score=pred["support_score"],
        confidence=pred["confidence"],
        recommendations=persisted_recs,
        explanation=" ".join(explanation_parts)
    )
