from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("PersonalProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    contexts = relationship("Context", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="user", cascade="all, delete-orphan")


class PersonalProfile(Base):
    __tablename__ = "personal_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    noise_sensitivity = Column(Float, default=0.75)
    crowd_sensitivity = Column(Float, default=0.70)
    brightness_sensitivity = Column(Float, default=0.60)
    routine_change_sensitivity = Column(Float, default=0.85)
    unfamiliar_location_sensitivity = Column(Float, default=0.65)
    profile_version = Column(Integer, default=1)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class Context(Base):
    __tablename__ = "contexts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    noise_level = Column(Float, nullable=False)
    crowd_level = Column(Float, nullable=False)
    brightness = Column(Float, nullable=False)
    activity_level = Column(Float, default=0.5)
    routine_change = Column(Boolean, default=False)
    unfamiliar_location = Column(Boolean, default=False)
    event_type = Column(String(100), default="general")
    location_type = Column(String(100), default="indoor")

    user = relationship("User", back_populates="contexts")
    recommendations = relationship("Recommendation", back_populates="context", cascade="all, delete-orphan")


class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)  # sensory, routine, preparation, social

    recommendations = relationship("Recommendation", back_populates="intervention")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    context_id = Column(Integer, ForeignKey("contexts.id", ondelete="CASCADE"), nullable=False)
    intervention_id = Column(Integer, ForeignKey("interventions.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False)  # Internal recommendation score (0.0 - 1.0)
    rank = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recommendations")
    context = relationship("Context", back_populates="recommendations")
    intervention = relationship("Intervention", back_populates="recommendations")
    feedback = relationship("Feedback", back_populates="recommendation", uselist=False, cascade="all, delete-orphan")


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id", ondelete="CASCADE"), nullable=False, unique=True)
    rating = Column(Integer, nullable=False)  # 1: Not helpful, 2: Slightly helpful, 3: Helpful, 4: Very helpful
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    recommendation = relationship("Recommendation", back_populates="feedback")


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    event_type = Column(String(100), default="general")
    scheduled_time = Column(DateTime, nullable=False)
    location = Column(String(200), default="Unknown")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="events")
