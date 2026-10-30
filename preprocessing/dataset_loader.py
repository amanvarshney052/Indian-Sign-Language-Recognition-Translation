"""Dataset loading and train/val/test splitting for static signs and dynamic sequences.
Supports both dual-hand 128-d representations and legacy formats.
"""
import os
import json
from pathlib import Path
from typing import Tuple, Dict, List, Optional
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split


def save_label_map(label_to_idx: Dict[str, int], json_path: Path) -> None:
    """Save label-to-index mapping to JSON file."""
    json_path = Path(json_path)
    json_path.parent.mkdir(parents=True, exist_ok=True)
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(label_to_idx, f, indent=2)


def load_label_map(json_path: Path) -> Tuple[Dict[str, int], Dict[int, str]]:
    """Load label-to-index and index-to-label mappings from JSON file."""
    json_path = Path(json_path)
    if not json_path.exists():
        raise FileNotFoundError(f"Label map not found at {json_path}")
    with open(json_path, "r", encoding="utf-8") as f:
        label_to_idx = json.load(f)
    idx_to_label = {int(v): k for k, v in label_to_idx.items()}
    return label_to_idx, idx_to_label


def load_static_dataset(
    csv_path: Path,
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    random_state: int = 42
) -> Tuple[
    Tuple[np.ndarray, np.ndarray],
    Tuple[np.ndarray, np.ndarray],
    Tuple[np.ndarray, np.ndarray],
    Dict[str, int]
]:
    """Load static sign landmarks CSV and split into train, val, and test sets.

    Args:
        csv_path: Path to static_landmarks.csv with columns: label, f_0, f_1, ...
        train_ratio: Fraction for training (default 0.70)
        val_ratio: Fraction for validation (default 0.15)
        test_ratio: Fraction for testing (default 0.15)
        random_state: Random seed for reproducibility.

    Returns:
        ((X_train, y_train), (X_val, y_val), (X_test, y_test), label_to_idx)
    """
    csv_path = Path(csv_path)
    if not csv_path.exists():
        raise FileNotFoundError(f"Static dataset file not found at {csv_path}")

    df = pd.read_csv(csv_path)
    if df.empty:
        raise ValueError(f"Dataset at {csv_path} is empty.")

    if 'label' not in df.columns:
        raise ValueError(f"CSV must contain a 'label' column. Found columns: {df.columns.tolist()[:5]}")

    labels = sorted(df['label'].unique().tolist())
    label_to_idx = {name: idx for idx, name in enumerate(labels)}
    y = df['label'].map(label_to_idx).values

    # Feature columns (exclude 'label' and optional metadata like 'signer')
    feature_cols = [c for c in df.columns if c not in ['label', 'signer', 'timestamp']]
    if len(feature_cols) not in (63, 128):
        print(f"Notice: Loading dataset with {len(feature_cols)} features per sample.")

    X = df[feature_cols].values.astype(np.float32)

    # Signer-based split if 'signer' column is provided to avoid data leakage
    if 'signer' in df.columns and len(df['signer'].unique()) >= 3:
        signers = df['signer'].unique()
        train_signers, temp_signers = train_test_split(signers, test_size=(1.0 - train_ratio), random_state=random_state)
        val_signers, test_signers = train_test_split(temp_signers, test_size=0.5, random_state=random_state)

        train_mask = df['signer'].isin(train_signers)
        val_mask = df['signer'].isin(val_signers)
        test_mask = df['signer'].isin(test_signers)

        X_train, y_train = X[train_mask], y[train_mask]
        X_val, y_val = X[val_mask], y[val_mask]
        X_test, y_test = X[test_mask], y[test_mask]
    else:
        # Stratified random split
        temp_ratio = val_ratio + test_ratio
        X_train, X_temp, y_train, y_temp = train_test_split(
            X, y, test_size=temp_ratio, stratify=y, random_state=random_state
        )
        test_sub_ratio = test_ratio / temp_ratio
        X_val, X_test, y_val, y_test = train_test_split(
            X_temp, y_temp, test_size=test_sub_ratio, stratify=y_temp, random_state=random_state
        )

    return (X_train, y_train), (X_val, y_val), (X_test, y_test), label_to_idx


def load_dynamic_dataset(
    dynamic_source: Path,
    sequence_length: int = 30,
    expected_features: int = 128,
    train_ratio: float = 0.70,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    random_state: int = 42
) -> Tuple[
    Tuple[np.ndarray, np.ndarray],
    Tuple[np.ndarray, np.ndarray],
    Tuple[np.ndarray, np.ndarray],
    Dict[str, int]
]:
    """Load dynamic gesture sequences from NPZ file or class directories.

    Args:
        dynamic_source: Path to dynamic_sequences.npz or directory of .npy files
        sequence_length: Expected frames per sequence (30)
        expected_features: Expected features per frame (128 or 63)
        train_ratio: Fraction for training (0.70)
        val_ratio: Fraction for validation (0.15)
        test_ratio: Fraction for testing (0.15)
        random_state: Random seed for reproducibility.

    Returns:
        ((X_train, y_train), (X_val, y_val), (X_test, y_test), label_to_idx)
    """
    dynamic_source = Path(dynamic_source)

    # Check for direct NPZ package first
    npz_path = dynamic_source if dynamic_source.suffix == ".npz" else dynamic_source / "dynamic_sequences.npz"
    if npz_path.exists():
        data = np.load(npz_path, allow_pickle=True)
        X = data['X'].astype(np.float32)
        raw_y = data['y']
        labels = sorted(list(set(raw_y)))
        label_to_idx = {lbl: idx for idx, lbl in enumerate(labels)}
        y = np.array([label_to_idx[lbl] for lbl in raw_y], dtype=np.int64)

        train_indices, val_indices, test_indices = [], [], []
        rng = np.random.RandomState(random_state)

        for c in range(len(labels)):
            c_indices = np.where(y == c)[0]
            rng.shuffle(c_indices)
            n_c = len(c_indices)

            if n_c >= 3:
                val_indices.append(c_indices[0])
                test_indices.append(c_indices[1])
                train_indices.extend(c_indices[2:])
            elif n_c == 2:
                val_indices.append(c_indices[0])
                test_indices.append(c_indices[0])
                train_indices.append(c_indices[1])
            else:
                train_indices.append(c_indices[0])
                val_indices.append(c_indices[0])
                test_indices.append(c_indices[0])

        train_indices = np.array(train_indices, dtype=np.int64)
        val_indices = np.array(val_indices, dtype=np.int64)
        test_indices = np.array(test_indices, dtype=np.int64)

        rng.shuffle(train_indices)
        rng.shuffle(val_indices)
        rng.shuffle(test_indices)

        X_train, y_train = X[train_indices], y[train_indices]
        X_val, y_val = X[val_indices], y[val_indices]
        X_test, y_test = X[test_indices], y[test_indices]

        return (X_train, y_train), (X_val, y_val), (X_test, y_test), label_to_idx

    # Otherwise load from directory with subfolders
    if not dynamic_source.exists():
        raise FileNotFoundError(f"Dynamic directory not found at {dynamic_source}")

    class_dirs = sorted([d for d in dynamic_source.iterdir() if d.is_dir()])
    if not class_dirs:
        raise ValueError(f"No class subfolders found in {dynamic_source}")

    label_to_idx = {d.name: idx for idx, d in enumerate(class_dirs)}
    sequences: List[np.ndarray] = []
    labels: List[int] = []

    for class_dir in class_dirs:
        class_label = class_dir.name
        class_idx = label_to_idx[class_label]
        npy_files = list(class_dir.glob("*.npy"))

        for npy_path in npy_files:
            try:
                seq = np.load(npy_path)
                if seq.shape[0] != sequence_length:
                    continue
                sequences.append(seq.astype(np.float32))
                labels.append(class_idx)
            except Exception as e:
                print(f"Warning: Error loading {npy_path}: {e}")

    if not sequences:
        raise ValueError(f"No valid sequences loaded from {dynamic_source}")

    X = np.array(sequences, dtype=np.float32)
    y = np.array(labels, dtype=np.int64)

    temp_ratio = val_ratio + test_ratio
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=temp_ratio, stratify=y, random_state=random_state
    )
    test_sub_ratio = test_ratio / temp_ratio
    X_val, X_test, y_val, y_test = train_test_split(
        X_temp, y_temp, test_size=test_sub_ratio, stratify=y_temp, random_state=random_state
    )

    return (X_train, y_train), (X_val, y_val), (X_test, y_test), label_to_idx
