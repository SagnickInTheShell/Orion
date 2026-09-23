from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.entities import Intervention, Recommendation, Feedback, Context

class RecommenderService:
    """
    Layer 4B & 4C: Intervention Recommendation and Traceable Explainability
    Ranks interventions by combining contextual relevance and personalized historical effectiveness.
    Produces transparent, traceable explanations rooted directly in user history.
    """

    @classmethod
    def calculate_historical_effectiveness(cls, db: Session, user_id: int, intervention_id: int) -> float:
        # Look up all historical feedback for this user & intervention
        records = (
            db.query(Feedback.rating)
            .join(Recommendation, Feedback.recommendation_id == Recommendation.id)
            .filter(Recommendation.user_id == user_id, Recommendation.intervention_id == intervention_id)
            .all()
        )
        if not records:
            # Baseline prior for new/untested intervention
            return 0.70

        # Rating scale: 1 -> 0.0, 2 -> 0.33, 3 -> 0.66, 4 -> 1.0
        score_map = {1: 0.0, 2: 0.33, 3: 0.66, 4: 1.0}
        total = sum(score_map.get(r[0], 0.66) for r in records)
        return total / len(records)

    @classmethod
    def calculate_contextual_relevance(cls, intervention_name: str, context: Dict[str, Any]) -> float:
        noise = float(context.get("noise_level", 0.5))
        crowd = float(context.get("crowd_level", 0.5))
        brightness = float(context.get("brightness", 0.5))
        routine = bool(context.get("routine_change", False))
        unfamiliar = bool(context.get("unfamiliar_location", False))

        relevance = 0.50  # default baseline

        if intervention_name == "Quiet Break":
            relevance = 0.40 + (noise * 0.35) + (crowd * 0.25)
        elif intervention_name == "Noise Reduction":
            relevance = 0.30 + (noise * 0.65)
        elif intervention_name == "Visual Schedule":
            relevance = 0.40 + (0.50 if routine else 0.05) + (0.10 if unfamiliar else 0.0)
        elif intervention_name == "Preparation Preview":
            relevance = 0.35 + (0.45 if unfamiliar else 0.05) + (0.25 if routine else 0.0)
        elif intervention_name == "Early Arrival":
            relevance = 0.35 + (0.35 if unfamiliar else 0.05) + (crowd * 0.30)
        elif intervention_name == "Reduced Sensory Exposure":
            relevance = 0.30 + (brightness * 0.55) + (noise * 0.20)
        elif intervention_name == "Step-by-Step Breakdown":
            relevance = 0.45 + (0.40 if routine else 0.10)
        elif intervention_name == "Familiar Person":
            relevance = 0.40 + (crowd * 0.30) + (0.30 if unfamiliar else 0.05)

        return max(0.2, min(1.0, relevance))

    @classmethod
    def recommend(
        cls,
        db: Session,
        user_id: int,
        context: Dict[str, Any],
        similar_contexts: List[Dict[str, Any]] = None,
        top_n: int = 4
    ) -> List[Dict[str, Any]]:
        interventions = db.query(Intervention).all()
        ranked = []

        for intv in interventions:
            hist_eff = cls.calculate_historical_effectiveness(db, user_id, intv.id)
            context_rel = cls.calculate_contextual_relevance(intv.name, context)

            # Combined transparent recommendation score
            # 60% historical effectiveness, 40% current contextual relevance
            score = (hist_eff * 0.60) + (context_rel * 0.40)

            # Traceable explanation generation
            reasons = []
            
            # Check similarity matches
            matched_in_history = 0
            helpful_in_history = 0
            if similar_contexts:
                for sc in similar_contexts:
                    for sc_intv in sc.get("interventions", []):
                        if sc_intv.get("intervention_name") == intv.name:
                            matched_in_history += 1
                            if sc_intv.get("was_helpful"):
                                helpful_in_history += 1

            if matched_in_history > 0:
                reasons.append(
                    f"Helpful in {helpful_in_history}/{matched_in_history} similar previous situations"
                )
            elif hist_eff >= 0.80:
                reasons.append(f"Consistently high historical rating ({int(hist_eff * 100)}%) across previous contexts")
            
            # Contextual alignment reason
            if intv.name in ["Quiet Break", "Noise Reduction"] and context.get("noise_level", 0) >= 0.7:
                reasons.append("Directly mitigates active high acoustic intensity")
            elif intv.name in ["Visual Schedule", "Step-by-Step Breakdown"] and context.get("routine_change"):
                reasons.append("Provides structured predictability during unexpected routine changes")
            elif intv.name in ["Preparation Preview", "Early Arrival"] and context.get("unfamiliar_location"):
                reasons.append("Eases spatial orientation and seating choice in an unfamiliar location")
            elif intv.name == "Reduced Sensory Exposure" and context.get("brightness", 0) >= 0.7:
                reasons.append("Reduces intense visual brightness exposure")

            if not reasons:
                reasons.append("General proactive grounding strategy")

            ranked.append({
                "intervention_id": intv.id,
                "intervention": intv.name,
                "description": intv.description,
                "category": intv.category,
                "score": round(score, 2),
                "historical_effectiveness": round(hist_eff, 2),
                "contextual_relevance": round(context_rel, 2),
                "reason": " • ".join(reasons)
            })

        # Sort descending by recommendation score
        ranked.sort(key=lambda x: x["score"], reverse=True)

        # Assign ranks
        for idx, item in enumerate(ranked):
            item["rank"] = idx + 1

        return ranked[:top_n]
