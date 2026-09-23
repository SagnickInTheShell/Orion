from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.schemas import FeedbackCreate, FeedbackResponse
from app.services.feedback_loop import FeedbackLoopService

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("", response_model=FeedbackResponse)
def submit_feedback(fb_in: FeedbackCreate, db: Session = Depends(get_db)):
    try:
        res = FeedbackLoopService.record_feedback(
            db=db,
            recommendation_id=fb_in.recommendation_id,
            rating=fb_in.rating,
            comment=fb_in.comment
        )
        from datetime import datetime
        return FeedbackResponse(
            id=res["feedback_id"],
            recommendation_id=res["recommendation_id"],
            rating=res["rating"],
            comment=fb_in.comment,
            created_at=datetime.utcnow(),
            updated_score=res["updated_score"],
            previous_score=res["previous_score"],
            learning_delta=res["learning_delta"],
            message=res["message"]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
