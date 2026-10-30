"""FastAPI Application for Indian Sign Language (ISL) Recognition.
Provides REST and WebSocket endpoints, plus static frontend hosting.
"""
import sys
import io
from pathlib import Path
from typing import List, Optional
import cv2
import numpy as np
from PIL import Image
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import config
from backend.service import ISLModelService, SessionInferenceState
from preprocessing.landmarks import HandLandmarkExtractor

app = FastAPI(
    title="Indian Sign Language (ISL) Recognition API",
    description="Real-time static sign and dynamic gesture recognition system.",
    version="1.0.0"
)

# Enable CORS for browser development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Model Service
service = ISLModelService()
extractor = HandLandmarkExtractor(static_image_mode=True)
http_session = SessionInferenceState(service)


class PredictStaticRequest(BaseModel):
    features: List[float]


class SetModeRequest(BaseModel):
    mode: str


@app.get("/api/status")
def get_system_status():
    """Returns the backend ML model status and configuration parameters."""
    return {
        "status": "online",
        "models": service.get_status()
    }


@app.get("/api/classes")
def get_classes():
    """Returns the vocabulary of static signs and dynamic gestures supported by the models."""
    return {
        "static_classes": [
            {
                "name": name,
                "type": "Static Word / Sign",
                "description": f"Indian Sign Language sign for '{name}'"
            }
            for name in config.STATIC_CLASSES
        ],
        "dynamic_classes": [
            {
                "name": name,
                "type": "Dynamic Sentence / Gesture",
                "description": f"Multi-frame temporal gesture for '{name.replace('_', ' ')}'"
            }
            for name in config.DYNAMIC_CLASSES
        ]
    }


@app.post("/api/predict/static")
def predict_static_vector(req: PredictStaticRequest):
    """Classify a 128-dimensional normalized landmark feature vector."""
    res = service.predict_static(np.array(req.features, dtype=np.float32))
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    return res


@app.post("/api/predict/frame")
async def predict_image_frame(
    file: UploadFile = File(...),
    mode: str = Form("STATIC")
):
    """Upload an image file, run server-side MediaPipe landmark extraction and classify."""
    try:
        contents = await file.read()
        pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
        img_np = np.array(pil_image)
        # Convert RGB to BGR for OpenCV processing
        bgr_frame = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {e}")

    req_mode = str(mode).upper()
    if req_mode != http_session.mode:
        http_session.set_mode(req_mode)

    hands_dict, _ = extractor.process_frame(bgr_frame)
    has_hands = hands_dict is not None and (hands_dict.get("Left") is not None or hands_dict.get("Right") is not None)

    landmarks_payload = None
    if has_hands:
        left_arr = hands_dict.get("Left")
        right_arr = hands_dict.get("Right")
        landmarks_payload = {
            "Left": left_arr.tolist() if left_arr is not None else None,
            "Right": right_arr.tolist() if right_arr is not None else None,
        }

    # Run session inference with full smoothing, confidence thresholding, and sequence buffering
    result = http_session.process_landmark_frame(landmarks_payload)
    result["buffer_fill"] = result.get("dynamic_buffer_count", 0)
    result["candidates"] = result.get("top_candidates", [])
    result["landmarks"] = landmarks_payload

    # Format prediction object for client
    result["prediction"] = {
        "label": result.get("prediction"),
        "raw_label": result.get("raw_prediction"),
        "confidence": result.get("confidence", 0.0),
        "top_candidates": result.get("top_candidates", []),
    }

    return result


@app.websocket("/ws/predict")
async def websocket_predict_endpoint(websocket: WebSocket):
    """Bidirectional WebSocket for low-latency client-side streaming of landmarks and frames."""
    await websocket.accept()
    session = SessionInferenceState(service)

    try:
        while True:
            data = await websocket.receive_json()
            command = data.get("command") or data.get("type")

            if command in ("set_mode", "switch_mode"):
                mode_val = str(data.get("mode", "STATIC")).upper()
                session.set_mode(mode_val)
                await websocket.send_json({
                    "type": "mode_updated",
                    "mode": session.mode
                })

            elif command == "clear_sentence":
                session.clear_sentence()
                await websocket.send_json({
                    "type": "sentence_cleared",
                    "sentence": "",
                    "sentence_tokens": []
                })

            elif command == "reset_buffer":
                session.dynamic_buffer.clear()
                await websocket.send_json({
                    "type": "buffer_reset",
                    "buffer_fill": 0,
                    "dynamic_buffer_count": 0
                })

            else:
                # Mode sync if included in payload
                if "mode" in data:
                    req_mode = str(data["mode"]).upper()
                    if req_mode != session.mode:
                        session.set_mode(req_mode)

                raw_landmarks = data.get("landmarks")  # List of 21 [x,y,z] or None
                landmarks_dict = None

                # Support streaming base64 JPEG image directly over WebSocket
                image_data = data.get("image")
                if image_data:
                    try:
                        import base64
                        if "," in image_data:
                            image_data = image_data.split(",", 1)[1]
                        img_bytes = base64.b64decode(image_data)
                        pil_img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
                        bgr_frame = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
                        hands_dict, _ = extractor.process_frame(bgr_frame)
                        if hands_dict and (hands_dict.get("Left") is not None or hands_dict.get("Right") is not None):
                            left_arr = hands_dict.get("Left")
                            right_arr = hands_dict.get("Right")
                            raw_landmarks = {
                                "Left": left_arr.tolist() if left_arr is not None else None,
                                "Right": right_arr.tolist() if right_arr is not None else None,
                            }
                            landmarks_dict = raw_landmarks
                        else:
                            raw_landmarks = None
                    except Exception as e:
                        raw_landmarks = None

                result = session.process_landmark_frame(raw_landmarks)

                # Add alias keys and landmarks coordinates
                result["buffer_fill"] = result.get("dynamic_buffer_count", 0)
                result["candidates"] = result.get("top_candidates", [])
                result["landmarks"] = landmarks_dict or (raw_landmarks if isinstance(raw_landmarks, dict) else None)
                result["type"] = "prediction_update"

                await websocket.send_json(result)

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except:
            pass


# Mount Frontend Static Files
FRONTEND_DIR = BASE_DIR / "frontend"
DIST_DIR = FRONTEND_DIR / "dist"

if DIST_DIR.exists():
    if (DIST_DIR / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="dist-assets")
    app.mount("/static", StaticFiles(directory=str(DIST_DIR)), name="dist-static")

    @app.get("/")
    def serve_frontend_dist():
        return FileResponse(str(DIST_DIR / "index.html"))

    @app.get("/{full_path:path}")
    def serve_frontend_spa_fallback(full_path: str):
        # Don't intercept API or docs routes
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_candidate = DIST_DIR / full_path
        if file_candidate.exists() and file_candidate.is_file():
            return FileResponse(str(file_candidate))
        return FileResponse(str(DIST_DIR / "index.html"))

elif FRONTEND_DIR.exists():
    if (FRONTEND_DIR / "css").exists():
        app.mount("/css", StaticFiles(directory=str(FRONTEND_DIR / "css")), name="css")
    if (FRONTEND_DIR / "js").exists():
        app.mount("/js", StaticFiles(directory=str(FRONTEND_DIR / "js")), name="js")
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

    @app.get("/")
    def serve_frontend():
        return FileResponse(str(FRONTEND_DIR / "index.html"))


