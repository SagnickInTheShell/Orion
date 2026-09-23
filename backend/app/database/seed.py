import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.entities import User, PersonalProfile, Context, Intervention, Recommendation, Feedback, Event

SEED_INTERVENTIONS = [
    {
        "name": "Quiet Break",
        "description": "Temporary pause in a designated low-sensory or quiet space to reset sensory load.",
        "category": "sensory"
    },
    {
        "name": "Visual Schedule",
        "description": "Structured visual sequence of tasks and timelines clarifying what comes next.",
        "category": "routine"
    },
    {
        "name": "Preparation Preview",
        "description": "Pre-event walkthrough, map preview, and expectations check before entering an unfamiliar space.",
        "category": "preparation"
    },
    {
        "name": "Familiar Person",
        "description": "Grounding and co-regulation with a trusted colleague, friend, or support partner.",
        "category": "social"
    },
    {
        "name": "Noise Reduction",
        "description": "Active noise-canceling headphones or earplugs to mitigate sudden or continuous acoustic stimuli.",
        "category": "sensory"
    },
    {
        "name": "Reduced Sensory Exposure",
        "description": "Dimming screen brightness, wearing tinted lenses, or stepping away from intense fluorescent lighting.",
        "category": "sensory"
    },
    {
        "name": "Step-by-Step Breakdown",
        "description": "Chunking complex multi-part demands into single, sequential, unambiguous actions.",
        "category": "preparation"
    },
    {
        "name": "Early Arrival",
        "description": "Arriving early to choose seating, survey layout, and acclimate before crowd influx.",
        "category": "preparation"
    }
]

HISTORICAL_SCENARIOS = [
    # High noise & crowd situations
    {"noise": 0.88, "crowd": 0.84, "bright": 0.75, "routine": False, "unfamiliar": False, "event": "Campus Dining Hall", "best_intervention": "Quiet Break", "rating": 4, "rank": 1},
    {"noise": 0.85, "crowd": 0.80, "bright": 0.82, "routine": False, "unfamiliar": True, "event": "Annual Tech Conference", "best_intervention": "Noise Reduction", "rating": 4, "rank": 1},
    {"noise": 0.79, "crowd": 0.75, "bright": 0.60, "routine": True, "event": "Subway Delay & Platform Shift", "best_intervention": "Visual Schedule", "rating": 4, "rank": 1},
    {"noise": 0.82, "crowd": 0.78, "bright": 0.70, "routine": False, "unfamiliar": False, "event": "Crowded Seminar", "best_intervention": "Quiet Break", "rating": 4, "rank": 1},
    {"noise": 0.72, "crowd": 0.86, "bright": 0.65, "routine": False, "unfamiliar": True, "event": "Career Fair", "best_intervention": "Familiar Person", "rating": 3, "rank": 2},
    {"noise": 0.86, "crowd": 0.70, "bright": 0.80, "routine": False, "unfamiliar": False, "event": "Open Office Work Hours", "best_intervention": "Noise Reduction", "rating": 4, "rank": 1},

    # Routine changes
    {"noise": 0.55, "crowd": 0.45, "bright": 0.50, "routine": True, "unfamiliar": False, "event": "Rescheduled Project Standup", "best_intervention": "Visual Schedule", "rating": 4, "rank": 1},
    {"noise": 0.60, "crowd": 0.50, "bright": 0.60, "routine": True, "unfamiliar": True, "event": "Swapped Lecture Hall", "best_intervention": "Preparation Preview", "rating": 4, "rank": 1},
    {"noise": 0.40, "crowd": 0.35, "bright": 0.40, "routine": True, "unfamiliar": False, "event": "Surprise Team Reorganization", "best_intervention": "Step-by-Step Breakdown", "rating": 4, "rank": 1},
    {"noise": 0.65, "crowd": 0.60, "bright": 0.55, "routine": True, "unfamiliar": True, "event": "Cancelled Train & Bus Replacement", "best_intervention": "Visual Schedule", "rating": 4, "rank": 1},

    # Unfamiliar location
    {"noise": 0.50, "crowd": 0.60, "bright": 0.70, "routine": False, "unfamiliar": True, "event": "First Visit to Medical Clinic", "best_intervention": "Preparation Preview", "rating": 4, "rank": 1},
    {"noise": 0.68, "crowd": 0.72, "bright": 0.75, "routine": False, "unfamiliar": True, "event": "Downtown Testing Center", "best_intervention": "Early Arrival", "rating": 4, "rank": 1},
    {"noise": 0.45, "crowd": 0.40, "bright": 0.55, "routine": False, "unfamiliar": True, "event": "New Client Office", "best_intervention": "Preparation Preview", "rating": 4, "rank": 1},
    {"noise": 0.62, "crowd": 0.58, "bright": 0.65, "routine": False, "unfamiliar": True, "event": "Offsite Workshop", "best_intervention": "Early Arrival", "rating": 3, "rank": 2},

    # Bright / Sensory Overload
    {"noise": 0.60, "crowd": 0.55, "bright": 0.92, "routine": False, "unfamiliar": False, "event": "Fluorescent Lab Session", "best_intervention": "Reduced Sensory Exposure", "rating": 4, "rank": 1},
    {"noise": 0.58, "crowd": 0.62, "bright": 0.88, "routine": False, "unfamiliar": False, "event": "Sunlit Glass Auditorium", "best_intervention": "Reduced Sensory Exposure", "rating": 4, "rank": 1},

    # Complex / High Multi-factor load
    {"noise": 0.90, "crowd": 0.85, "bright": 0.85, "routine": True, "unfamiliar": True, "event": "Major Final Presentation in Unknown Hall", "best_intervention": "Preparation Preview", "rating": 4, "rank": 1},
    {"noise": 0.88, "crowd": 0.80, "bright": 0.78, "routine": True, "unfamiliar": False, "event": "Sudden Department Evacuation Drill", "best_intervention": "Quiet Break", "rating": 4, "rank": 1},
    {"noise": 0.82, "crowd": 0.79, "bright": 0.70, "routine": False, "unfamiliar": True, "event": "Airport Boarding Gate Change", "best_intervention": "Visual Schedule", "rating": 4, "rank": 1},

    # Calmer baseline situations
    {"noise": 0.25, "crowd": 0.20, "bright": 0.40, "routine": False, "unfamiliar": False, "event": "Quiet Library Study Room", "best_intervention": "Step-by-Step Breakdown", "rating": 3, "rank": 1},
    {"noise": 0.30, "crowd": 0.25, "bright": 0.45, "routine": False, "unfamiliar": False, "event": "Home Office Work Block", "best_intervention": "Visual Schedule", "rating": 4, "rank": 1},
    {"noise": 0.35, "crowd": 0.30, "bright": 0.35, "routine": False, "unfamiliar": False, "event": "Small Team Code Review", "best_intervention": "Step-by-Step Breakdown", "rating": 4, "rank": 1},

    # Additional contextual situations
    {"noise": 0.75, "crowd": 0.70, "bright": 0.65, "routine": False, "unfamiliar": False, "event": "Crowded Coffee Shop Study", "best_intervention": "Noise Reduction", "rating": 4, "rank": 1},
    {"noise": 0.80, "crowd": 0.75, "bright": 0.70, "routine": True, "event": "Last-minute Room Reassignment", "best_intervention": "Visual Schedule", "rating": 4, "rank": 1},
    {"noise": 0.70, "crowd": 0.65, "bright": 0.80, "routine": False, "unfamiliar": True, "event": "New Campus Gym Orientation", "best_intervention": "Early Arrival", "rating": 4, "rank": 1}
]

def seed_database(db: Session) -> User:
    """Seeds the database with standard interventions, demo user Alex, and historical contexts."""
    # 1. Seed Interventions
    intervention_map = {}
    for item in SEED_INTERVENTIONS:
        existing = db.query(Intervention).filter(Intervention.name == item["name"]).first()
        if not existing:
            intervention = Intervention(
                name=item["name"],
                description=item["description"],
                category=item["category"]
            )
            db.add(intervention)
            db.flush()
            intervention_map[item["name"]] = intervention
        else:
            intervention_map[item["name"]] = existing

    # 2. Seed Default User Alex
    alex = db.query(User).filter(User.name == "Alex (Demo)").first()
    if not alex:
        alex = User(name="Alex (Demo)")
        db.add(alex)
        db.flush()

        profile = PersonalProfile(
            user_id=alex.id,
            noise_sensitivity=0.86,
            crowd_sensitivity=0.78,
            brightness_sensitivity=0.65,
            routine_change_sensitivity=0.90,
            unfamiliar_location_sensitivity=0.72,
            profile_version=1
        )
        db.add(profile)
        db.flush()
    else:
        profile = alex.profile

    # 3. Seed Events for Alex (for Prep Mode demonstration)
    existing_event = db.query(Event).filter(Event.user_id == alex.id).first()
    if not existing_event:
        now = datetime.utcnow()
        demo_event_1 = Event(
            user_id=alex.id,
            title="College Capstone Presentation",
            event_type="presentation",
            scheduled_time=now + timedelta(days=2, hours=3),
            location="Auditorium Hall B",
            notes="Large audience expected, new room layout, time slot pushed forward by 30 mins."
        )
        demo_event_2 = Event(
            user_id=alex.id,
            title="Team Quarterly Retrospective",
            event_type="meeting",
            scheduled_time=now + timedelta(days=4, hours=1),
            location="Main Conference Room",
            notes="Casual discussion, familiar team members."
        )
        db.add(demo_event_1)
        db.add(demo_event_2)
        db.flush()

    # 4. Seed Historical Contexts, Recommendations & Feedback
    existing_contexts = db.query(Context).filter(Context.user_id == alex.id).count()
    if existing_contexts < 10:
        base_time = datetime.utcnow() - timedelta(days=30)
        for i, scenario in enumerate(HISTORICAL_SCENARIOS):
            timestamp = base_time + timedelta(days=i, hours=random.randint(1, 8))
            ctx = Context(
                user_id=alex.id,
                timestamp=timestamp,
                noise_level=scenario["noise"],
                crowd_level=scenario["crowd"],
                brightness=scenario["bright"],
                activity_level=min(1.0, max(0.2, (scenario["noise"] + scenario["crowd"]) / 2.0)),
                routine_change=scenario.get("routine", False),
                unfamiliar_location=scenario.get("unfamiliar", False),
                event_type=scenario["event"],
                location_type="indoor"
            )
            db.add(ctx)
            db.flush()

            # Add primary recommendation
            best_int = intervention_map.get(scenario["best_intervention"])
            if best_int:
                rec = Recommendation(
                    user_id=alex.id,
                    context_id=ctx.id,
                    intervention_id=best_int.id,
                    score=0.85 + (scenario["rating"] * 0.03),
                    rank=scenario.get("rank", 1),
                    explanation=f"Matches high sensory load in {scenario['event']}; historically validated.",
                    created_at=timestamp
                )
                db.add(rec)
                db.flush()

                fb = Feedback(
                    recommendation_id=rec.id,
                    rating=scenario["rating"],
                    comment=f"Strategy was very applicable during {scenario['event']}.",
                    created_at=timestamp + timedelta(hours=1)
                )
                db.add(fb)

    db.commit()
    return alex
