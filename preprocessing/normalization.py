"""Landmark normalization utilities for Indian Sign Language (ISL) recognition.
Supports dual-hand 128-dimensional representations as well as single-hand normalization.
"""
from typing import Optional, Union, Dict
import numpy as np


def normalize_single_hand(landmarks: np.ndarray) -> np.ndarray:
    """Normalize 21 hand landmarks relative to the wrist landmark (index 0)

    and scale-normalize so features are invariant to hand position and distance.

    Args:
        landmarks: np.ndarray of shape (21, 3) representing [x, y, z].

    Returns:
        np.ndarray of shape (63,) containing normalized, scale-invariant features.
    """
    if landmarks is None or landmarks.shape != (21, 3):
        raise ValueError(f"Expected landmarks with shape (21, 3), got {getattr(landmarks, 'shape', None)}")

    landmarks = np.asarray(landmarks, dtype=np.float32)

    # 1. Wrist-relative translation (wrist is index 0)
    wrist = landmarks[0]
    relative_landmarks = landmarks - wrist  # shape: (21, 3)

    # 2. Scale normalization
    # Compute maximum absolute coordinate distance to normalize scale into [-1.0, 1.0]
    max_val = np.max(np.abs(relative_landmarks))
    if max_val > 1e-6:
        normalized = relative_landmarks / max_val
    else:
        normalized = relative_landmarks

    return normalized.flatten().astype(np.float32)


def normalize_dual_hand_landmarks(
    left_landmarks: Optional[np.ndarray],
    right_landmarks: Optional[np.ndarray]
) -> np.ndarray:
    """Normalize both Left and Right hand landmarks into a deterministic 128-d feature vector.

    Structure:
    - [0:63]   : Left Hand 21 landmarks (x, y, z) wrist-relative & scaled, or zeros if absent.
    - [63:126] : Right Hand 21 landmarks (x, y, z) wrist-relative & scaled, or zeros if absent.
    - [126]    : Left Hand presence flag (1.0 if present, 0.0 if absent).
    - [127]    : Right Hand presence flag (1.0 if present, 0.0 if absent).

    Returns:
        np.ndarray of shape (128,) with dtype np.float32.
    """
    # Process Left Hand
    if left_landmarks is not None and len(left_landmarks) == 21:
        left_arr = np.asarray(left_landmarks, dtype=np.float32).reshape(21, 3)
        left_feat = normalize_single_hand(left_arr)
        has_left = 1.0
    else:
        left_feat = np.zeros(63, dtype=np.float32)
        has_left = 0.0

    # Process Right Hand
    if right_landmarks is not None and len(right_landmarks) == 21:
        right_arr = np.asarray(right_landmarks, dtype=np.float32).reshape(21, 3)
        right_feat = normalize_single_hand(right_arr)
        has_right = 1.0
    else:
        right_feat = np.zeros(63, dtype=np.float32)
        has_right = 0.0

    return np.concatenate([left_feat, right_feat, [has_left, has_right]], dtype=np.float32)


def normalize_landmarks(
    landmarks: Union[np.ndarray, Dict[str, Optional[np.ndarray]]],
    force_128: bool = True
) -> np.ndarray:
    """Universal normalizer handling dual-hand dicts, (21, 3) arrays, or (42, 3) arrays.

    Args:
        landmarks: Dictionary with 'Left' and 'Right' arrays, or numpy array.
        force_128: If True, always returns shape (128,). If False and single hand, returns (63,).

    Returns:
        np.ndarray of shape (128,) or (63,).
    """
    if isinstance(landmarks, dict):
        return normalize_dual_hand_landmarks(landmarks.get("Left"), landmarks.get("Right"))

    if landmarks is None:
        return np.zeros(128 if force_128 else 63, dtype=np.float32)

    arr = np.asarray(landmarks, dtype=np.float32)

    # If already 128-d feature vector
    if arr.shape == (128,):
        return arr

    # If dual hand (42, 3)
    if arr.shape == (42, 3):
        return normalize_dual_hand_landmarks(arr[:21], arr[21:])

    # If single hand (21, 3)
    if arr.shape == (21, 3):
        if not force_128:
            return normalize_single_hand(arr)
        # Default single hand mapped to Right Hand
        return normalize_dual_hand_landmarks(None, arr)

    if arr.shape == (63,):
        if not force_128:
            return arr
        # Reshape to (21, 3) and map to Right Hand
        return normalize_dual_hand_landmarks(None, arr.reshape(21, 3))

    raise ValueError(f"Unrecognized landmarks input shape: {arr.shape}")


def denormalize_shape(features: np.ndarray) -> np.ndarray:
    """Reshape single hand 63 features to (21, 3) or dual hand 128 features to Left/Right (21, 3)."""
    if features.shape == (63,):
        return features.reshape((21, 3))
    elif features.shape == (128,):
        left = features[:63].reshape((21, 3))
        right = features[63:126].reshape((21, 3))
        return np.concatenate([left, right], axis=0)
    raise ValueError(f"Expected feature vector with shape (63,) or (128,), got {features.shape}")
