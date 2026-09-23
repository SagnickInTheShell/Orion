import math
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.entities import Context, Recommendation, Feedback, Intervention

class SimilarityEngine:
    """
    Finds historical situations with similar environmental and contextual conditions.
    Uses Euclidean distance across normalized 6D context features.
    """

    @staticmethod
    def context_to_vector(ctx: Context) -> List[float]:
        return [
            float(ctx.noise_level),
            float(ctx.crowd_level),
            float(ctx.brightness),
            float(ctx.activity_level or 0.5),
            1.0 if ctx.routine_change else 0.0,
            1.0 if ctx.unfamiliar_location else 0.0
        ]

    @classmethod
    def calculate_distance(cls, vec1: List[float], vec2: List[float], weights: List[float] = None) -> float:
        if weights is None:
            weights = [1.0] * len(vec1)
        squared_sum = 0.0
        for v1, v2, w in zip(vec1, vec2, weights):
            squared_sum += w * ((v1 - v2) ** 2)
        return math.sqrt(squared_sum)

    @classmethod
    def find_similar_contexts(
        cls,
        db: Session,
        user_id: int,
        current_vector: List[float],
        top_k: int = 5,
        exclude_context_id: int = None
    ) -> List[Dict[str, Any]]:
        query = db.query(Context).filter(Context.user_id == user_id)
        if exclude_context_id:
            query = query.filter(Context.id != exclude_context_id)
        historical_contexts = query.all()

        if not historical_contexts:
            return []

        # Weights emphasize noise, crowd, and routine changes
        weights = [1.2, 1.2, 0.8, 0.6, 1.4, 1.1]

        scored: List[Tuple[float, Context]] = []
        for ctx in historical_contexts:
            hist_vec = cls.context_to_vector(ctx)
            dist = cls.calculate_distance(current_vector, hist_vec, weights)
            scored.append((dist, ctx))

        scored.sort(key=lambda x: x[0])
        top_matches = scored[:top_k]

        results = []
        for dist, ctx in top_matches:
            # Map distance to similarity (0.0 to 1.0)
            similarity = max(0.0, 1.0 - (dist / 2.5))
            
            # Find any recommendations and feedbacks associated with this historical context
            recs = db.query(Recommendation).filter(Recommendation.context_id == ctx.id).all()
            intervention_outcomes = []
            for r in recs:
                fb = db.query(Feedback).filter(Feedback.recommendation_id == r.id).first()
                intervention = db.query(Intervention).filter(Intervention.id == r.intervention_id).first()
                if intervention:
                    intervention_outcomes.append({
                        "intervention_name": intervention.name,
                        "rating": fb.rating if fb else None,
                        "was_helpful": (fb.rating >= 3) if fb else None,
                        "score": r.score
                    })

            results.append({
                "context_id": ctx.id,
                "timestamp": ctx.timestamp,
                "event_type": ctx.event_type,
                "noise_level": ctx.noise_level,
                "crowd_level": ctx.crowd_level,
                "brightness": ctx.brightness,
                "routine_change": ctx.routine_change,
                "unfamiliar_location": ctx.unfamiliar_location,
                "distance": round(dist, 3),
                "similarity": round(similarity, 3),
                "interventions": intervention_outcomes
            })

        return results
