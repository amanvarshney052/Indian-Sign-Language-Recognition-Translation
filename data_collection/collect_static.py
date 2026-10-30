"""Interactive webcam data collection tool for static ISL sign landmarks.
"""
import sys
import os
import time
from pathlib import Path
import csv
import cv2
import numpy as np

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import config
from preprocessing.landmarks import HandLandmarkExtractor
from preprocessing.normalization import normalize_dual_hand_landmarks


def get_feature_columns():
    return ["label"] + [f"f_{i}" for i in range(config.NUM_FEATURES)]


def load_sample_counts():
    counts = {c: 0 for c in config.STATIC_CLASSES}
    if config.STATIC_CSV_PATH.exists():
        with open(config.STATIC_CSV_PATH, "r", encoding="utf-8") as f:
            reader = csv.reader(f)
            header = next(reader, None)
            for row in reader:
                if row and row[0] in counts:
                    counts[row[0]] += 1
                elif row:
                    counts[row[0]] = counts.get(row[0], 0) + 1
    return counts


def save_landmark_sample(label: str, normalized_features: np.ndarray):
    config.STATIC_DATA_DIR.mkdir(parents=True, exist_ok=True)
    file_exists = config.STATIC_CSV_PATH.exists()

    with open(config.STATIC_CSV_PATH, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(get_feature_columns())
        writer.writerow([label] + [f"{val:.6f}" for val in normalized_features])


def main():
    print("=" * 60)
    print("ISL STATIC DATA COLLECTION")
    print(f"Target classes: {config.STATIC_CLASSES}")
    print("Controls:")
    print("  SPACE: Capture 1 sample")
    print("  B    : Burst mode (auto-capture 30 samples)")
    print("  N    : Next class")
    print("  P    : Previous class")
    print("  Q    : Quit")
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

    extractor = HandLandmarkExtractor(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.5
    )

    class_idx = 0
    sample_counts = load_sample_counts()
    burst_remaining = 0
    burst_countdown = 0
    last_burst_time = 0.0

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to read from webcam.")
                break

            frame = cv2.flip(frame, 1)  # Mirror view
            h, w, _ = frame.shape
            current_class = config.STATIC_CLASSES[class_idx]

            hands_dict, raw_results = extractor.process_frame(frame)
            hand_detected = hands_dict is not None and (
                hands_dict.get("Left") is not None or hands_dict.get("Right") is not None
            )

            # Draw landmark skeleton on frame
            if hand_detected:
                extractor.draw_landmarks(frame, raw_results)

            # UI Header
            cv2.rectangle(frame, (0, 0), (w, 80), (25, 25, 25), -1)
            cv2.putText(
                frame,
                f"COLLECTING STATIC SIGN: [{current_class}]",
                (15, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 255, 255),
                2
            )
            cv2.putText(
                frame,
                f"Samples for '{current_class}': {sample_counts.get(current_class, 0)}  |  Total: {sum(sample_counts.values())}",
                (15, 65),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                (200, 200, 200),
                1
            )

            # Status Indicator
            if hand_detected:
                cv2.circle(frame, (w - 30, 40), 12, (0, 255, 0), -1)
                status_text = "Hand Detected"
                status_color = (0, 255, 0)
            else:
                cv2.circle(frame, (w - 30, 40), 12, (0, 0, 255), -1)
                status_text = "No Hand Detected"
                status_color = (0, 0, 255)

            cv2.putText(frame, status_text, (w - 180, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.5, status_color, 1)

            # Footer / Instructions
            cv2.rectangle(frame, (0, h - 35), (w, h), (25, 25, 25), -1)
            cv2.putText(
                frame,
                "[SPACE] Capture  [B] Burst  [N/P] Switch Class  [Q] Quit",
                (15, h - 12),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (220, 220, 220),
                1
            )

            # Burst Mode Logic
            current_time = time.time()
            if burst_countdown > 0:
                cv2.putText(
                    frame,
                    f"Get Ready! Burst in: {burst_countdown}s",
                    (w // 2 - 180, h // 2),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1.0,
                    (0, 165, 255),
                    3
                )
                if current_time - last_burst_time >= 1.0:
                    burst_countdown -= 1
                    last_burst_time = current_time
                    if burst_countdown == 0:
                        burst_remaining = 30
            elif burst_remaining > 0:
                cv2.putText(
                    frame,
                    f"BURST RECORDING: {burst_remaining} left",
                    (w // 2 - 160, h // 2),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0, 255, 0),
                    2
                )
                if hand_detected and (current_time - last_burst_time >= 0.1):
                    normalized = normalize_dual_hand_landmarks(
                        hands_dict.get("Left"), hands_dict.get("Right")
                    )
                    save_landmark_sample(current_class, normalized)
                    sample_counts[current_class] += 1
                    burst_remaining -= 1
                    last_burst_time = current_time
                elif not hand_detected:
                    cv2.putText(
                        frame,
                        "Hold hand in view!",
                        (w // 2 - 100, h // 2 + 40),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.7,
                        (0, 0, 255),
                        2
                    )

            cv2.imshow("ISL Static Data Collector", frame)
            key = cv2.waitKey(1) & 0xFF

            if key == ord('q') or key == 27:
                break
            elif key == ord(' '):  # Single capture
                if hand_detected:
                    normalized = normalize_dual_hand_landmarks(
                        hands_dict.get("Left"), hands_dict.get("Right")
                    )
                    save_landmark_sample(current_class, normalized)
                    sample_counts[current_class] += 1
                    print(f"Captured sample for '{current_class}'. Total: {sample_counts[current_class]}")
                else:
                    print("Cannot capture: No hand detected.")
                else:
                    print("Cannot capture: No hand detected.")
            elif key == ord('b'):  # Start burst
                if burst_countdown == 0 and burst_remaining == 0:
                    burst_countdown = 3
                    last_burst_time = current_time
            elif key == ord('n'):  # Next class
                class_idx = (class_idx + 1) % len(config.STATIC_CLASSES)
            elif key == ord('p'):  # Previous class
                class_idx = (class_idx - 1) % len(config.STATIC_CLASSES)

    finally:
        extractor.close()
        cap.release()
        cv2.destroyAllWindows()
        print("\nData collection finished.")
        print(f"Dataset stored at: {config.STATIC_CSV_PATH}")


if __name__ == "__main__":
    main()
