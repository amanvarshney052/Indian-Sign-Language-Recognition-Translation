"""Evaluation script for Dynamic ISL Gesture Recognition LSTM model.
"""
import sys
import time
from pathlib import Path
import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report
import tensorflow as tf
from tensorflow import keras

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import config
from preprocessing.dataset_loader import load_dynamic_dataset, load_label_map


def plot_confusion_matrix(cm: np.ndarray, class_names: list, save_path: Path):
    save_path.parent.mkdir(parents=True, exist_ok=True)
    num_cls = len(class_names)
    fig_size = (max(10, num_cls * 0.25), max(8, num_cls * 0.22))
    plt.figure(figsize=fig_size)
    sns.heatmap(
        cm,
        annot=(num_cls <= 25),
        fmt='d',
        cmap='Greens',
        xticklabels=class_names if num_cls <= 50 else False,
        yticklabels=class_names if num_cls <= 50 else False,
        cbar=True,
        linewidths=0.2 if num_cls <= 50 else 0
    )
    plt.title(f"Dynamic ISL Evaluation - Confusion Matrix ({num_cls} Classes)", fontsize=14, fontweight='bold', pad=15)
    plt.xlabel("Predicted Sentence / Gesture", fontsize=11, fontweight='bold')
    plt.ylabel("True Sentence / Gesture", fontsize=11, fontweight='bold')
    plt.tight_layout()
    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f"Confusion matrix saved to {save_path}")


def measure_inference_latency(model: keras.Model, sample_sequence: np.ndarray, num_iterations: int = 100) -> float:
    """Measure average single-sequence inference time in milliseconds."""
    sample = np.expand_dims(sample_sequence, axis=0)  # (1, 30, 63)
    # Warmup
    for _ in range(10):
        _ = model(sample, training=False)

    start_time = time.perf_counter()
    for _ in range(num_iterations):
        _ = model(sample, training=False)
    elapsed = time.perf_counter() - start_time
    avg_ms = (elapsed / num_iterations) * 1000.0
    return avg_ms


def evaluate():
    print("=" * 60)
    print("EVALUATING DYNAMIC ISL MODEL")
    print("=" * 60)

    if not config.DYNAMIC_MODEL_PATH.exists():
        raise FileNotFoundError(f"Model file not found at {config.DYNAMIC_MODEL_PATH}")
    if not config.DYNAMIC_LABELS_PATH.exists():
        raise FileNotFoundError(f"Label map not found at {config.DYNAMIC_LABELS_PATH}")

    # Load label mapping
    label_to_idx, idx_to_label = load_label_map(config.DYNAMIC_LABELS_PATH)
    class_names = [idx_to_label[i] for i in range(len(idx_to_label))]

    # Load dataset test split
    dynamic_src = config.DYNAMIC_NPZ_PATH if config.DYNAMIC_NPZ_PATH.exists() else config.DYNAMIC_DATA_DIR
    _, _, (X_test, y_test), _ = load_dynamic_dataset(
        dynamic_src,
        sequence_length=config.SEQUENCE_LENGTH,
        expected_features=config.NUM_FEATURES,
        train_ratio=config.TRAIN_RATIO,
        val_ratio=config.VAL_RATIO,
        test_ratio=config.TEST_RATIO
    )

    print(f"Test sequences: {len(X_test)} across {len(class_names)} classes.")

    # Load model
    model = keras.models.load_model(config.DYNAMIC_MODEL_PATH)

    # Predict
    raw_preds = model.predict(X_test, verbose=0)
    y_pred = np.argmax(raw_preds, axis=1)

    # Metrics
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    rec = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

    print("\n--- TEST METRICS ---")
    print(f"Accuracy : {acc * 100:.2f}%")
    print(f"Precision: {prec * 100:.2f}% (weighted)")
    print(f"Recall   : {rec * 100:.2f}% (weighted)")
    print(f"F1-Score : {f1 * 100:.2f}% (weighted)")

    print("\n--- CLASSIFICATION REPORT ---")
    print(classification_report(y_test, y_pred, target_names=class_names, zero_division=0))

    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    cm_path = config.RESULTS_DIR / "dynamic_confusion_matrix.png"
    plot_confusion_matrix(cm, class_names, cm_path)

    # Latency measurement
    avg_latency = measure_inference_latency(model, X_test[0])
    print(f"\nAverage Single-Sequence Inference Latency: {avg_latency:.2f} ms")

    return {
        "accuracy": acc,
        "precision": prec,
        "recall": rec,
        "f1": f1,
        "latency_ms": avg_latency
    }


if __name__ == "__main__":
    evaluate()
