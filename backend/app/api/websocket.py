import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.database.connection import SessionLocal
from app.models.entities import PersonalProfile
from app.services.context_engine import ContextEngine
from app.services.predictor import SupportPredictor
from app.services.similarity import SimilarityEngine

router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws/context")
async def websocket_context_endpoint(websocket: WebSocket):
    """
    Real-time streaming endpoint for derived numeric features (never raw audio/video).
    Computes instantaneous support requirement predictions as sliders or sensors move.
    """
    await websocket.accept()
    db = SessionLocal()
    try:
        while True:
            data_text = await websocket.receive_text()
            try:
                data = json.loads(data_text)
                user_id = data.get("user_id", 1)
                
                # Normalize context
                processed = ContextEngine.process_context(data)
                
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

                pred = SupportPredictor.predict(processed, profile)

                response = {
                    "type": "prediction_update",
                    "context": processed,
                    "support_level": pred["support_level"],
                    "support_score": pred["support_score"],
                    "confidence": pred["confidence"],
                    "reasons": pred["reasons"],
                    "contributing_factors": pred["contributing_factors"]
                }
                await websocket.send_text(json.dumps(response))
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"error": "Invalid JSON format"}))
    except WebSocketDisconnect:
        pass
    finally:
        db.close()
