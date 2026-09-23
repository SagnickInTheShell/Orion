from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.entities import PersonalProfile, Intervention
from app.services.context_engine import ContextEngine
from app.services.predictor import SupportPredictor
from app.services.similarity import SimilarityEngine
from app.services.recommender import RecommenderService

class WhatIfSimulatorService:
    """
    Simulates counterfactual interventions against a given context.
    Estimates support requirement reduction based on user's historical effectiveness.
    
    IMPORTANT:
    All scores are model simulation estimates, never clinical probabilities.
    """

    INTERVENTION_REDUCTIONS = {
        "quiet_break": 0.24,
        "visual_schedule": 0.22,
        "preparation_preview": 0.25,
        "familiar_person": 0.18,
        "noise_reduction": 0.20,
        "reduced_sensory_exposure": 0.19,
        "step_by_step_breakdown": 0.17,
        "early_arrival": 0.16,
    }

    @classmethod
    def simulate(
        cls,
        db: Session,
        user_id: int,
        context_data: Dict[str, Any],
        scenarios: List[str] = None
    ) -> Dict[str, Any]:
        if not scenarios:
            scenarios = ["none", "quiet_break", "visual_schedule", "quiet_break+visual_schedule"]

        # 1. Process context
        processed_ctx = ContextEngine.process_context(context_data)
        
        # 2. Get user profile
        profile = db.query(PersonalProfile).filter(PersonalProfile.user_id == user_id).first()
        if not profile:
            profile = PersonalProfile(
                user_id=user_id,
                noise_sensitivity=0.86,
                crowd_sensitivity=0.78,
                brightness_sensitivity=0.65,
                routine_change_sensitivity=0.90,
                unfamiliar_location_sensitivity=0.72
            )

        # 3. Base prediction (No intervention)
        base_pred = SupportPredictor.predict(processed_ctx, profile)
        baseline_score = base_pred["support_score"]
        baseline_level = base_pred["support_level"]

        # 4. Evaluate each scenario
        results = []
        for sc in scenarios:
            sc_clean = sc.strip().lower()
            if sc_clean in ["none", "no intervention", ""]:
                results.append({
                    "name": "No Intervention",
                    "intervention_keys": ["none"],
                    "support_score": baseline_score,
                    "level": baseline_level,
                    "score_reduction": 0.0,
                    "explanation": "Baseline situation without proactive accommodations."
                })
                continue

            # Split compound scenarios like 'quiet_break+visual_schedule'
            parts = [p.strip().replace(" ", "_") for p in sc_clean.split("+")]
            total_reduction = 0.0
            part_names = []

            for p in parts:
                intv_name_guess = p.replace("_", " ").title()
                # Find intervention in db for personalization lookup
                intv = db.query(Intervention).filter(Intervention.name.ilike(f"%{intv_name_guess}%")).first()
                if intv:
                    hist_eff = RecommenderService.calculate_historical_effectiveness(db, user_id, intv.id)
                    context_rel = RecommenderService.calculate_contextual_relevance(intv.name, processed_ctx)
                    # Effectiveness-weighted reduction
                    reduction = (cls.INTERVENTION_REDUCTIONS.get(p, 0.18) * 0.5) + (hist_eff * 0.15) + (context_rel * 0.10)
                    total_reduction += reduction
                    part_names.append(intv.name)
                else:
                    reduction = cls.INTERVENTION_REDUCTIONS.get(p, 0.15)
                    total_reduction += reduction
                    part_names.append(p.replace("_", " ").title())

            # Diminishing returns on compound interventions
            if len(parts) > 1:
                total_reduction = total_reduction * 0.85

            simulated_score = max(0.10, min(1.0, baseline_score - total_reduction))
            sim_score_rounded = round(simulated_score, 2)

            if sim_score_rounded <= 0.35:
                sim_level = "LOW"
            elif sim_score_rounded <= 0.65:
                sim_level = "MEDIUM"
            else:
                sim_level = "HIGH"

            title_name = " + ".join(part_names)
            explanation = f"Simulated reduction of {int(total_reduction * 100)}% based on historical efficacy and context relevance."

            results.append({
                "name": title_name,
                "intervention_keys": parts,
                "support_score": sim_score_rounded,
                "level": sim_level,
                "score_reduction": round(total_reduction, 2),
                "explanation": explanation
            })

        return {
            "user_id": user_id,
            "baseline_level": baseline_level,
            "baseline_score": baseline_score,
            "scenarios": results,
            "disclaimer": "Simulation based on this user's historical context and intervention feedback. Not a medical probability."
        }

    @classmethod
    def generate_prep_plan(
        cls,
        db: Session,
        user_id: int,
        event_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyzes upcoming event details and returns proactive recommendations and why-explanations.
        """
        context_data = {
            "noise_level": event_data.get("expected_noise", 0.6),
            "crowd_level": event_data.get("expected_crowd", 0.6),
            "brightness": event_data.get("expected_brightness", 0.5),
            "activity_level": event_data.get("activity_level", 0.5),
            "routine_change": event_data.get("routine_change", False),
            "unfamiliar_location": event_data.get("unfamiliar_location", False),
            "event_type": event_data.get("event_type", "presentation"),
            "location_type": event_data.get("location", "indoor")
        }

        processed_ctx = ContextEngine.process_context(context_data)
        profile = db.query(PersonalProfile).filter(PersonalProfile.user_id == user_id).first()
        similar_contexts = SimilarityEngine.find_similar_contexts(
            db, user_id, processed_ctx["feature_vector"], top_k=4
        )

        prediction = SupportPredictor.predict(processed_ctx, profile, similar_contexts)
        recommendations = RecommenderService.recommend(db, user_id, processed_ctx, similar_contexts, top_n=4)

        # Actionable preparation steps checklist
        steps = []
        if event_data.get("routine_change"):
            steps.append("Preview updated agenda/schedule at least 1 hour in advance")
        if event_data.get("unfamiliar_location"):
            steps.append("Review floor plan and designate a low-sensory quiet spot beforehand")
            steps.append("Arrive 15 minutes early to select optimal seating before crowds assemble")
        if context_data["noise_level"] >= 0.7:
            steps.append("Pack active noise-canceling headphones or earplugs in bag")
        if context_data["crowd_level"] >= 0.7:
            steps.append("Identify trusted companion or contact person if co-regulation is needed")
        
        steps.append("Schedule a 10-minute quiet decompression buffer immediately following the event")

        # Why explanation
        why_text = (
            f"ORION identified {len(similar_contexts)} previous events sharing similar characteristics "
            f"(noise {int(context_data['noise_level']*100)}%, crowd {int(context_data['crowd_level']*100)}%). "
            f"Proactive preparation and sensory buffers were rated helpful in previous similar contexts."
        )

        return {
            "title": event_data.get("title", "Upcoming Event"),
            "scheduled_time": event_data.get("scheduled_time"),
            "estimated_support_requirement": prediction["support_level"],
            "support_score": prediction["support_score"],
            "confidence": prediction["confidence"],
            "reasons": prediction["reasons"],
            "actionable_prep_steps": steps,
            "recommended_interventions": recommendations,
            "why_explanation": why_text
        }
