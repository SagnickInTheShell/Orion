from typing import Dict, Any, List

class ContextEngine:
    """
    Layer 2: Context Intelligence
    Converts raw sensor or manual input into structured, normalized (0.0 - 1.0)
    contextual features and produces human-readable context descriptions.
    """

    @staticmethod
    def normalize_value(val: Any, default: float = 0.5) -> float:
        try:
            f = float(val)
            return max(0.0, min(1.0, f))
        except (ValueError, TypeError):
            return default

    @classmethod
    def process_context(cls, raw: Dict[str, Any]) -> Dict[str, Any]:
        noise = cls.normalize_value(raw.get("noise_level"), 0.5)
        crowd = cls.normalize_value(raw.get("crowd_level"), 0.5)
        brightness = cls.normalize_value(raw.get("brightness"), 0.5)
        activity = cls.normalize_value(raw.get("activity_level"), 0.5)
        
        routine_change = bool(raw.get("routine_change", False))
        unfamiliar_location = bool(raw.get("unfamiliar_location", False))
        
        event_type = str(raw.get("event_type", "general"))
        location_type = str(raw.get("location_type", "indoor"))

        descriptions: List[str] = []
        if noise >= 0.70:
            descriptions.append(f"High environmental noise ({int(noise * 100)}%)")
        elif noise >= 0.40:
            descriptions.append("Moderate ambient sound")
        else:
            descriptions.append("Quiet acoustic environment")

        if crowd >= 0.70:
            descriptions.append(f"High crowd density ({int(crowd * 100)}%)")
        elif crowd >= 0.40:
            descriptions.append("Moderate crowd presence")
        else:
            descriptions.append("Low crowd density / personal space")

        if brightness >= 0.75:
            descriptions.append("Intense / bright visual lighting")
        elif brightness <= 0.30:
            descriptions.append("Dim / low visual lighting")

        if routine_change:
            descriptions.append("Unexpected routine / schedule change")

        if unfamiliar_location:
            descriptions.append("Unfamiliar physical setting")

        return {
            "noise_level": noise,
            "crowd_level": crowd,
            "brightness": brightness,
            "activity_level": activity,
            "routine_change": routine_change,
            "unfamiliar_location": unfamiliar_location,
            "event_type": event_type,
            "location_type": location_type,
            "human_descriptions": descriptions,
            "feature_vector": [
                noise,
                crowd,
                brightness,
                activity,
                1.0 if routine_change else 0.0,
                1.0 if unfamiliar_location else 0.0
            ]
        }
