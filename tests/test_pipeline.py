"""Unit tests for ISL recognition pipeline.
"""
import unittest
from pathlib import Path
import numpy as np

import config
from preprocessing.normalization import (
    normalize_single_hand,
    normalize_dual_hand_landmarks,
    denormalize_shape
)
from preprocessing.dataset_loader import load_static_dataset, load_dynamic_dataset, load_label_map
from inference.realtime import RealTimeISLRecognizer


class TestISLPipeline(unittest.TestCase):

    def test_single_hand_normalization(self):
        landmarks = np.ones((21, 3), dtype=np.float32)
        landmarks[0] = [1.0, 2.0, 3.0]  # wrist
        landmarks[1] = [1.5, 2.5, 3.5]

        features = normalize_single_hand(landmarks)
        self.assertEqual(features.shape, (63,))

        reshaped = denormalize_shape(features)
        self.assertEqual(reshaped.shape, (21, 3))
        # Wrist coordinate in relative coordinates must be [0, 0, 0]
        np.testing.assert_allclose(reshaped[0], [0.0, 0.0, 0.0], atol=1e-6)

    def test_dual_hand_normalization(self):
        left = np.ones((21, 3), dtype=np.float32)
        right = np.ones((21, 3), dtype=np.float32)

        # Dual hands present
        features = normalize_dual_hand_landmarks(left, right)
        self.assertEqual(features.shape, (config.NUM_FEATURES,))
        self.assertEqual(features[126], 1.0)
        self.assertEqual(features[127], 1.0)

        # Only right hand present
        features_right_only = normalize_dual_hand_landmarks(None, right)
        self.assertEqual(features_right_only.shape, (config.NUM_FEATURES,))
        self.assertEqual(features_right_only[126], 0.0)
        self.assertEqual(features_right_only[127], 1.0)

    def test_static_dataset_loader(self):
        if config.STATIC_CSV_PATH.exists():
            (X_train, y_train), (X_val, y_val), (X_test, y_test), label_map = load_static_dataset(
                config.STATIC_CSV_PATH
            )
            self.assertEqual(X_train.shape[1], config.NUM_FEATURES)
            self.assertGreater(len(X_train), 0)
            self.assertGreater(len(X_test), 0)
            self.assertGreater(len(label_map), 0)

    def test_dynamic_dataset_loader(self):
        if config.DYNAMIC_NPZ_PATH.exists():
            (X_train, y_train), (X_val, y_val), (X_test, y_test), label_map = load_dynamic_dataset(
                config.DYNAMIC_NPZ_PATH
            )
            self.assertEqual(X_train.shape[1:], (config.SEQUENCE_LENGTH, config.NUM_FEATURES))
            self.assertGreater(len(X_train), 0)
            self.assertGreater(len(X_test), 0)
            self.assertGreater(len(label_map), 0)

    def test_realtime_recognizer_logic(self):
        recognizer = RealTimeISLRecognizer()

        # Test Static Prediction with 128-d mock features
        mock_features = np.random.uniform(-1, 1, size=(config.NUM_FEATURES,)).astype(np.float32)
        pred, conf = recognizer.predict_static(mock_features)
        self.assertIsInstance(conf, float)

        # Test Smoothing
        recognizer.prediction_history.clear()
        for _ in range(4):
            smoothed = recognizer.smooth_prediction("HELLO")
        self.assertEqual(smoothed, "HELLO")

        # Test Duplicate Suppression
        recognizer.sentence_tokens.clear()
        recognizer.last_added_token = None
        recognizer.duplicate_cooldown = 0

        recognizer.update_sentence("HELLO")
        recognizer.update_sentence("HELLO")  # duplicate
        recognizer.update_sentence("HELLO")  # duplicate
        self.assertEqual(recognizer.sentence_tokens, ["HELLO"])

        recognizer.update_sentence("WORLD")
        self.assertEqual(recognizer.sentence_tokens, ["HELLO", "WORLD"])


if __name__ == "__main__":
    unittest.main()
