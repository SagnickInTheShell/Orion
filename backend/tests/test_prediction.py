import pytest
from app.models.entities import PersonalProfile
from app.services.predictor import SupportPredictor

@pytest.fixture
def sample_profile():
    return PersonalProfile(
        user_id=1,
        noise_sensitivity=0.86,
        crowd_sensitivity=0.78,
        brightness_sensitivity=0.65,
        routine_change_sensitivity=0.90,
        unfamiliar_location_sensitivity=0.72
    )

def test_prediction_high_context(sample_profile):
    high_ctx = {
        "noise_level": 0.88,
        "crowd_level": 0.85,
        "brightness": 0.80,
        "routine_change": True,
        "unfamiliar_location": True
    }
    result = SupportPredictor.predict(high_ctx, sample_profile)
    assert result["support_level"] == "HIGH"
    assert result["support_score"] >= 0.66
    assert result["confidence"] >= 0.70
    assert any("noise" in r.lower() for r in result["reasons"])
    assert any("routine" in r.lower() for r in result["reasons"])
    assert "noise" in result["contributing_factors"]

def test_prediction_low_context(sample_profile):
    low_ctx = {
        "noise_level": 0.15,
        "crowd_level": 0.10,
        "brightness": 0.20,
        "routine_change": False,
        "unfamiliar_location": False
    }
    result = SupportPredictor.predict(low_ctx, sample_profile)
    assert result["support_level"] == "LOW"
    assert result["support_score"] <= 0.35

def test_prediction_medium_context(sample_profile):
    med_ctx = {
        "noise_level": 0.50,
        "crowd_level": 0.45,
        "brightness": 0.50,
        "routine_change": False,
        "unfamiliar_location": True
    }
    result = SupportPredictor.predict(med_ctx, sample_profile)
    assert result["support_level"] == "MEDIUM"
    assert 0.35 < result["support_score"] <= 0.65
