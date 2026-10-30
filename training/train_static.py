"""Training pipeline for Static ISL Sign Recognition using MLP.
Trained on the complete 114-word vocabulary of the ISL-CSLRT corpus with 128-d dual-hand features.
"""
import sys
from pathlib import Path
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow import keras
from keras import layers, callbacks

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

import config
from preprocessing.dataset_loader import load_static_dataset, save_label_map


def build_static_mlp(input_dim: int = 128, num_classes: int = 114) -> keras.Model:
    """Construct deep MLP classifier for 128-dimensional dual-hand landmark features."""
    model = keras.Sequential([
        layers.Input(shape=(input_dim,)),
        layers.Dense(256, activation='relu', name="dense_1"),
        layers.BatchNormalization(name="bn_1"),
        layers.Dropout(0.3, name="dropout_1"),
        layers.Dense(128, activation='relu', name="dense_2"),
        layers.BatchNormalization(name="bn_2"),
        layers.Dropout(0.25, name="dropout_2"),
        layers.Dense(64, activation='relu', name="dense_3"),
        layers.Dense(num_classes, activation='softmax', name="output")
    ], name="ISL_Static_MLP")

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    return model


def plot_training_history(history, save_path: Path):
    save_path.parent.mkdir(parents=True, exist_ok=True)
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4.5))

    # Accuracy Plot
    ax1.plot(history.history['accuracy'], label='Train Accuracy', color='#1f77b4', lw=2)
    ax1.plot(history.history['val_accuracy'], label='Val Accuracy', color='#ff7f0e', lw=2)
    ax1.set_title('Static MLP Model Accuracy', fontsize=12, fontweight='bold')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Accuracy')
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    # Loss Plot
    ax2.plot(history.history['loss'], label='Train Loss', color='#1f77b4', lw=2)
    ax2.plot(history.history['val_loss'], label='Val Loss', color='#ff7f0e', lw=2)
    ax2.set_title('Static MLP Model Loss', fontsize=12, fontweight='bold')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Loss')
    ax2.legend()
    ax2.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f"Training curves saved to {save_path}")


def train(
    epochs: int = 100,
    batch_size: int = 32
):
    print("=" * 60)
    print("STARTING STATIC ISL MLP TRAINING (128-D DUAL-HAND)")
    print("=" * 60)

    if not config.STATIC_CSV_PATH.exists():
        raise FileNotFoundError(
            f"Static dataset file not found at '{config.STATIC_CSV_PATH}'. "
            "Please run preprocessing/extract_full_corpus.py first."
        )

    # Load and split dataset
    (X_train, y_train), (X_val, y_val), (X_test, y_test), label_to_idx = load_static_dataset(
        config.STATIC_CSV_PATH,
        train_ratio=config.TRAIN_RATIO,
        val_ratio=config.VAL_RATIO,
        test_ratio=config.TEST_RATIO
    )

    num_classes = len(label_to_idx)
    input_dim = X_train.shape[1]
    print(f"Loaded {len(X_train)} train, {len(X_val)} val, {len(X_test)} test samples.")
    print(f"Input features: {input_dim}, Classes ({num_classes}): {list(label_to_idx.keys())[:10]}... (truncated)")

    # Save class mapping
    config.MODELS_DIR.mkdir(parents=True, exist_ok=True)
    save_label_map(label_to_idx, config.STATIC_LABELS_PATH)
    print(f"Saved label mapping to {config.STATIC_LABELS_PATH}")

    # Build model
    model = build_static_mlp(input_dim=input_dim, num_classes=num_classes)
    model.summary()

    # Callbacks
    early_stop = callbacks.EarlyStopping(
        monitor='val_loss',
        patience=15,
        restore_best_weights=True,
        verbose=1
    )
    checkpoint = callbacks.ModelCheckpoint(
        filepath=str(config.STATIC_MODEL_PATH),
        monitor='val_accuracy',
        save_best_only=True,
        verbose=1
    )
    reduce_lr = callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=6,
        min_lr=1e-5,
        verbose=1
    )

    # Train
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=[early_stop, checkpoint, reduce_lr],
        verbose=1
    )

    # Evaluate on test set
    test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
    print("=" * 60)
    print(f"TEST ACCURACY: {test_acc * 100:.2f}% | TEST LOSS: {test_loss:.4f}")
    print("=" * 60)

    # Save training curves
    plot_path = config.RESULTS_DIR / "static_training_curve.png"
    plot_training_history(history, plot_path)

    # Ensure best model is saved
    model.save(config.STATIC_MODEL_PATH)
    print(f"Model saved to {config.STATIC_MODEL_PATH}")


if __name__ == "__main__":
    train()
