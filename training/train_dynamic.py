"""Training pipeline for Dynamic ISL Gesture Recognition using Bidirectional LSTM.
Trained on the complete 97-sentence vocabulary of the ISL-CSLRT corpus across 7 signers.
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
from preprocessing.dataset_loader import load_dynamic_dataset, save_label_map


def build_dynamic_bilstm(
    sequence_length: int = 30,
    num_features: int = 128,
    num_classes: int = 97
) -> keras.Model:
    """Construct Bidirectional LSTM classifier for (30, 128) dynamic sequence features."""
    model = keras.Sequential([
        layers.Input(shape=(sequence_length, num_features)),
        layers.Bidirectional(layers.LSTM(128, return_sequences=True), name="bi_lstm_1"),
        layers.Dropout(0.3, name="dropout_1"),
        layers.LSTM(96, return_sequences=False, name="lstm_2"),
        layers.Dropout(0.3, name="dropout_2"),
        layers.Dense(128, activation='relu', name="dense_1"),
        layers.BatchNormalization(name="bn_1"),
        layers.Dropout(0.2, name="dropout_3"),
        layers.Dense(num_classes, activation='softmax', name="output")
    ], name="ISL_Dynamic_BiLSTM")

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
    ax1.plot(history.history['accuracy'], label='Train Accuracy', color='#2ca02c', lw=2)
    ax1.plot(history.history['val_accuracy'], label='Val Accuracy', color='#d62728', lw=2)
    ax1.set_title('Dynamic BiLSTM Model Accuracy', fontsize=12, fontweight='bold')
    ax1.set_xlabel('Epoch')
    ax1.set_ylabel('Accuracy')
    ax1.legend()
    ax1.grid(True, alpha=0.3)

    # Loss Plot
    ax2.plot(history.history['loss'], label='Train Loss', color='#2ca02c', lw=2)
    ax2.plot(history.history['val_loss'], label='Val Loss', color='#d62728', lw=2)
    ax2.set_title('Dynamic BiLSTM Model Loss', fontsize=12, fontweight='bold')
    ax2.set_xlabel('Epoch')
    ax2.set_ylabel('Loss')
    ax2.legend()
    ax2.grid(True, alpha=0.3)

    plt.tight_layout()
    plt.savefig(save_path, dpi=300)
    plt.close()
    print(f"Training curves saved to {save_path}")


def augment_dynamic_dataset(X: np.ndarray, y: np.ndarray, num_variations: int = 2) -> tuple[np.ndarray, np.ndarray]:
    """Augment dynamic sequences with slight spatial scaling, jitter, and frame speed variations."""
    augmented_X = [X]
    augmented_y = [y]
    rng = np.random.RandomState(42)

    for _ in range(num_variations):
        noise = rng.normal(0, 0.012, X.shape).astype(np.float32)
        noise[:, :, 126:] = 0.0  # preserve presence flags
        scale = rng.uniform(0.95, 1.05, (X.shape[0], 1, 1)).astype(np.float32)
        coords = X[:, :, :126] * scale + noise[:, :, :126]
        flags = X[:, :, 126:]
        X_aug = np.concatenate([coords, flags], axis=-1).astype(np.float32)
        augmented_X.append(X_aug)
        augmented_y.append(y)

    X_full = np.concatenate(augmented_X, axis=0)
    y_full = np.concatenate(augmented_y, axis=0)
    perm = rng.permutation(len(X_full))
    return X_full[perm], y_full[perm]


def train(
    epochs: int = 80,
    batch_size: int = 16
):
    print("=" * 60)
    print("STARTING DYNAMIC ISL BiLSTM TRAINING (128-D DUAL-HAND)")
    print("=" * 60)

    # Load dynamic sequences
    (X_train, y_train), (X_val, y_val), (X_test, y_test), label_to_idx = load_dynamic_dataset(
        config.DYNAMIC_NPZ_PATH if config.DYNAMIC_NPZ_PATH.exists() else config.DYNAMIC_DATA_DIR,
        sequence_length=config.SEQUENCE_LENGTH,
        expected_features=config.NUM_FEATURES,
        train_ratio=config.TRAIN_RATIO,
        val_ratio=config.VAL_RATIO,
        test_ratio=config.TEST_RATIO
    )

    num_classes = len(label_to_idx)
    num_features = X_train.shape[2]
    print(f"Loaded {len(X_train)} train, {len(X_val)} val, {len(X_test)} test sequences.")
    print(f"Sequence shape: {X_train.shape[1:]}, Classes ({num_classes}): {list(label_to_idx.keys())[:10]}... (truncated)")

    # Data augmentation for training
    X_train, y_train = augment_dynamic_dataset(X_train, y_train, num_variations=2)
    print(f"Augmented training sequences: {len(X_train)} total samples.")

    # Save class mapping
    config.MODELS_DIR.mkdir(parents=True, exist_ok=True)
    save_label_map(label_to_idx, config.DYNAMIC_LABELS_PATH)
    print(f"Saved label mapping to {config.DYNAMIC_LABELS_PATH}")

    # Build model
    model = build_dynamic_bilstm(
        sequence_length=config.SEQUENCE_LENGTH,
        num_features=num_features,
        num_classes=num_classes
    )
    model.summary()

    # Callbacks
    early_stop = callbacks.EarlyStopping(
        monitor='val_loss',
        patience=15,
        restore_best_weights=True,
        verbose=1
    )
    checkpoint = callbacks.ModelCheckpoint(
        filepath=str(config.DYNAMIC_MODEL_PATH),
        monitor='val_accuracy',
        save_best_only=True,
        verbose=1
    )
    reduce_lr = callbacks.ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=5,
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
    plot_path = config.RESULTS_DIR / "dynamic_training_curve.png"
    plot_training_history(history, plot_path)

    # Ensure best model is saved
    model.save(config.DYNAMIC_MODEL_PATH)
    print(f"Model saved to {config.DYNAMIC_MODEL_PATH}")


if __name__ == "__main__":
    train()
