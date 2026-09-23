from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.entities import Context, User
from app.schemas.schemas import ContextCreate, ContextResponse
from app.services.context_engine import ContextEngine

router = APIRouter(prefix="/context", tags=["Context"])

@router.post("", response_model=ContextResponse)
def create_context(ctx_in: ContextCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == ctx_in.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    processed = ContextEngine.process_context(ctx_in.dict())

    new_ctx = Context(
        user_id=ctx_in.user_id,
        noise_level=processed["noise_level"],
        crowd_level=processed["crowd_level"],
        brightness=processed["brightness"],
        activity_level=processed["activity_level"],
        routine_change=processed["routine_change"],
        unfamiliar_location=processed["unfamiliar_location"],
        event_type=processed["event_type"],
        location_type=processed["location_type"]
    )
    db.add(new_ctx)
    db.commit()
    db.refresh(new_ctx)

    resp = ContextResponse.from_orm(new_ctx)
    resp.human_description = processed["human_descriptions"]
    return resp

@router.get("/history", response_model=List[ContextResponse])
def get_context_history(
    user_id: int = Query(...),
    limit: int = Query(25, ge=1, le=100),
    db: Session = Depends(get_db)
):
    contexts = (
        db.query(Context)
        .filter(Context.user_id == user_id)
        .order_by(Context.timestamp.desc())
        .limit(limit)
        .all()
    )
    result = []
    for c in contexts:
        resp = ContextResponse.from_orm(c)
        processed = ContextEngine.process_context({
            "noise_level": c.noise_level,
            "crowd_level": c.crowd_level,
            "brightness": c.brightness,
            "activity_level": c.activity_level,
            "routine_change": c.routine_change,
            "unfamiliar_location": c.unfamiliar_location
        })
        resp.human_description = processed["human_descriptions"]
        result.append(resp)
    return result
