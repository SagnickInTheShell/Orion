from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db, Base, engine
from app.database.seed import seed_database
from app.schemas.schemas import UserResponse

router = APIRouter(prefix="/seed", tags=["Seed / Demo Data"])

@router.post("/reset")
def reset_and_reseed_demo_data(db: Session = Depends(get_db)):
    """
    Clears all tables and reseeds the full demo environment:
    - 8 core interventions
    - Demo profile for Alex with realistic sensitivity weights
    - 25+ realistic historical situations with feedback outcomes
    - Upcoming events for Prep Mode
    """
    # Recreate tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # Reseed
    user = seed_database(db)
    return {
        "status": "success",
        "message": "Demo data successfully reseeded with Alex's profile and 25+ historical contexts.",
        "user_id": user.id,
        "user_name": user.name
    }
