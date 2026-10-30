"""MediaPipe HandLandmarker wrapper for extracting and visualizing 21 3D hand landmarks.
Supports dual-hand extraction (Left & Right hands) compatible with Python 3.12+ and MediaPipe Tasks API.
"""
from typing import Optional, Tuple, Any, Dict
from pathlib import Path
import urllib.request
import numpy as np
import cv2

try:
    import mediapipe as mp
    from mediapipe.tasks import python as mp_tasks
    from mediapipe.tasks.python import vision
    MP_AVAILABLE = True
except ImportError:
    MP_AVAILABLE = False

# Default Hand skeleton connection pairs (landmark indices 0 to 20)
HAND_CONNECTIONS = [
    # Palm
    (0, 1), (0, 5), (5, 9), (9, 13), (13, 17), (0, 17),
    # Thumb
    (1, 2), (2, 3), (3, 4),
    # Index finger
    (5, 6), (6, 7), (7, 8),
    # Middle finger
    (9, 10), (10, 11), (11, 12),
    # Ring finger
    (13, 14), (14, 15), (15, 16),
    # Pinky finger
    (17, 18), (18, 19), (19, 20)
]

DEFAULT_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"


def ensure_model_asset(model_path: Path) -> Path:
    """Ensure the MediaPipe hand_landmarker.task model is available locally."""
    model_path = Path(model_path)
    if not model_path.exists():
        model_path.parent.mkdir(parents=True, exist_ok=True)
        print(f"Downloading hand_landmarker.task to {model_path}...")
        urllib.request.urlretrieve(DEFAULT_MODEL_URL, str(model_path))
        print("Download complete.")
    return model_path


class HandLandmarkExtractor:
    """Wrapper around MediaPipe Tasks HandLandmarker for extracting up to 2 3D hands."""

    def __init__(
        self,
        static_image_mode: bool = False,
        max_num_hands: int = 2,
        min_detection_confidence: float = 0.5,
        min_tracking_confidence: float = 0.5,
        model_path: Optional[Path] = None
    ):
        if not MP_AVAILABLE:
            raise ImportError("MediaPipe is not installed. Run `pip install mediapipe`.")

        self.max_num_hands = max_num_hands
        self.min_detection_confidence = min_detection_confidence
        self.min_tracking_confidence = min_tracking_confidence

        if model_path is None:
            base_dir = Path(__file__).resolve().parent.parent
            model_path = base_dir / "models" / "hand_landmarker.task"

        self.model_path = ensure_model_asset(model_path)

        # Initialize Tasks HandLandmarker
        base_options = mp_tasks.BaseOptions(model_asset_path=str(self.model_path))
        options = vision.HandLandmarkerOptions(
            base_options=base_options,
            running_mode=vision.RunningMode.IMAGE,
            num_hands=self.max_num_hands,
            min_hand_detection_confidence=self.min_detection_confidence,
            min_tracking_confidence=self.min_tracking_confidence
        )
        self.detector = vision.HandLandmarker.create_from_options(options)

    def process_frame(self, frame: np.ndarray) -> Tuple[Optional[Dict[str, Optional[np.ndarray]]], Any]:
        """Process an OpenCV BGR frame and return structured dict containing 'Left' and 'Right' landmarks.

        Args:
            frame: BGR numpy image frame (H, W, 3).

        Returns:
            Tuple of (hands_dict, result) where hands_dict is:
            {
                'Left': Optional[np.ndarray of shape (21, 3)],
                'Right': Optional[np.ndarray of shape (21, 3)],
                'primary': Optional[np.ndarray of shape (21, 3)]
            }
            or (None, result) if no hands detected.
        """
        if frame is None or frame.size == 0:
            return None, None

        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

        # Detect
        result = self.detector.detect(mp_image)

        if not result.hand_landmarks:
            return None, result

        hands_dict: Dict[str, Optional[np.ndarray]] = {
            "Left": None,
            "Right": None
        }

        detected_landmarks = []
        detected_categories = []

        for idx, hand_lms in enumerate(result.hand_landmarks):
            lms_arr = np.array([[lm.x, lm.y, lm.z] for lm in hand_lms], dtype=np.float32)
            category = "Right"
            if result.handedness and idx < len(result.handedness):
                category = result.handedness[idx][0].category_name

            detected_landmarks.append(lms_arr)
            detected_categories.append(category)

        # Assign to Left / Right
        if len(detected_landmarks) == 1:
            cat = detected_categories[0]
            hands_dict[cat] = detected_landmarks[0]
        elif len(detected_landmarks) >= 2:
            cat0, cat1 = detected_categories[0], detected_categories[1]
            if cat0 != cat1:
                hands_dict[cat0] = detected_landmarks[0]
                hands_dict[cat1] = detected_landmarks[1]
            else:
                # Same category assigned by detector: assign based on horizontal x position
                wrist0_x = detected_landmarks[0][0, 0]
                wrist1_x = detected_landmarks[1][0, 0]
                if wrist0_x < wrist1_x:
                    hands_dict["Left"] = detected_landmarks[0]
                    hands_dict["Right"] = detected_landmarks[1]
                else:
                    hands_dict["Left"] = detected_landmarks[1]
                    hands_dict["Right"] = detected_landmarks[0]

        # Set primary hand for single-hand fallback
        hands_dict["primary"] = hands_dict["Right"] if hands_dict["Right"] is not None else hands_dict["Left"]

        return hands_dict, result

    def draw_landmarks(self, frame: np.ndarray, result: Any) -> np.ndarray:
        """Draw dual-hand landmark points and skeletons directly on frame."""
        if result is None or not getattr(result, "hand_landmarks", None):
            return frame

        h, w, _ = frame.shape

        for hand_idx, hand in enumerate(result.hand_landmarks):
            # Left Hand = Purple, Right Hand = Cyan
            category = "Right"
            if result.handedness and hand_idx < len(result.handedness):
                category = result.handedness[hand_idx][0].category_name

            line_color = (247, 85, 168) if category == "Left" else (255, 240, 0)
            point_color = (255, 180, 240) if category == "Left" else (255, 255, 255)

            coords = []
            for lm in hand:
                cx, cy = int(lm.x * w), int(lm.y * h)
                coords.append((cx, cy))

            # Draw connection lines
            for start_idx, end_idx in HAND_CONNECTIONS:
                if start_idx < len(coords) and end_idx < len(coords):
                    cv2.line(frame, coords[start_idx], coords[end_idx], line_color, 2)

            # Draw landmark joint dots
            for idx, (cx, cy) in enumerate(coords):
                if idx in (4, 8, 12, 16, 20):
                    cv2.circle(frame, (cx, cy), 6, (0, 165, 255), -1)
                else:
                    cv2.circle(frame, (cx, cy), 4, point_color, -1)

        return frame

    def close(self):
        if hasattr(self, 'detector') and self.detector:
            self.detector.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
