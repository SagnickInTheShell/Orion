import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.connection import Base
from app.database.seed import seed_database
from app.services.recommender import RecommenderService
from app.services.similarity import SimilarityEngine

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    seed_database(session)
    yield session
    session.close()

def test_recommendation_ranking_high_noise(test_db):
    user_id = 1
    high_noise_ctx = {
        "noise_level": 0.90,
        "crowd_level": 0.85,
        "brightness": 0.70,
        "routine_change": False,
        "unfamiliar_location": False
    }
    recs = RecommenderService.recommend(test_db, user_id, high_noise_ctx, top_n=3)
    assert len(recs) == 3
    # Interventions addressing sensory noise should score highest
    top_intervention_names = [r["intervention"] for r in recs]
    assert any(name in ["Quiet Break", "Noise Reduction"] for name in top_intervention_names)
    assert recs[0]["score"] >= recs[1]["score"]
    assert recs[0]["rank"] == 1
    assert "reason" in recs[0]

def test_recommendation_routine_change(test_db):
    user_id = 1
    routine_ctx = {
        "noise_level": 0.40,
        "crowd_level": 0.30,
        "brightness": 0.40,
        "routine_change": True,
        "unfamiliar_location": False
    }
    recs = RecommenderService.recommend(test_db, user_id, routine_ctx, top_n=3)
    top_names = [r["intervention"] for r in recs]
    assert any(name in ["Visual Schedule", "Step-by-Step Breakdown", "Preparation Preview"] for name in top_names)
