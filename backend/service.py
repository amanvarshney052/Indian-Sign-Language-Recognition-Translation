"""Backend Inference Service for Indian Sign Language (ISL) Recognition.
Manages dual-hand 128-d feature models, smoothing deques, rolling dynamic sequence buffers,
and duplicate suppression.
"""
from typing import Dict, List, Optional, Tuple, Any, Union
from pathlib import Path
from collections import deque, Counter
import numpy as np
import tensorflow as tf
from tensorflow import keras

# Add project root to sys.path
import config
from preprocessing.normalization import normalize_dual_hand_landmarks, normalize_landmarks
from preprocessing.dataset_loader import load_label_map


def _patch_keras_deserialization():
    """Ensure cross-version compatibility for Keras layer deserialization.
    Fixes 'Unrecognized keyword arguments passed to Dense: quantization_config'
    when loading models across different Keras 3 minor versions.
    """
    try:
        import keras
        # Patch all Keras layers to strip unsupported serialization kwargs like quantization_config
        for attr in dir(keras.layers):
            cls = getattr(keras.layers, attr)
            if isinstance(cls, type) and issubclass(cls, keras.layers.Layer):
                orig_init = cls.__init__
                def _wrap_init(original):
                    def _patched_init(self, *args, **kwargs):
                        kwargs.pop("quantization_config", None)
                        return original(self, *args, **kwargs)
                    return _patched_init
                cls.__init__ = _wrap_init(orig_init)
    except Exception:
        pass


_patch_keras_deserialization()


class ISLModelService:
    def __init__(self):
        self.static_model: Optional[keras.Model] = None
        self.static_labels: Dict[int, str] = {}
        self.dynamic_model: Optional[keras.Model] = None
        self.dynamic_labels: Dict[int, str] = {}

        self.confidence_threshold = config.CONFIDENCE_THRESHOLD
        self.smoothing_window = config.SMOOTHING_WINDOW

        self.load_models()

    def load_models(self):
        # Load Static MLP
        if config.STATIC_MODEL_PATH.exists() and config.STATIC_LABELS_PATH.exists():
            try:
                self.static_model = keras.models.load_model(config.STATIC_MODEL_PATH)
                _, self.static_labels = load_label_map(config.STATIC_LABELS_PATH)
                print(f"Loaded static MLP model with {len(self.static_labels)} classes.")
            except Exception as e:
                print(f"Error loading static model: {e}")

        # Load Dynamic BiLSTM
        if config.DYNAMIC_MODEL_PATH.exists() and config.DYNAMIC_LABELS_PATH.exists():
            try:
                self.dynamic_model = keras.models.load_model(config.DYNAMIC_MODEL_PATH)
                _, self.dynamic_labels = load_label_map(config.DYNAMIC_LABELS_PATH)
                print(f"Loaded dynamic LSTM model with {len(self.dynamic_labels)} classes.")
            except Exception as e:
                print(f"Error loading dynamic model: {e}")

    def get_status(self) -> Dict[str, Any]:
        return {
            "static_model_loaded": self.static_model is not None,
            "static_classes": list(self.static_labels.values()),
            "dynamic_model_loaded": self.dynamic_model is not None,
            "dynamic_classes": list(self.dynamic_labels.values()),
            "confidence_threshold": self.confidence_threshold,
            "smoothing_window": self.smoothing_window,
            "sequence_length": config.SEQUENCE_LENGTH,
            "feature_dim": config.NUM_FEATURES
        }

    def predict_static(self, features: np.ndarray) -> Dict[str, Any]:
        if self.static_model is None:
            return {"error": "Static model not loaded"}

        features = np.asarray(features, dtype=np.float32)
        if features.shape != (config.NUM_FEATURES,):
            return {"error": f"Expected features shape ({config.NUM_FEATURES},), got {features.shape}"}

        sample = np.expand_dims(features, axis=0)
        probs = self.static_model(sample, training=False).numpy()[0]
        top_idx = int(np.argmax(probs))
        confidence = float(probs[top_idx])
        label = self.static_labels.get(top_idx, f"Class_{top_idx}")

        all_probs = {
            self.static_labels.get(i, str(i)): float(prob)
            for i, prob in enumerate(probs)
        }

        # Top 4 predictions
        sorted_candidates = sorted(all_probs.items(), key=lambda x: x[1], reverse=True)[:4]

        return {
            "label": label if confidence >= self.confidence_threshold else None,
            "raw_label": label,
            "confidence": confidence,
            "probabilities": all_probs,
            "top_candidates": [{"label": k, "confidence": v} for k, v in sorted_candidates]
        }

    def predict_dynamic(self, sequence: np.ndarray) -> Dict[str, Any]:
        if self.dynamic_model is None:
            return {"error": "Dynamic model not loaded"}

        sequence = np.asarray(sequence, dtype=np.float32)
        if sequence.shape != (config.SEQUENCE_LENGTH, config.NUM_FEATURES):
            return {
                "error": f"Expected sequence shape ({config.SEQUENCE_LENGTH}, {config.NUM_FEATURES}), got {sequence.shape}"
            }

        sample = np.expand_dims(sequence, axis=0)
        probs = self.dynamic_model(sample, training=False).numpy()[0]
        top_idx = int(np.argmax(probs))
        confidence = float(probs[top_idx])
        label = self.dynamic_labels.get(top_idx, f"Class_{top_idx}")

        all_probs = {
            self.dynamic_labels.get(i, str(i)): float(prob)
            for i, prob in enumerate(probs)
        }

        sorted_candidates = sorted(all_probs.items(), key=lambda x: x[1], reverse=True)[:4]

        return {
            "label": label if confidence >= self.confidence_threshold else None,
            "raw_label": label,
            "confidence": confidence,
            "probabilities": all_probs,
            "top_candidates": [{"label": k, "confidence": v} for k, v in sorted_candidates]
        }


class SessionInferenceState:
    """Maintains state for a single interactive streaming session (e.g. WebSocket)."""

    def __init__(self, service: ISLModelService):
        self.service = service
        self.mode = "STATIC"  # "STATIC" or "DYNAMIC"
        self.dynamic_buffer = deque(maxlen=config.SEQUENCE_LENGTH)
        self.prediction_history = deque(maxlen=config.SMOOTHING_WINDOW)
        self.sentence_tokens: List[str] = []
        self.last_added_token: Optional[str] = None
        self.duplicate_cooldown = 0
        self.last_valid_features: Optional[np.ndarray] = None

    def set_mode(self, mode: str):
        if mode.upper() in ["STATIC", "DYNAMIC"]:
            self.mode = mode.upper()
            self.dynamic_buffer.clear()
            self.prediction_history.clear()

    def process_landmark_frame(self, raw_landmarks: Any) -> Dict[str, Any]:
        """Process incoming landmark data (dual-hand dict, list of hand objects, or raw array)."""
        hand_detected = False
        norm_features = None

        if raw_landmarks is not None:
            try:
                if isinstance(raw_landmarks, dict):
                    left = raw_landmarks.get("Left")
                    right = raw_landmarks.get("Right")
                    if (left is not None and len(left) == 21) or (right is not None and len(right) == 21):
                        norm_features = normalize_dual_hand_landmarks(left, right)
                        hand_detected = True

                elif isinstance(raw_landmarks, list):
                    if len(raw_landmarks) == 21:
                        # Single hand -> right hand
                        norm_features = normalize_dual_hand_landmarks(None, raw_landmarks)
                        hand_detected = True
                    elif len(raw_landmarks) == 42:
                        # Concatenated dual hands
                        norm_features = normalize_dual_hand_landmarks(raw_landmarks[:21], raw_landmarks[21:])
                        hand_detected = True
                    elif len(raw_landmarks) in (1, 2) and isinstance(raw_landmarks[0], dict):
                        left = None
                        right = None
                        for h in raw_landmarks:
                            cat = h.get("handedness", "Right")
                            lms = h.get("landmarks")
                            if cat == "Left":
                                left = lms
                            else:
                                right = lms
                        if left is not None or right is not None:
                            norm_features = normalize_dual_hand_landmarks(left, right)
                            hand_detected = True
                    elif len(raw_landmarks) == 128:
                        norm_features = np.asarray(raw_landmarks, dtype=np.float32)
                        hand_detected = True

            except Exception as e:
                print(f"[SessionInference] Error normalizing landmarks: {e}")
                hand_detected = False

        prediction_result = None
        current_pred_token = None
        confidence = 0.0

        if hand_detected and norm_features is not None:
            self.last_valid_features = norm_features

            if self.mode == "STATIC":
                res = self.service.predict_static(norm_features)
                prediction_result = res
                current_pred_token = res.get("label")
                confidence = res.get("confidence", 0.0)

            elif self.mode == "DYNAMIC":
                self.dynamic_buffer.append(norm_features)
                if len(self.dynamic_buffer) == config.SEQUENCE_LENGTH:
                    seq_array = np.array(list(self.dynamic_buffer), dtype=np.float32)
                    res = self.service.predict_dynamic(seq_array)
                    prediction_result = res
                    current_pred_token = res.get("label")
                    confidence = res.get("confidence", 0.0)

        else:
            if self.mode == "DYNAMIC" and len(self.dynamic_buffer) > 0 and self.last_valid_features is not None:
                # Carry forward last valid pose for brief occlusion
                self.dynamic_buffer.append(self.last_valid_features.copy())

        # Prediction smoothing (Majority voting)
        smoothed_token = self._smooth(current_pred_token)
        self._update_sentence(smoothed_token)

        final_token = smoothed_token or current_pred_token

        return {
            "mode": self.mode,
            "hand_detected": hand_detected,
            "prediction": final_token,
            "predicted_token": final_token,
            "raw_prediction": current_pred_token,
            "confidence": confidence,
            "top_candidates": prediction_result.get("top_candidates", []) if prediction_result else [],
            "dynamic_buffer_count": len(self.dynamic_buffer),
            "sentence": " ".join(self.sentence_tokens),
            "sentence_tokens": self.sentence_tokens
        }

    def _smooth(self, raw_token: Optional[str]) -> Optional[str]:
        if raw_token is not None:
            self.prediction_history.append(raw_token)
        else:
            if self.prediction_history:
                self.prediction_history.popleft()
            return None

        if len(self.prediction_history) < (config.SMOOTHING_WINDOW // 2 + 1):
            return None

        most_common, count = Counter(self.prediction_history).most_common(1)[0]
        if count >= (config.SMOOTHING_WINDOW // 2 + 1):
            return most_common
        return None

    def _update_sentence(self, token: Optional[str]):
        if self.duplicate_cooldown > 0:
            self.duplicate_cooldown -= 1

        if token is None:
            if len(self.prediction_history) == 0:
                self.last_added_token = None
            return

        if token != self.last_added_token or self.duplicate_cooldown == 0:
            if token != self.last_added_token:
                self.sentence_tokens.append(token)
                self.last_added_token = token
                self.duplicate_cooldown = config.DUPLICATE_COOLDOWN_FRAMES

    def clear_sentence(self):
        self.sentence_tokens.clear()
        self.last_added_token = None
        self.prediction_history.clear()
        self.dynamic_buffer.clear()
