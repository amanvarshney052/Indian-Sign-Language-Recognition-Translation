"""Real-time Indian Sign Language (ISL) Recognition using OpenCV, MediaPipe, and Keras.

Supports:
- Dual Modes: Static (MLP) and Dynamic (LSTM)
- Prediction Smoothing (Majority Voting)
- Confidence Thresholding
- Duplicate Suppression
- Sentence Construction
- Asynchronous Text-to-Speech (TTS)
"""
import sys
import time
import threading
from collections import deque, Counter
from pathlib import Path
from typing import Optional, List, Tuple
import cv2
import numpy as np

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import config
from preprocessing.landmarks import HandLandmarkExtractor
from preprocessing.normalization import normalize_dual_hand_landmarks
from preprocessing.dataset_loader import load_label_map

# Optional TTS
try:
    import pyttsx3
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False


class TextToSpeechSpeaker:
    """Non-blocking background Text-To-Speech speaker."""

    def __init__(self):
        self.lock = threading.Lock()
        self.is_speaking = False

    def speak(self, text: str):
        if not TTS_AVAILABLE or not text.strip():
            return
        if self.is_speaking:
            return

        thread = threading.Thread(target=self._run_tts, args=(text,), daemon=True)
        thread.start()

    def _run_tts(self, text: str):
        with self.lock:
            self.is_speaking = True
            try:
                engine = pyttsx3.init()
                engine.setProperty('rate', 160)
                engine.say(text)
                engine.runAndWait()
            except Exception as e:
                print(f"TTS Error: {e}")
            finally:
                self.is_speaking = False


class RealTimeISLRecognizer:
    """End-to-end real-time ISL recognizer with OpenCV visual overlay."""

    def __init__(self):
        self.mode = "STATIC"  # "STATIC" or "DYNAMIC"
        self.dynamic_buffer = deque(maxlen=config.SEQUENCE_LENGTH)
        self.prediction_history = deque(maxlen=config.SMOOTHING_WINDOW)
        self.sentence_tokens: List[str] = []
        self.last_added_token: Optional[str] = None
        self.duplicate_cooldown = 0
        self.confidence_threshold = config.CONFIDENCE_THRESHOLD
        self.smoothing_window = config.SMOOTHING_WINDOW

        self.speaker = TextToSpeechSpeaker()
        self.extractor = HandLandmarkExtractor(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

        # Load models if available
        self.static_model = None
        self.static_labels = {}
        self.dynamic_model = None
        self.dynamic_labels = {}
        self._load_models()

    def _load_models(self):
        import tensorflow as tf
        from tensorflow import keras

        if config.STATIC_MODEL_PATH.exists() and config.STATIC_LABELS_PATH.exists():
            try:
                self.static_model = keras.models.load_model(config.STATIC_MODEL_PATH)
                _, self.static_labels = load_label_map(config.STATIC_LABELS_PATH)
                print("Loaded static MLP model successfully.")
            except Exception as e:
                print(f"Warning: Could not load static model: {e}")
        else:
            print(f"Static model or labels not found at {config.STATIC_MODEL_PATH}. Static predictions will be disabled.")

        if config.DYNAMIC_MODEL_PATH.exists() and config.DYNAMIC_LABELS_PATH.exists():
            try:
                self.dynamic_model = keras.models.load_model(config.DYNAMIC_MODEL_PATH)
                _, self.dynamic_labels = load_label_map(config.DYNAMIC_LABELS_PATH)
                print("Loaded dynamic LSTM model successfully.")
            except Exception as e:
                print(f"Warning: Could not load dynamic model: {e}")
        else:
            print(f"Dynamic model or labels not found at {config.DYNAMIC_MODEL_PATH}. Dynamic predictions will be disabled.")

    def smooth_prediction(self, raw_pred: Optional[str]) -> Optional[str]:
        """Apply majority voting smoothing over the recent predictions buffer."""
        if raw_pred is not None:
            self.prediction_history.append(raw_pred)
        else:
            # When hand is absent, gradually age out predictions
            if self.prediction_history:
                self.prediction_history.popleft()
            return None

        if len(self.prediction_history) < (self.smoothing_window // 2 + 1):
            return None

        counter = Counter(self.prediction_history)
        most_common, count = counter.most_common(1)[0]
        # Require majority agreement (e.g. at least 3 out of 5)
        if count >= (self.smoothing_window // 2 + 1):
            return most_common
        return None

    def update_sentence(self, smoothed_token: Optional[str]):
        """Update sentence with duplicate suppression and cooldown."""
        if self.duplicate_cooldown > 0:
            self.duplicate_cooldown -= 1

        if smoothed_token is None:
            # If user lowers hand, reset last added token so they can sign the same token again
            if len(self.prediction_history) == 0:
                self.last_added_token = None
            return

        if smoothed_token != self.last_added_token or self.duplicate_cooldown == 0:
            if smoothed_token != self.last_added_token:
                self.sentence_tokens.append(smoothed_token)
                self.last_added_token = smoothed_token
                self.duplicate_cooldown = config.DUPLICATE_COOLDOWN_FRAMES

    def predict_static(self, features: np.ndarray) -> Tuple[Optional[str], float]:
        if self.static_model is None or not self.static_labels:
            return None, 0.0
        input_data = np.expand_dims(features, axis=0)  # (1, 128)
        probs = self.static_model(input_data, training=False).numpy()[0]
        idx = int(np.argmax(probs))
        confidence = float(probs[idx])
        if confidence >= self.confidence_threshold:
            return self.static_labels.get(idx, f"Class_{idx}"), confidence
        return None, confidence

    def predict_dynamic(self) -> Tuple[Optional[str], float]:
        if self.dynamic_model is None or not self.dynamic_labels:
            return None, 0.0
        if len(self.dynamic_buffer) < config.SEQUENCE_LENGTH:
            return None, 0.0
        seq_array = np.array(list(self.dynamic_buffer), dtype=np.float32)
        seq_array = np.expand_dims(seq_array, axis=0)  # (1, 30, 128)
        probs = self.dynamic_model(seq_array, training=False).numpy()[0]
        idx = int(np.argmax(probs))
        confidence = float(probs[idx])
        if confidence >= self.confidence_threshold:
            return self.dynamic_labels.get(idx, f"Class_{idx}"), confidence
        return None, confidence

    def run(self):
        print("=" * 60)
        print("STARTING REAL-TIME ISL RECOGNIZER")
        print("Controls:")
        print("  S: Switch to STATIC Mode")
        print("  D: Switch to DYNAMIC Mode")
        print("  T: Text-To-Speech (speak sentence)")
        print("  C: Clear sentence buffer")
        print("  Q: Quit")
        print("=" * 60)

        backend = cv2.CAP_DSHOW if sys.platform == "win32" else cv2.CAP_ANY
        print("Connecting to webcam...")
        cap = cv2.VideoCapture(config.CAMERA_INDEX, backend)
        if not cap.isOpened():
            cap = cv2.VideoCapture(config.CAMERA_INDEX)
            if not cap.isOpened():
                print(f"Error: Could not open webcam at index {config.CAMERA_INDEX}.")
                return

        cap.set(cv2.CAP_PROP_FRAME_WIDTH, config.FRAME_WIDTH)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, config.FRAME_HEIGHT)
        print("Webcam connected. Live recognition window active.")

        cv2.namedWindow("Indian Sign Language Recognition", cv2.WINDOW_AUTOSIZE)
        last_valid_features = None
        consecutive_read_failures = 0

        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    consecutive_read_failures += 1
                    if consecutive_read_failures > 30:
                        print("Failed to read from webcam after multiple attempts.")
                        break
                    time.sleep(0.02)
                    continue
                consecutive_read_failures = 0

                frame = cv2.flip(frame, 1)
                h, w, _ = frame.shape

                # Landmark extraction
                hands_dict, raw_results = self.extractor.process_frame(frame)
                hand_detected = hands_dict is not None and (
                    hands_dict.get("Left") is not None or hands_dict.get("Right") is not None
                )

                current_pred: Optional[str] = None
                confidence: float = 0.0

                if hand_detected:
                    self.extractor.draw_landmarks(frame, raw_results)
                    features = normalize_dual_hand_landmarks(
                        hands_dict.get("Left"), hands_dict.get("Right")
                    )
                    last_valid_features = features

                    if self.mode == "STATIC":
                        current_pred, confidence = self.predict_static(features)
                    elif self.mode == "DYNAMIC":
                        self.dynamic_buffer.append(features)
                        if len(self.dynamic_buffer) == config.SEQUENCE_LENGTH:
                            current_pred, confidence = self.predict_dynamic()
                else:
                    if self.mode == "DYNAMIC":
                        # If hand temporarily dropped for 1-2 frames while buffer has data, carry forward
                        if len(self.dynamic_buffer) > 0 and len(self.dynamic_buffer) < config.SEQUENCE_LENGTH and last_valid_features is not None:
                            self.dynamic_buffer.append(last_valid_features)

                # Smoothing & Sentence update
                smoothed = self.smooth_prediction(current_pred)
                self.update_sentence(smoothed)

                # Render UI Overlay
                self._render_ui(frame, hand_detected, smoothed or current_pred, confidence)

                cv2.imshow("Indian Sign Language Recognition", frame)
                key = cv2.waitKey(1) & 0xFF

                if key == ord('q') or key == 27:
                    break
                elif key == ord('s') or key == ord('S'):
                    self.mode = "STATIC"
                    self.prediction_history.clear()
                    self.dynamic_buffer.clear()
                elif key == ord('d') or key == ord('D'):
                    self.mode = "DYNAMIC"
                    self.prediction_history.clear()
                    self.dynamic_buffer.clear()
                elif key == ord('t') or key == ord('T'):
                    sentence_text = " ".join(self.sentence_tokens)
                    print(f"[TTS Speaking]: {sentence_text}")
                    self.speaker.speak(sentence_text)
                elif key == ord('c') or key == ord('C'):
                    self.sentence_tokens.clear()
                    self.last_added_token = None
                    self.prediction_history.clear()

        finally:
            self.extractor.close()
            cap.release()
            cv2.destroyAllWindows()

    def _render_ui(
        self,
        frame: np.ndarray,
        hand_detected: bool,
        predicted_token: Optional[str],
        confidence: float
    ):
        h, w, _ = frame.shape

        # Header Bar
        cv2.rectangle(frame, (0, 0), (w, 65), (20, 20, 20), -1)
        cv2.putText(
            frame,
            "INDIAN SIGN LANGUAGE RECOGNITION",
            (15, 28),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 255),
            2
        )

        # Mode Indicator Badge
        mode_color = (255, 200, 0) if self.mode == "STATIC" else (255, 100, 255)
        cv2.putText(
            frame,
            f"MODE: {self.mode}",
            (15, 54),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            mode_color,
            2
        )

        # Status Pill
        if hand_detected:
            cv2.circle(frame, (w - 25, 32), 10, (0, 255, 0), -1)
            cv2.putText(frame, "Hand Detected", (w - 155, 37), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
        else:
            cv2.circle(frame, (w - 25, 32), 10, (0, 0, 255), -1)
            cv2.putText(frame, "No hand detected", (w - 175, 37), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)

        # Prediction Display Box
        cv2.rectangle(frame, (10, 75), (280, 145), (35, 35, 35), -1)
        cv2.rectangle(frame, (10, 75), (280, 145), (70, 70, 70), 1)

        pred_str = predicted_token if predicted_token else "--"
        conf_str = f"{confidence * 100:.1f}%" if predicted_token else "--%"

        cv2.putText(frame, "PREDICTION:", (20, 95), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 180, 180), 1)
        cv2.putText(frame, pred_str, (20, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.95, (0, 255, 255), 2)

        cv2.putText(frame, "CONFIDENCE:", (160, 95), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 180, 180), 1)
        cv2.putText(frame, conf_str, (160, 130), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0) if confidence >= self.confidence_threshold else (150, 150, 150), 2)

        # Dynamic Buffer Progress (Only in Dynamic Mode)
        if self.mode == "DYNAMIC":
            buf_len = len(self.dynamic_buffer)
            cv2.rectangle(frame, (10, 155), (280, 185), (35, 35, 35), -1)
            cv2.putText(frame, f"Seq Buffer: {buf_len}/{config.SEQUENCE_LENGTH}", (20, 175), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (220, 220, 220), 1)
            fill_w = int(120 * (buf_len / config.SEQUENCE_LENGTH))
            cv2.rectangle(frame, (150, 163), (270, 177), (70, 70, 70), 1)
            cv2.rectangle(frame, (150, 163), (150 + fill_w, 177), (255, 100, 255), -1)

        # Sentence Construction Bar
        sentence_str = " ".join(self.sentence_tokens) if self.sentence_tokens else "(Sentence is empty)"
        cv2.rectangle(frame, (0, h - 75), (w, h - 35), (25, 25, 25), -1)
        cv2.putText(frame, "Sentence: ", (15, h - 50), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 180, 180), 1)
        cv2.putText(
            frame,
            sentence_str,
            (115, h - 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.65,
            (255, 255, 255) if self.sentence_tokens else (120, 120, 120),
            2
        )

        # Footer Keys Bar
        cv2.rectangle(frame, (0, h - 35), (w, h), (15, 15, 15), -1)
        cv2.putText(
            frame,
            "[S] Static  [D] Dynamic  [T] Speak (TTS)  [C] Clear  [Q] Quit",
            (15, h - 12),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.48,
            (200, 200, 200),
            1
        )


def main():
    recognizer = RealTimeISLRecognizer()
    recognizer.run()


if __name__ == "__main__":
    main()
