"""Interactive webcam data collection tool for dynamic ISL gesture sequences.
"""
import sys
import os
import time
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


def get_next_sequence_id(class_dir: Path) -> int:
    class_dir.mkdir(parents=True, exist_ok=True)
    existing_files = list(class_dir.glob("sequence_*.npy"))
    if not existing_files:
        return 1
    ids = []
    for f in existing_files:
        try:
            seq_id = int(f.stem.replace("sequence_", ""))
            ids.append(seq_id)
        except ValueError:
            pass
    return max(ids) + 1 if ids else 1


def count_sequences(class_name: str) -> int:
    class_dir = config.DYNAMIC_DATA_DIR / class_name
    if not class_dir.exists():
        return 0
    return len(list(class_dir.glob("*.npy")))


def main():
    print("=" * 60)
    print("ISL DYNAMIC DATA COLLECTION")
    print(f"Target dynamic classes: {config.DYNAMIC_CLASSES}")
    print(f"Frames per sequence: {config.SEQUENCE_LENGTH}")
    print("Controls:")
    print("  SPACE: Start 3s countdown and record 30-frame sequence")
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
    is_recording = False
    countdown_active = False
    countdown_start_time = 0.0
    recorded_frames = []
    last_valid_features = None
    missing_hand_count = 0

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("Failed to read from webcam.")
                break

            frame = cv2.flip(frame, 1)  # Mirror view
            h, w, _ = frame.shape
            current_class = config.DYNAMIC_CLASSES[class_idx]
            seq_count = count_sequences(current_class)

            hands_dict, raw_results = extractor.process_frame(frame)
            hand_detected = hands_dict is not None and (
                hands_dict.get("Left") is not None or hands_dict.get("Right") is not None
            )

            if hand_detected:
                extractor.draw_landmarks(frame, raw_results)
                normalized = normalize_dual_hand_landmarks(
                    hands_dict.get("Left"), hands_dict.get("Right")
                )
                last_valid_features = normalized

            # UI Header
            cv2.rectangle(frame, (0, 0), (w, 80), (25, 25, 25), -1)
            cv2.putText(
                frame,
                f"DYNAMIC WORD: [{current_class}]",
                (15, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (255, 105, 180),
                2
            )
            cv2.putText(
                frame,
                f"Saved sequences for '{current_class}': {seq_count}",
                (15, 65),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.55,
                (200, 200, 200),
                1
            )

            # Hand status pill
            if hand_detected:
                cv2.circle(frame, (w - 30, 40), 12, (0, 255, 0), -1)
                cv2.putText(frame, "Hand Ready", (w - 150, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
            else:
                cv2.circle(frame, (w - 30, 40), 12, (0, 0, 255), -1)
                cv2.putText(frame, "No Hand", (w - 130, 45), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)

            # Footer
            cv2.rectangle(frame, (0, h - 35), (w, h), (25, 25, 25), -1)
            cv2.putText(
                frame,
                "[SPACE] Record Sequence  [N/P] Switch Class  [Q] Quit",
                (15, h - 12),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (220, 220, 220),
                1
            )

            current_time = time.time()

            # Countdown State
            if countdown_active:
                elapsed = current_time - countdown_start_time
                remaining = 3 - int(elapsed)
                if remaining > 0:
                    cv2.putText(
                        frame,
                        f"START GESTURE IN: {remaining}",
                        (w // 2 - 200, h // 2),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1.1,
                        (0, 255, 255),
                        3
                    )
                else:
                    countdown_active = False
                    is_recording = True
                    recorded_frames = []
                    missing_hand_count = 0

            # Recording State
            elif is_recording:
                # Add frame
                if hand_detected:
                    recorded_frames.append(normalized)
                else:
                    missing_hand_count += 1
                    if last_valid_features is not None:
                        # Carry forward previous valid frame to prevent temporal discontinuities
                        recorded_frames.append(last_valid_features.copy())
                    else:
                        # Fallback zero landmark vector if hand was never seen
                        recorded_frames.append(np.zeros(config.NUM_FEATURES, dtype=np.float32))

                progress = len(recorded_frames)
                # Recording indicator
                cv2.circle(frame, (35, 110), 10, (0, 0, 255), -1)
                cv2.putText(
                    frame,
                    f"RECORDING: {progress}/{config.SEQUENCE_LENGTH} frames",
                    (55, 115),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.7,
                    (0, 0, 255),
                    2
                )
                # Progress bar
                bar_width = 300
                fill_width = int(bar_width * (progress / config.SEQUENCE_LENGTH))
                cv2.rectangle(frame, (55, 130), (55 + bar_width, 145), (100, 100, 100), 2)
                cv2.rectangle(frame, (55, 130), (55 + fill_width, 145), (0, 0, 255), -1)

                if progress >= config.SEQUENCE_LENGTH:
                    is_recording = False
                    # Check sequence quality: if > 50% missing hands, discard
                    if missing_hand_count > config.SEQUENCE_LENGTH // 2:
                        print(f"Discarded sequence: Hand was missing in {missing_hand_count}/30 frames.")
                    else:
                        class_dir = config.DYNAMIC_DATA_DIR / current_class
                        seq_id = get_next_sequence_id(class_dir)
                        seq_array = np.array(recorded_frames, dtype=np.float32)  # shape: (30, 63)
                        save_path = class_dir / f"sequence_{seq_id:03d}.npy"
                        np.save(save_path, seq_array)
                        print(f"Saved sequence {save_path.name} for '{current_class}' (shape: {seq_array.shape})")

            cv2.imshow("ISL Dynamic Data Collector", frame)
            key = cv2.waitKey(1) & 0xFF

            if key == ord('q') or key == 27:
                break
            elif key == ord(' '):  # Start recording
                if not is_recording and not countdown_active:
                    countdown_active = True
                    countdown_start_time = time.time()
            elif key == ord('n'):  # Next class
                if not is_recording:
                    class_idx = (class_idx + 1) % len(config.DYNAMIC_CLASSES)
            elif key == ord('p'):  # Previous class
                if not is_recording:
                    class_idx = (class_idx - 1) % len(config.DYNAMIC_CLASSES)

    finally:
        extractor.close()
        cap.release()
        cv2.destroyAllWindows()
        print("\nDynamic data collection finished.")


if __name__ == "__main__":
    main()
