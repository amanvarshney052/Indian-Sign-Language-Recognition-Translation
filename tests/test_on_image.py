"""Test the trained static model on an image file from the disk without needing a webcam.
"""
import sys
from pathlib import Path
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
from tensorflow import keras


def test_image(image_path: str):
    image_path = Path(image_path)
    if not image_path.exists():
        print(f"Error: Image not found at {image_path}")
        return

    print("=" * 60)
    print(f"TESTING STATIC MODEL ON: {image_path.name}")
    print("=" * 60)

    # 1. Load model & labels
    model = keras.models.load_model(config.STATIC_MODEL_PATH)
    _, idx_to_label = load_label_map(config.STATIC_LABELS_PATH)

    # 2. Extract landmarks
    extractor = HandLandmarkExtractor(static_image_mode=True, max_num_hands=2)
    img = cv2.imread(str(image_path))
    if img is None:
        print("Error: Could not read image.")
        return

    hands_dict, _ = extractor.process_frame(img)
    extractor.close()

    if hands_dict is None or (hands_dict.get("Left") is None and hands_dict.get("Right") is None):
        print("Result: No hand detected in the image.")
        return

    # 3. Normalize to 128-d dual-hand vector
    features = normalize_dual_hand_landmarks(hands_dict.get("Left"), hands_dict.get("Right"))
    sample = np.expand_dims(features, axis=0)  # (1, 128)

    # 4. Predict
    probs = model(sample, training=False).numpy()[0]
    pred_idx = int(np.argmax(probs))
    confidence = float(probs[pred_idx])
    predicted_label = idx_to_label.get(pred_idx, f"Class_{pred_idx}")

    print(f"Predicted ISL Sign : {predicted_label}")
    print(f"Confidence Score   : {confidence * 100:.2f}%")
    print("\nTop Class Probabilities:")
    top_indices = np.argsort(probs)[::-1][:5]
    for idx in top_indices:
        prob = probs[idx]
        bar = "#" * int(prob * 30)
        print(f"  {idx_to_label.get(idx, str(idx)):<20}: {prob * 100:5.1f}% | {bar}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        test_path = sys.argv[1]
    else:
        # Default sample image from isldata
        test_path = "isldata/ISL_CSLRT_Corpus/ISL_CSLRT_Corpus/Frames_Word_Level/WATER/WATER (1).jpg"
    test_image(test_path)
