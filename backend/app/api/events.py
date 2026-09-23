from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.entities import Event, User
from app.schemas.schemas import EventCreate, EventResponse, PrepPlanResponse
from app.services.simulator import WhatIfSimulatorService

router = APIRouter(prefix="/events", tags=["Prep Mode & Events"])

@router.get("", response_model=List[EventResponse])
def get_events(user_id: int = Query(...), db: Session = Depends(get_db)):
    events = (
        db.query(Event)
        .filter(Event.user_id == user_id)
        .order_by(Event.scheduled_time.asc())
        .all()
    )
    return events

@router.post("", response_model=EventResponse)
def create_event(event_in: EventCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == event_in.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_event = Event(
        user_id=event_in.user_id,
        title=event_in.title,
        event_type=event_in.event_type,
        scheduled_time=event_in.scheduled_time,
        location=event_in.location,
        notes=event_in.notes
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@router.post("/prep", response_model=PrepPlanResponse)
def generate_prep_plan(event_in: EventCreate, db: Session = Depends(get_db)):
    prep_data = WhatIfSimulatorService.generate_prep_plan(
        db=db,
        user_id=event_in.user_id,
        event_data=event_in.dict()
    )
    return PrepPlanResponse(**prep_data)
