from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- User & Profile ---
class UserBase(BaseModel):
    name: str

class UserCreate(UserBase):
    pass

class ProfileBase(BaseModel):
    noise_sensitivity: float = Field(default=0.75, ge=0.0, le=1.0)
    crowd_sensitivity: float = Field(default=0.70, ge=0.0, le=1.0)
    brightness_sensitivity: float = Field(default=0.60, ge=0.0, le=1.0)
    routine_change_sensitivity: float = Field(default=0.85, ge=0.0, le=1.0)
    unfamiliar_location_sensitivity: float = Field(default=0.65, ge=0.0, le=1.0)

class ProfileUpdate(BaseModel):
    noise_sensitivity: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    crowd_sensitivity: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    brightness_sensitivity: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    routine_change_sensitivity: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    unfamiliar_location_sensitivity: Optional[float] = Field(default=None, ge=0.0, le=1.0)

class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    profile_version: int
    updated_at: datetime

    class Config:
        from_attributes = True

class UserResponse(UserBase):
    id: int
    created_at: datetime
    profile: Optional[ProfileResponse] = None

    class Config:
        from_attributes = True

# --- Context ---
class ContextCreate(BaseModel):
    user_id: int
    noise_level: float = Field(..., ge=0.0, le=1.0)
    crowd_level: float = Field(..., ge=0.0, le=1.0)
    brightness: float = Field(..., ge=0.0, le=1.0)
    activity_level: float = Field(default=0.5, ge=0.0, le=1.0)
    routine_change: bool = False
    unfamiliar_location: bool = False
    event_type: Optional[str] = "general"
    location_type: Optional[str] = "indoor"

class ContextResponse(BaseModel):
    id: int
    user_id: int
    timestamp: datetime
    noise_level: float
    crowd_level: float
    brightness: float
    activity_level: float
    routine_change: bool
    unfamiliar_location: bool
    event_type: str
    location_type: str
    human_description: Optional[List[str]] = None

    class Config:
        from_attributes = True

# --- Prediction (Support Requirement) ---
class PredictRequest(BaseModel):
    user_id: int
    context: ContextCreate

class PredictResponse(BaseModel):
    support_level: str  # LOW, MEDIUM, HIGH
    support_score: float
    confidence: float
    reasons: List[str]
    contributing_factors: Dict[str, float]
    context_summary: List[str]

# --- Interventions & Recommendations ---
class InterventionBase(BaseModel):
    name: str
    description: str
    category: str

class InterventionResponse(InterventionBase):
    id: int

    class Config:
        from_attributes = True

class RecommendationItem(BaseModel):
    recommendation_id: Optional[int] = None
    intervention_id: int
    intervention: str
    description: str
    category: str
    score: float  # recommendation score (0.0 - 1.0)
    rank: int
    reason: str

class RecommendRequest(BaseModel):
    user_id: int
    context_id: Optional[int] = None
    context: Optional[ContextCreate] = None

class RecommendResponse(BaseModel):
    user_id: int
    context_id: int
    support_level: str
    support_score: float
    confidence: float
    recommendations: List[RecommendationItem]
    explanation: str

# --- Feedback ---
class FeedbackCreate(BaseModel):
    recommendation_id: int
    rating: int = Field(..., ge=1, le=4, description="1: Not helpful, 2: Slightly helpful, 3: Helpful, 4: Very helpful")
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    recommendation_id: int
    rating: int
    comment: Optional[str]
    created_at: datetime
    updated_score: float
    previous_score: float
    learning_delta: float
    message: str

    class Config:
        from_attributes = True

# --- What-If Simulator ---
class SimulationScenarioRequest(BaseModel):
    user_id: int
    context: Dict[str, Any]
    interventions: List[str] = ["none", "quiet_break", "visual_schedule", "quiet_break+visual_schedule"]

class ScenarioResult(BaseModel):
    name: str
    intervention_keys: List[str]
    support_score: float
    level: str  # LOW, MEDIUM, HIGH
    score_reduction: float
    explanation: str

class SimulationResponse(BaseModel):
    user_id: int
    baseline_level: str
    baseline_score: float
    scenarios: List[ScenarioResult]
    disclaimer: str = "Simulation based on this user's historical context and intervention feedback. Not a medical probability."

# --- Prep Mode & Events ---
class EventCreate(BaseModel):
    user_id: int
    title: str
    event_type: str = "general"
    scheduled_time: datetime
    location: str = "Unknown"
    notes: Optional[str] = None
    expected_crowd: float = 0.5
    expected_noise: float = 0.5
    expected_brightness: float = 0.5
    routine_change: bool = False
    unfamiliar_location: bool = False

class EventResponse(BaseModel):
    id: int
    user_id: int
    title: str
    event_type: str
    scheduled_time: datetime
    location: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class PrepPlanResponse(BaseModel):
    event_id: Optional[int] = None
    title: str
    scheduled_time: datetime
    estimated_support_requirement: str
    support_score: float
    confidence: float
    reasons: List[str]
    actionable_prep_steps: List[str]
    recommended_interventions: List[RecommendationItem]
    why_explanation: str
