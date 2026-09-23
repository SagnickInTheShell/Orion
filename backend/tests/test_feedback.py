import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database.connection import Base
from app.database.seed import seed_database
from app.models.entities import Recommendation, Feedback, PersonalProfile
from app.services.feedback_loop import FeedbackLoopService

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    seed_database(session)
    yield session
    session.close()

def test_feedback_learning_formula(test_db):
    user_id = 1
    # Find any existing recommendation
    rec = test_db.query(Recommendation).filter(Recommendation.user_id == user_id).first()
    assert rec is not None
    initial_score = rec.score

    # Submit Very Helpful rating (4 -> 1.0)
    # new_score = old_score * 0.8 + 1.0 * 0.2
    expected_score = round((initial_score * 0.8) + (1.00 * 0.2), 2)

    res = FeedbackLoopService.record_feedback(
        db=test_db,
        recommendation_id=rec.id,
        rating=4,
        comment="Tremendously helpful in calming noise."
    )

    assert res["rating"] == 4
    assert res["previous_score"] == round(initial_score, 2)
    assert abs(res["updated_score"] - expected_score) <= 0.02
    assert "Personal model updated" in res["message"]

    profile = test_db.query(PersonalProfile).filter(PersonalProfile.user_id == user_id).first()
    assert profile.profile_version >= 2

def test_invalid_rating(test_db):
    with pytest.raises(ValueError):
        FeedbackLoopService.record_feedback(test_db, recommendation_id=1, rating=5)
    with pytest.raises(ValueError):
        FeedbackLoopService.record_feedback(test_db, recommendation_id=1, rating=0)
