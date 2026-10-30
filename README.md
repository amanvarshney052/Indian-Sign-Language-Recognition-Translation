# Indian Sign Language (ISL) Recognition System

A modular, real-time Indian Sign Language (ISL) recognition system supporting both **static sign recognition** (using an MLP neural network) and **dynamic word recognition** (using an LSTM neural network) on top of MediaPipe Hand Landmarks.

---

## 1. System Architecture

```
                       [Live Webcam / Video Frame]
                                   │
                                   ▼
                         [MediaPipe Hands Dual]
                    (Extract Left & Right Landmarks)
                                   │
                                   ▼
                       [Feature Normalization]
                • Wrist-relative translation (x-x0, y-y0, z-z0)
                • Scale-invariant normalization
                • Hand presence indicators
                                   │
                                   ▼
                         [128-d Feature Vector]
                                   │
                ┌───────────────────┴───────────────────┐
                │                                       │
       [STATIC MODE ('S')]                     [DYNAMIC MODE ('D')]
                │                                       │
                ▼                                       ▼
         Current Frame (128)                 Rolling Buffer (30 × 128)
                │                                       │
                ▼                                       ▼
         MLP Classifier                         BiLSTM Classifier
      (Dense 256-128-64-Out)                 (BiLSTM 128 - LSTM 96)
                │                                       │
                └───────────────────┬───────────────────┘
                                    │
                                    ▼
                             [Raw Prediction]
                                    │
                                    ▼
                      [Confidence Filter (>= 65%)]
                                    │
                                    ▼
                   [Prediction Smoothing (Majority Vote)]
                                    │
                                    ▼
                        [Duplicate Suppression]
                                    │
                                    ▼
                        [Sentence Buffer Update]
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
             [OpenCV Display]             [TTS Audio ('T' key)]
```

---

## 2. Directory Structure

```
ISL project/
├── isldata/                           # ISL-CSLRT Corpus (Words & Sentences)
│   └── ISL_CSLRT_Corpus/
│       ├── Frames_Word_Level/         # 1,036 word-level images across 114 classes
│       ├── Frames_Sentence_Level/     # 18,863 video frames across 97 sentences & 7 signers
│       └── corpus_csv_files/          # Metadata and gloss mappings
├── data/
│   ├── static/
│   │   └── static_landmarks.csv       # 128 normalized dual-hand features + ISL class labels
│   └── dynamic/
│       └── dynamic_sequences.npz      # 663 video sequences of shape (30, 128)
├── data_collection/
│   ├── collect_static.py              # Interactive webcam collector for static signs (128-d)
│   └── collect_dynamic.py             # Interactive webcam collector for dynamic sequences (128-d)
├── preprocessing/
│   ├── landmarks.py                   # MediaPipe HandLandmarkExtractor (Dual-hand)
│   ├── normalization.py               # Wrist-relative & scale normalization (128-d)
│   ├── dataset_loader.py              # Stratified train/val/test data loader
│   └── extract_full_corpus.py         # Full ISL-CSLRT corpus feature extractor
├── models/
│   ├── static_model.keras             # Trained static MLP model (114 ISL classes)
│   ├── dynamic_model.keras            # Trained dynamic BiLSTM model (97 ISL gestures)
│   ├── static_labels.json             # Label mapping for static signs
│   ├── dynamic_labels.json            # Label mapping for dynamic words
│   └── hand_landmarker.task           # MediaPipe hand tracking model asset
├── training/
│   ├── train_static.py                # MLP training pipeline with EarlyStopping
│   └── train_dynamic.py               # BiLSTM training pipeline with EarlyStopping
├── evaluation/
│   ├── evaluate_static.py             # Computes metrics & confusion matrix for static model
│   └── evaluate_dynamic.py            # Computes metrics & confusion matrix for dynamic model
├── inference/
│   └── realtime.py                    # Real-time OpenCV webcam desktop application
├── backend/                           # FastAPI backend server with WebSocket real-time engine
│   ├── main.py
│   └── service.py
├── frontend/                          # ISL Bridge — Modern React + TypeScript + Vite UI
│   ├── src/
│   │   ├── app/                       # App root & React Router
│   │   ├── components/                # Modular UI components (dashboard, translation, etc.)
│   │   ├── pages/                     # 5 Core pages: Dashboard, Translate, Vocabulary, History, Settings
│   │   ├── services/                  # REST API, WebSocket, Camera, History services
│   │   ├── hooks/                     # Custom hooks: useCamera, useWebSocket, useTranslationSession
│   │   ├── types/                     # Strict TypeScript interfaces
│   │   └── mocks/                     # Offline 211-class simulation & demo dataset
│   ├── dist/                          # Production static build served by FastAPI
│   └── package.json

├── tests/
│   ├── test_pipeline.py               # Unit tests for normalization and dataset loaders
│   └── test_on_image.py               # Static image inference verification
├── run_server.py                      # Application launcher script
├── config.py                          # Configurable classes, thresholds & parameters
├── requirements.txt                   # Project dependencies
└── README.md
```

---

## 3. Installation & Setup

Ensure you have Python 3.11 or 3.12 installed.

```bash
pip install -r requirements.txt
```

Core dependencies:
* `opencv-python`
* `mediapipe`
* `tensorflow`
* `scikit-learn`
* `pandas`, `numpy`, `matplotlib`, `seaborn`
* `pyttsx3` (for Text-to-Speech)
* `fastapi`, `uvicorn`, `websockets`

---

## 4. Workflow Guide

### Step 1: Feature Extraction from Corpus
To extract the dual-hand 128-dimensional dataset from the ISL-CSLRT corpus:
```bash
python preprocessing/extract_full_corpus.py
```

### Step 2: Custom Sign Collection (Optional)
To record custom static signs from webcam:
```bash
python data_collection/collect_static.py
```
* `SPACE`: Capture a single landmark sample.
* `B`: Burst capture 30 samples with a 3-second countdown.
* `N` / `P`: Next / Previous class.
* `Q`: Quit.

To collect dynamic gesture sequences (e.g. `HELLO`, `THANK_YOU`, `HELP`, ...):
```bash
python data_collection/collect_dynamic.py
```
* `SPACE`: Start 3-second countdown, then automatically records 30 frames.
* `N` / `P`: Next / Previous dynamic word.
* `Q`: Quit.

---

### Step 2: Training

Train the static sign MLP model:
```bash
python training/train_static.py
```
* Saves weights to `models/static_model.keras`
* Saves label mapping to `models/static_labels.json`
* Saves loss/accuracy curves to `results/static_training_curve.png`

Train the dynamic gesture LSTM model:
```bash
python training/train_dynamic.py
```
* Saves weights to `models/dynamic_model.keras`
* Saves label mapping to `models/dynamic_labels.json`
* Saves loss/accuracy curves to `results/dynamic_training_curve.png`

---

### Step 3: Evaluation

Evaluate the static model:
```bash
python evaluation/evaluate_static.py
```
Outputs accuracy, precision, recall, F1-score, inference latency, and saves `results/static_confusion_matrix.png`.

Evaluate the dynamic model:
```bash
python evaluation/evaluate_dynamic.py
```
Outputs sequence accuracy, classification report, latency, and saves `results/dynamic_confusion_matrix.png`.

---

### Step 4: Real-Time Inference

Run the real-time recognition program:
```bash
python inference/realtime.py
```

#### Keyboard Controls
| Key | Action | Description |
| :--- | :--- | :--- |
| `S` | Static Mode | Evaluates single frames with the MLP classifier |
| `D` | Dynamic Mode | Buffers 30 frames and evaluates with the LSTM classifier |
| `T` | Text-to-Speech | Speaks the currently accumulated sentence buffer |
| `C` | Clear | Resets the sentence buffer |
| `Q` / `ESC` | Quit | Closes webcam and exits |

---

### Step 5: Web Application (Modern Browser Interface)

Launch the full-stack web application:
```bash
python run_server.py
```
Open your browser at `http://127.0.0.1:8000` to interact with the real-time AI interface featuring neon HUD skeleton tracking, confidence meter, 30-frame sequence buffer indicator, sentence builder chips, Web Speech Text-to-Speech, and vocabulary guide.

---

## 5. Key Engineering Details

1. **Wrist-Relative & Scale Normalization**:
   $$\Delta x_i = \frac{x_i - x_0}{\max_k \|\vec{p}_k - \vec{p}_0\|}, \quad \Delta y_i = \frac{y_i - y_0}{\max_k \|\vec{p}_k - \vec{p}_0\|}, \quad \Delta z_i = \frac{z_i - z_0}{\max_k \|\vec{p}_k - \vec{p}_0\|}$$
   This ensures translations in camera space and distance variations do not alter the classification decision.

2. **Prediction Smoothing**:
   A rolling window of the last 5 predictions uses majority voting to filter out single-frame jitter or transient false positives.

3. **Duplicate Suppression**:
   Holding a sign continuously will register once in the sentence buffer rather than spamming duplicate characters every frame.

4. **Missing Hand Robustness**:
   If a hand is temporarily occluded for 1–2 frames during dynamic gestures, the last valid pose is carried forward. Sequences with >50% missing hands are discarded during collection to ensure high data quality.
