import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.connection import Base
from app.database.seed import seed_database
from app.services.simulator import WhatIfSimulatorService

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    seed_database(session)
    yield session
    session.close()

def test_what_if_simulation(test_db):
    user_id = 1
    context_data = {
        "noise_level": 0.88,
        "crowd_level": 0.82,
        "routine_change": True
    }
    scenarios = [
        "none",
        "quiet_break",
        "visual_schedule",
        "quiet_break+visual_schedule"
    ]
    sim = WhatIfSimulatorService.simulate(test_db, user_id, context_data, scenarios)
    assert sim["user_id"] == 1
    assert sim["baseline_level"] == "HIGH"
    assert len(sim["scenarios"]) == 4

    no_intv = sim["scenarios"][0]
    quiet_break = sim["scenarios"][1]
    compound = sim["scenarios"][3]

    assert no_intv["level"] == "HIGH"
    # An active intervention should produce a lower score than no intervention
    assert quiet_break["support_score"] < no_intv["support_score"]
    # Compound interventions should produce even lower support score
    assert compound["support_score"] <= quiet_break["support_score"]
    assert "Simulation based on this user's historical context" in sim["disclaimer"]
