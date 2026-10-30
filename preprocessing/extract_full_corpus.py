"""Extract dual-hand 128-dimensional features across the entire ISL-CSLRT corpus.
Builds:
  1. data/static/static_landmarks.csv (All 114 word classes with data augmentation)
  2. data/dynamic/dynamic_sequences.npz (All 97 sentence classes, 663 video sequences, shape (N, 30, 128))
"""
import os
import sys
import time
from pathlib import Path
import cv2
import numpy as np
import pandas as pd

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import config
from preprocessing.landmarks import HandLandmarkExtractor
from preprocessing.normalization import normalize_dual_hand_landmarks


def augment_landmarks(features_128: np.ndarray, num_aug: int = 4) -> list[np.ndarray]:
    """Generate synthetic spatial variations (jitter, scale, slight rotation) for a 128-d vector."""
    augmented = [features_128]
    left = features_128[:63].reshape((21, 3))
    right = features_128[63:126].reshape((21, 3))
    flags = features_128[126:]

    for _ in range(num_aug):
        scale = np.random.uniform(0.92, 1.08)
        jitter_left = np.random.normal(0, 0.015, left.shape).astype(np.float32) if flags[0] > 0.5 else 0
        jitter_right = np.random.normal(0, 0.015, right.shape).astype(np.float32) if flags[1] > 0.5 else 0

        # Small 2D rotation angle in radians
        theta = np.random.uniform(-0.15, 0.15)
        cos_t, sin_t = np.cos(theta), np.sin(theta)
        rot_mat = np.array([[cos_t, -sin_t, 0], [sin_t, cos_t, 0], [0, 0, 1]], dtype=np.float32)

        new_left = np.dot(left * scale + jitter_left, rot_mat) if flags[0] > 0.5 else np.zeros((21, 3), dtype=np.float32)
        new_right = np.dot(right * scale + jitter_right, rot_mat) if flags[1] > 0.5 else np.zeros((21, 3), dtype=np.float32)

        aug_vec = np.concatenate([new_left.flatten(), new_right.flatten(), flags], dtype=np.float32)
        augmented.append(aug_vec)

    return augmented


def extract_full_static_corpus(extractor: HandLandmarkExtractor):
    """Process all 114 word classes in Frames_Word_Level and save data/static/static_landmarks.csv."""
    word_dir = config.WORD_FRAMES_DIR
    if not word_dir.exists():
        print(f"Error: Word directory {word_dir} does not exist!")
        return

    word_folders = sorted([d for d in word_dir.iterdir() if d.is_dir()])
    print(f"\n[STATIC CORPUS] Processing {len(word_folders)} word classes from {word_dir}...")

    all_rows = []
    total_images = 0
    detected_images = 0

    start_t = time.time()
    for w_idx, folder in enumerate(word_folders, 1):
        label = folder.name
        img_files = list(folder.glob("*.jpg")) + list(folder.glob("*.jpeg")) + list(folder.glob("*.png"))
        total_images += len(img_files)

        class_features = []
        for img_path in img_files:
            img = cv2.imread(str(img_path))
            if img is None:
                continue

            hands_dict, _ = extractor.process_frame(img)
            if hands_dict is None or (hands_dict.get("Left") is None and hands_dict.get("Right") is None):
                continue

            detected_images += 1
            feat = normalize_dual_hand_landmarks(hands_dict.get("Left"), hands_dict.get("Right"))
            class_features.append(feat)

        # If detected samples exist for class, augment to at least 40 samples per class
        if class_features:
            aug_factor = max(3, int(np.ceil(40 / len(class_features))))
            for feat in class_features:
                variants = augment_landmarks(feat, num_aug=aug_factor)
                for var in variants:
                    all_rows.append([label] + var.tolist())

        if w_idx % 20 == 0 or w_idx == len(word_folders):
            print(f"  Processed {w_idx}/{len(word_folders)} words ({len(all_rows)} samples collected so far)...")

    duration = time.time() - start_t
    print(f"[STATIC CORPUS] Finished in {duration:.1f}s. Total Images: {total_images}, Detected: {detected_images}")
    print(f"[STATIC CORPUS] Generated dataset with {len(all_rows)} augmented samples across {len(word_folders)} classes.")

    # Save to CSV
    config.STATIC_DATA_DIR.mkdir(parents=True, exist_ok=True)
    cols = ["label"] + [f"f_{i}" for i in range(128)]
    df = pd.DataFrame(all_rows, columns=cols)
    df.to_csv(config.STATIC_CSV_PATH, index=False)
    print(f"[STATIC CORPUS] Saved static dataset to {config.STATIC_CSV_PATH}")


def resample_sequence(frames_features: list[np.ndarray], target_len: int = 30) -> np.ndarray:
    """Uniformly resample variable-length frame sequence to exactly target_len frames."""
    n_frames = len(frames_features)
    if n_frames == 0:
        return np.zeros((target_len, 128), dtype=np.float32)

    arr = np.array(frames_features, dtype=np.float32)  # shape (N, 128)
    if n_frames == target_len:
        return arr

    indices = np.linspace(0, n_frames - 1, target_len).astype(np.int32)
    return arr[indices]


def extract_full_dynamic_corpus(extractor: HandLandmarkExtractor):
    """Process all 97 sentences in Frames_Sentence_Level across all signers (663 sequences)."""
    sent_dir = config.SENTENCE_FRAMES_DIR
    if not sent_dir.exists():
        print(f"Error: Sentence directory {sent_dir} does not exist!")
        return

    sent_folders = sorted([d for d in sent_dir.iterdir() if d.is_dir()])
    print(f"\n[DYNAMIC CORPUS] Processing {len(sent_folders)} sentence classes from {sent_dir}...")

    all_sequences = []
    all_labels = []
    total_seq_count = 0

    start_t = time.time()
    for s_idx, sent_folder in enumerate(sent_folders, 1):
        sentence_label = sent_folder.name
        signer_dirs = sorted([d for d in sent_folder.iterdir() if d.is_dir()])

        for signer_dir in signer_dirs:
            frame_files = sorted(
                list(signer_dir.glob("*.jpg")) + list(signer_dir.glob("*.jpeg")) + list(signer_dir.glob("*.png")),
                key=lambda p: int(''.join(filter(str.isdigit, p.stem)) or 0)
            )
            if not frame_files:
                continue

            total_seq_count += 1
            seq_features = []
            last_valid = np.zeros(128, dtype=np.float32)

            for fp in frame_files:
                frame = cv2.imread(str(fp))
                if frame is None:
                    continue

                hands_dict, _ = extractor.process_frame(frame)
                if hands_dict and (hands_dict.get("Left") is not None or hands_dict.get("Right") is not None):
                    feat = normalize_dual_hand_landmarks(hands_dict.get("Left"), hands_dict.get("Right"))
                    seq_features.append(feat)
                    last_valid = feat
                else:
                    # Carry forward last valid pose for smooth continuous gestures
                    seq_features.append(last_valid.copy())

            if len(seq_features) >= 5:
                resampled = resample_sequence(seq_features, target_len=config.SEQUENCE_LENGTH)
                all_sequences.append(resampled)
                all_labels.append(sentence_label)

        if s_idx % 15 == 0 or s_idx == len(sent_folders):
            print(f"  Processed {s_idx}/{len(sent_folders)} sentences ({len(all_sequences)} sequences extracted)...")

    duration = time.time() - start_t
    print(f"[DYNAMIC CORPUS] Finished in {duration:.1f}s. Extracted {len(all_sequences)} sequences across {len(sent_folders)} classes.")

    # Save to NPZ
    config.DYNAMIC_DATA_DIR.mkdir(parents=True, exist_ok=True)
    X = np.array(all_sequences, dtype=np.float32)  # shape (N, 30, 128)
    y = np.array(all_labels, dtype=object)
    np.savez_compressed(config.DYNAMIC_NPZ_PATH, X=X, y=y)
    print(f"[DYNAMIC CORPUS] Saved dynamic dataset shape {X.shape} to {config.DYNAMIC_NPZ_PATH}")


def main():
    print("=" * 70)
    print(" ISL-CSLRT Full Corpus Dual-Hand Landmark Extraction Engine")
    print(f" Feature Dimension: {config.NUM_FEATURES} (Left Hand 63 + Right Hand 63 + Flags 2)")
    print("=" * 70)

    extractor = HandLandmarkExtractor(static_image_mode=True, max_num_hands=2)

    try:
        extract_full_static_corpus(extractor)
        extract_full_dynamic_corpus(extractor)
    finally:
        extractor.close()

    print("\n[ALL EXTRACTIONS COMPLETED SUCCESSFULLY]")


if __name__ == "__main__":
    main()
