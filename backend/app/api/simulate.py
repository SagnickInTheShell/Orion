from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.schemas import SimulationScenarioRequest, SimulationResponse
from app.services.simulator import WhatIfSimulatorService

router = APIRouter(prefix="/simulate", tags=["Simulator"])

@router.post("", response_model=SimulationResponse)
def simulate_support(req: SimulationScenarioRequest, db: Session = Depends(get_db)):
    result = WhatIfSimulatorService.simulate(
        db=db,
        user_id=req.user_id,
        context_data=req.context,
        scenarios=req.interventions
    )
    return SimulationResponse(**result)
