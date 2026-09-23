from typing import Dict, Any, List
from app.models.entities import PersonalProfile

class SupportPredictor:
    """
    Layer 4A: Support Requirement Prediction
    Combines current normalized context with the individual's Personal Digital Twin.
    Computes an interpretable, transparent support score (0.0 - 1.0) and assigns
    LOW, MEDIUM, or HIGH support requirement with explainable factors.
    
    IMPORTANT PRODUCT BOUNDARY:
    Never diagnoses autism, predicts meltdowns, or makes clinical claims.
    """

    @classmethod
    def predict(
        cls,
        context: Dict[str, Any],
        profile: PersonalProfile,
        similar_contexts: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        noise = float(context.get("noise_level", 0.5))
        crowd = float(context.get("crowd_level", 0.5))
        brightness = float(context.get("brightness", 0.5))
        routine_val = 1.0 if context.get("routine_change") else 0.0
        unfamiliar_val = 1.0 if context.get("unfamiliar_location") else 0.0

        # Weights from the individual's personal digital twin
        w_noise = profile.noise_sensitivity
        w_crowd = profile.crowd_sensitivity
        w_brightness = profile.brightness_sensitivity
        w_routine = profile.routine_change_sensitivity
        w_unfamiliar = profile.unfamiliar_location_sensitivity

        # Weighted contributions
        c_noise = noise * w_noise
        c_crowd = crowd * w_crowd
        c_brightness = brightness * w_brightness
        c_routine = routine_val * w_routine
        c_unfamiliar = unfamiliar_val * w_unfamiliar

        total_weight = w_noise + w_crowd + w_brightness + w_routine + w_unfamiliar
        raw_score = (c_noise + c_crowd + c_brightness + c_routine + c_unfamiliar) / max(0.01, total_weight)
        
        # Historical context adjustment if available
        hist_adjustment = 0.0
        if similar_contexts:
            # Check how frequently support was rated helpful in top similar contexts
            total_events = 0
            helpful_events = 0
            for sc in similar_contexts[:3]:
                for item in sc.get("interventions", []):
                    total_events += 1
                    if item.get("was_helpful"):
                        helpful_events += 1
            if total_events > 0:
                hist_ratio = helpful_events / total_events
                hist_adjustment = (hist_ratio - 0.5) * 0.08  # small traceable calibration

        final_score = max(0.0, min(1.0, raw_score + hist_adjustment))

        # Categorize
        if final_score <= 0.35:
            level = "LOW"
        elif final_score <= 0.65:
            level = "MEDIUM"
        else:
            level = "HIGH"

        # Confidence: higher when factors clearly align or similar historical contexts exist
        base_confidence = 0.72
        if len(similar_contexts or []) >= 3:
            base_confidence += 0.08
        # Distance from threshold boundary boosts confidence
        boundary_dist = min(abs(final_score - 0.35), abs(final_score - 0.65))
        confidence = min(0.96, max(0.68, base_confidence + (boundary_dist * 0.4)))

        # Traceable contributing factors
        contributing_factors = {
            "noise": round(c_noise / max(0.01, total_weight), 3),
            "crowd": round(c_crowd / max(0.01, total_weight), 3),
            "brightness": round(c_brightness / max(0.01, total_weight), 3),
            "routine_change": round(c_routine / max(0.01, total_weight), 3),
            "unfamiliar_location": round(c_unfamiliar / max(0.01, total_weight), 3)
        }

        # Human-readable reasons
        reasons: List[str] = []
        if noise >= 0.65:
            reasons.append(f"Elevated environmental noise ({int(noise * 100)}%) interacts with high personal noise sensitivity ({int(w_noise * 100)}%)")
        if crowd >= 0.65:
            reasons.append(f"High crowd density ({int(crowd * 100)}%) aligns with crowd sensitivity ({int(w_crowd * 100)}%)")
        if context.get("routine_change"):
            reasons.append(f"Active unexpected routine change triggers personal sensitivity ({int(w_routine * 100)}%)")
        if context.get("unfamiliar_location"):
            reasons.append(f"Unfamiliar physical location introduces environmental uncertainty")
        if brightness >= 0.75:
            reasons.append(f"High visual glare / brightness ({int(brightness * 100)}%)")
        if similar_contexts and len(similar_contexts) > 0:
            reasons.append(f"Resembles {len(similar_contexts)} previous situations where proactive support was beneficial")

        if not reasons:
            reasons.append("Environmental sensory levels and routine stability are currently within comfortable baseline")

        return {
            "support_level": level,
            "support_score": round(final_score, 3),
            "confidence": round(confidence, 2),
            "reasons": reasons,
            "contributing_factors": contributing_factors
        }
