import pytest
from app.services.context_engine import ContextEngine

def test_normalize_values():
    assert ContextEngine.normalize_value(0.5) == 0.5
    assert ContextEngine.normalize_value(-0.2) == 0.0
    assert ContextEngine.normalize_value(1.8) == 1.0
    assert ContextEngine.normalize_value("invalid", default=0.5) == 0.5
    assert ContextEngine.normalize_value(None, default=0.3) == 0.3

def test_process_context_descriptions():
    raw_high = {
        "noise_level": 0.88,
        "crowd_level": 0.82,
        "brightness": 0.90,
        "activity_level": 0.70,
        "routine_change": True,
        "unfamiliar_location": True
    }
    processed = ContextEngine.process_context(raw_high)
    assert processed["noise_level"] == 0.88
    assert processed["routine_change"] is True
    assert processed["unfamiliar_location"] is True
    
    desc_str = " ".join(processed["human_descriptions"])
    assert "High environmental noise" in desc_str
    assert "High crowd density" in desc_str
    assert "Unexpected routine" in desc_str
    assert "Unfamiliar physical setting" in desc_str
    assert len(processed["feature_vector"]) == 6

def test_process_context_quiet_baseline():
    raw_low = {
        "noise_level": 0.15,
        "crowd_level": 0.10,
        "brightness": 0.25,
        "routine_change": False,
        "unfamiliar_location": False
    }
    processed = ContextEngine.process_context(raw_low)
    desc_str = " ".join(processed["human_descriptions"])
    assert "Quiet acoustic environment" in desc_str
    assert "Low crowd density" in desc_str
