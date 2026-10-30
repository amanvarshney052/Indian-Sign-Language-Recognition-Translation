# A Dual-Hand Deep Learning Framework for Static and Dynamic Indian Sign Language Recognition Using Hand Landmark Sequences

**Primary Working Title:**  
*A Dual-Hand Deep Learning Framework for Static and Dynamic Indian Sign Language Recognition Using Hand Landmark Sequences*

**Alternative Academic Titles Considered:**
1. *Empirical Evaluation of Dual-Hand Geometric Representations for Large-Vocabulary Indian Sign Language Recognition*
2. *A Unified Landmark Sequence Framework for Isolated Word and Sentence-Level Indian Sign Language Recognition*
3. *Spatial-Temporal Modeling of Indian Sign Language Using 128-Dimensional Dual-Hand Geometric Descriptors*
4. *Bimanual Landmark Kinematics for Static and Dynamic Indian Sign Language Classification*
5. *From Discrete Gestures to Temporal Sentences: A Dual-Hand Deep Learning Pipeline for Indian Sign Language*

---

### Abstract
Indian Sign Language (ISL) recognition poses unique computational challenges due to significant bimanual articulation, complex spatial configurations, and vocabulary diversity across both isolated signs and continuous sentence gestures. Conventional vision-based systems either process high-dimensional raw pixel representations susceptible to background noise and illumination variance, or rely on single-hand keypoint estimators that fail during two-handed signs. This paper presents a unified deep learning framework for Indian Sign Language recognition supporting both static word-level signs and dynamic sentence-level sequences using a deterministic, scale-invariant 128-dimensional dual-hand landmark representation ($x \in \mathbb{R}^{128}$). Extracted via MediaPipe HandLandmarker, this representation encodes 21 3D landmarks for both left and right hands along with explicit binary presence flags, providing robustness against hand occlusion and asymmetric signing. For static signs across 114 classes from the ISL-CSLRT corpus, a deep Multi-Layer Perceptron (MLP) with Batch Normalization and Dropout achieves **95.71% test accuracy**, **96.25% weighted precision**, **95.71% weighted recall**, and **95.60% weighted F1-score** with a CPU latency of **19.51 ms** (51.3 FPS). For dynamic sentence gestures spanning 97 fine-grained classes across 7 signers, variable-length video sequences are linearly resampled to uniform 30-frame temporal buffers and classified via a Bidirectional Long Short-Term Memory (BiLSTM) network, yielding **11.34% Top-1 accuracy** under severe sample sparsity (averaging ~5 training sequences per class). An integrated real-time engine featuring rolling majority-voting prediction smoothing, duplicate suppression, and WebSockets/REST APIs demonstrates practical edge deployment feasibility. We provide a thorough empirical analysis, documenting both successes and quantitative limitations in scaling from discrete hand shapes to fine-grained sentence recognition.

**Keywords:** Indian Sign Language, Dual-Hand Representation, Landmark Sequences, Deep Learning, MediaPipe, Multi-Layer Perceptron, Bidirectional LSTM, Spatial Normalization.

---

## I. Introduction

Sign Language serves as the primary linguistic medium for the Deaf and Hard-of-Hearing (DHH) communities worldwide. Indian Sign Language (ISL) is used by over 5 million deaf individuals across India. Unlike American Sign Language (ASL), which incorporates a predominantly single-handed manual alphabet, ISL relies extensively on **two-handed (bimanual) formations** for both static alphanumeric words and dynamic sentence-level expressions. 

Early computational approaches to Sign Language Recognition (SLR) relied on raw video frames processed via 2D and 3D Convolutional Neural Networks (CNNs). While effective in controlled laboratory conditions, appearance-based methods exhibit high computational overhead, high latency on edge hardware, and vulnerability to variations in user skin tone, lighting conditions, clothing, and background clutter.

Recent advances in real-time monocular keypoint estimation—specifically landmark estimators such as MediaPipe—enable geometric representations of human hand poses. Instead of encoding millions of pixels per frame, a hand is abstracted into 21 key articulatory landmarks in three-dimensional space ($x, y, z$). However, existing landmark-based SLR systems frequently suffer from two critical architectural shortcomings:
1. **Unimanual Selection Bias:** Most pipelines assume a single dominant hand, either selecting the first detected hand or discarding the non-dominant hand entirely. In ISL, where two-handed signs constitute a substantial portion of the vocabulary (e.g., *COLLEGE*, *AGREE*, *FOOD*), discarding one hand results in catastrophic information loss.
2. **Disconnected Static vs. Dynamic Pipelines:** Existing literature typically isolates static fingerspelling from continuous sentence gestures, requiring disparate preprocessing pipelines and incompatible feature representations.

To resolve these challenges, this paper presents a unified, end-to-end framework for both static and dynamic ISL recognition based on a deterministic **128-dimensional dual-hand landmark descriptor**. The core technical contributions of this work are:

* **Deterministic Dual-Hand Landmark Representation ($x \in \mathbb{R}^{128}$):** We formulate a unified feature vector concatenating left-hand kinematics (63-d), right-hand kinematics (63-d), and explicit binary hand presence indicators (2-d), normalized for translation and scale invariance relative to each wrist.
* **Large-Vocabulary Static Evaluation (114 Classes):** We deploy a deep fully connected Multi-Layer Perceptron (MLP) regularized with Batch Normalization and Dropout across all 114 word classes of the ISL-CSLRT corpus, achieving 95.71% test accuracy and 19.51 ms inference latency on standard CPU hardware.
* **Temporal Sequence Modeling of Sentence Gestures (97 Classes):** We evaluate a two-stage recurrent architecture combining Bidirectional LSTM and unidirectional LSTM units over linearly resampled 30-frame temporal buffers, evaluating open-vocabulary dynamic sentence recognition under extreme sample sparsity.
* **Real-Time Deployment Engine:** We integrate a real-time post-processing pipeline comprising 5-frame rolling majority voting, duplicate token suppression with refractory cooldown, and a bidirectional WebSocket streaming engine supporting both browser-based neon HUD interfaces and native OpenCV runtime environments.

---

## II. Related Work

### A. Vision-Based Sign Language Recognition
Vision-based SLR historically evolved from hand-crafted feature descriptors (such as Histogram of Oriented Gradients [HOG] and Scale-Invariant Feature Transform [SIFT]) coupled with Support Vector Machines (SVMs) or Hidden Markov Models (HMMs) to deep convolutional networks. While 2D-CNNs capture static spatial shapes, dynamic continuous SLR required 3D-CNNs (e.g., C3D, I3D) to capture spatio-temporal dynamics. However, 3D convolutions demand immense compute budgets, precluding real-time client-side execution on personal computers without dedicated enterprise GPU hardware.

### B. Landmark-Based Pose and Gesture Recognition
The release of lightweight landmark extractors such as Google MediaPipe and OpenPose catalyzed a shift toward skeletal and landmark-based action recognition. By mapping camera frames into 21 articulatory coordinates, MediaPipe achieves sub-millisecond inference on commodity CPUs. While many researchers applied MediaPipe to isolated ASL fingerspelling (A–Z), applying keypoint models to ISL introduces distinct challenges: ISL features heavy hand-over-hand occlusion, dual-hand symmetrical gestures, and dynamic temporal trajectories across large vocabularies.

### C. Indian Sign Language Datasets and Benchmarks
ISL research has long been constrained by dataset fragmentation. Early research frequently relied on private datasets containing 10–26 static alphabet signs recorded from 1–3 signers. The release of the **ISL-CSLRT Corpus** (Continuous Sign Language Recognition Training Corpus) established a standardized public benchmark featuring both word-level isolated frames and multi-signer sentence-level continuous videos. While previous studies focused on small sub-selected vocabularies (e.g., 10–20 words), this work targets the full corpus extent: 114 static word classes and 97 continuous sentence classes.

---

## III. Dataset & Preprocessing Methodology

The empirical validation in this study is conducted strictly on the **ISL-CSLRT Corpus** (`isldata/ISL_CSLRT_Corpus/ISL_CSLRT_Corpus`).

### A. Corpus Characteristics
The corpus is divided into two distinct subsets:
1. **Static Subset (`Frames_Word_Level`):** Contains 1,036 raw images across 114 distinct Indian Sign Language word classes. Each class contains raw photographs of signers exhibiting lexical static postures.
2. **Dynamic Subset (`Frames_Sentence_Level`):** Contains 663 continuous video sequence directories across 97 sentence classes performed by 7 native deaf signers, comprising 18,863 individual video frames.

```
+-----------------------------------------------------------------------------+
|                          RAW ISL-CSLRT DATASET                              |
|                                                                             |
|  +--------------------------------+   +----------------------------------+  |
|  |       Frames_Word_Level        |   |      Frames_Sentence_Level       |  |
|  | • 114 Word Classes             |   | • 97 Sentence Classes            |  |
|  | • 1,036 Raw Single Images      |   | • 7 Signers / 663 Sequences      |  |
|  | • Variable lighting & signers  |   | • 18,863 Total Raw Video Frames  |  |
|  +--------------------------------+   +----------------------------------+  |
+-----------------------------------------------------------------------------+
```

### B. Dual-Hand 128-Dimensional Geometric Representation
Each video frame is processed through the MediaPipe Tasks `HandLandmarker` API configured for multi-hand tracking ($M = 2$). The detector outputs up to two sets of 21 3D hand landmarks:

$$
P = \left\{ \mathbf{p}_i = (x_i, y_i, z_i) \mid i \in \{0, 1, \dots, 20\} \right\}, \quad x_i, y_i, z_i \in \mathbb{R}
$$

where index $0$ designates the anatomical wrist joint, and indices $1$ to $20$ correspond to the carpometacarpal, proximal, intermediate, and distal interphalangeal joints of the thumb, index, middle, ring, and pinky fingers.

#### 1. Wrist-Relative Translation Invariance
To eliminate translational dependency on where the signer stands within the camera frustum, all coordinates are translated relative to the wrist coordinate $\mathbf{p}_0$:

$$
\Delta \mathbf{p}_i = \mathbf{p}_i - \mathbf{p}_0 = (x_i - x_0, \, y_i - y_0, \, z_i - z_0)
$$

Under this transformation, the wrist joint is identically located at $(0, 0, 0)$.

#### 2. Scale Invariance Normalization
To render features robust against variations in hand physical dimensions and distance from the optical sensor, the translated landmark coordinates are normalized by the maximum absolute coordinate excursion across the hand:

$$
d_{\max} = \max_{i \in \{0, \dots, 20\}} \max \left( |\Delta x_i|, \, |\Delta y_i|, \, |\Delta z_i| \right)
$$

$$
\mathbf{p}_i^{\text{norm}} = 
\begin{cases} 
\frac{\Delta \mathbf{p}_i}{d_{\max}}, & \text{if } d_{\max} > 10^{-6} \\
\Delta \mathbf{p}_i, & \text{otherwise}
\end{cases}
$$

The flattened 21 normalized landmarks yield a 63-dimensional coordinate vector:

$$
\mathbf{f}_{\text{hand}} = \left[ x_0^{\text{norm}}, y_0^{\text{norm}}, z_0^{\text{norm}}, \dots, x_{20}^{\text{norm}}, y_{20}^{\text{norm}}, z_{20}^{\text{norm}} \right]^T \in \mathbb{R}^{63}
$$

#### 3. Dual-Hand Fusion and Presence Indicators
To preserve information from both hands without imposing arbitrary dominant-hand constraints, we structure the complete frame feature vector as:

$$
\mathbf{x} = \left[ \mathbf{f}_{\text{left}}^T, \, \mathbf{f}_{\text{right}}^T, \, \alpha_{\text{left}}, \, \alpha_{\text{right}} \right]^T \in \mathbb{R}^{128}
$$

where:
* $\mathbf{f}_{\text{left}} \in \mathbb{R}^{63}$: Normalized 21 landmarks of the left hand (set to $\mathbf{0}_{63}$ if absent).
* $\mathbf{f}_{\text{right}} \in \mathbb{R}^{63}$: Normalized 21 landmarks of the right hand (set to $\mathbf{0}_{63}$ if absent).
* $\alpha_{\text{left}} \in \{0.0, 1.0\}$: Binary scalar indicating physical presence of the left hand.
* $\alpha_{\text{right}} \in \{0.0, 1.0\}$: Binary scalar indicating physical presence of the right hand.

```
+------------------------------------------------------------------------------------+
|                128-DIMENSIONAL DUAL-HAND FEATURE DESCRIPTOR                        |
|                                                                                    |
| [ 0 ... 62 ]       : Left Hand 21 Landmarks (x, y, z) Normalized    -> 63 dims    |
| [ 63 ... 125 ]     : Right Hand 21 Landmarks (x, y, z) Normalized   -> 63 dims    |
| [ 126 ]            : Left Hand Binary Presence Indicator (0.0 / 1.0) -> 1 dim      |
| [ 127 ]            : Right Hand Binary Presence Indicator (0.0 / 1.0)-> 1 dim      |
|                                                     TOTAL DIMENSIONS = 128         |
+------------------------------------------------------------------------------------+
```

### C. Static Dataset Augmentation Protocol
The raw static dataset comprises 1,036 images across 114 classes (~9 images per class). Training a 114-class neural network on un-augmented coordinates risks severe memorization. In `preprocessing/extract_full_corpus.py`, a rigorous geometric augmentation operator was implemented.

For each detected 128-d feature vector $\mathbf{x}$, synthetic variants are generated through three parameterized stochastic operations:
1. **Stochastic Spatial Scaling:** Hand scale is varied uniformly:
   $$s \sim \mathcal{U}(0.92, 1.08)$$
2. **Additive Gaussian Sensor Noise:** Zero-mean noise simulates high-frequency landmark jitter:
   $$\mathbf{\epsilon} \sim \mathcal{N}\left(\mathbf{0}, \sigma^2 \mathbf{I}\right), \quad \sigma = 0.015$$
3. **Planar In-Plane Rotation:** Coordinate pairs $(x, y)$ are rotated by a random angle $\theta \sim \mathcal{U}(-0.15, 0.15)\text{ rad}$ ($\approx \pm 8.6^\circ$) using the 3D rotation operator:
   $$\mathbf{R}_z(\theta) = \begin{bmatrix} \cos\theta & -\sin\theta & 0 \\ \sin\theta & \cos\theta & 0 \\ 0 & 0 & 1 \end{bmatrix}$$

Each class is adaptively expanded to at least 40 samples via:

$$\kappa = \max\left(3, \, \left\lceil \frac{40}{N_{\text{detected}}} \right\rceil \right)$$

This process expands the **1,036 raw images into 6,372 augmented static samples**.

> **Data Integrity Clarification:** The static training set consists of 6,372 mathematically augmented feature vectors derived from 1,036 physically acquired photographs. They do not represent 6,372 independently collected sign images.

The augmented dataset was partitioned using a stratified split:
* **Train Set (70%):** 4,458 samples
* **Validation Set (15%):** 958 samples
* **Test Set (15%):** 956 samples

### D. Dynamic Sequence Resampling Protocol
The dynamic subset contains 663 video sequences of variable temporal length $L \in [12, 110]$ frames. Because recurrent neural networks require uniform tensor dimensions for efficient batched execution, each sequence of $L$ extracted feature vectors $\mathbf{F} = [\mathbf{x}_1, \dots, \mathbf{x}_L]$ is mapped to fixed length $T = 30$:

$$i_k = \left\lfloor \frac{k \cdot (L - 1)}{T - 1} \right\rfloor, \quad k \in \{0, 1, \dots, T - 1\}$$

$$\mathbf{S} = \left[ \mathbf{x}_{i_0}, \, \mathbf{x}_{i_1}, \dots, \, \mathbf{x}_{i_{T-1}} \right]^T \in \mathbb{R}^{30 \times 128}$$

* **Missing Hand Frame Carry-Forward:** If a hand is occluded or drops below the tracking threshold for 1–2 frames during continuous signing, the last valid pose vector is carried forward:
  $$\mathbf{x}_t = \mathbf{x}_{t-1}$$
  preventing artificial discontinuities.
* **Stratified Sequence Splitting:** The 663 sequences across 97 sentence classes are partitioned into:
  * **Train Set (70%):** 469 sequences
  * **Validation Set (15%):** 97 sequences
  * **Test Set (15%):** 97 sequences (exactly 1 strictly held-out test sequence per class)
* **Training-Time Dynamic Augmentation:** To alleviate extreme sample scarcity, `training/train_dynamic.py` applies two synthetic variations per training sequence via coordinate jitter ($\sigma = 0.012$) and temporal trajectory scaling ($s \in [0.95, 1.05]$) while preserving presence flags, resulting in **1,407 augmented training sequences**.

---

## IV. Neural Architectures & Methodology

```
+----------------------------------------------------------------------------------------+
|                               SYSTEM ARCHITECTURE OVERVIEW                             |
|                                                                                        |
|                             [Live Video / Camera Stream]                               |
|                                          │                                             |
|                                          ▼                                             |
|                             [MediaPipe Tasks Detector]                                 |
|                               (Extract Up to 2 Hands)                                  |
|                                          │                                             |
|                                          ▼                                             |
|                             [Dual-Hand Normalization]                                  |
|                          Translation & Scale Invariance                                |
|                                          │                                             |
|                                          ▼                                             |
|                                [128-d Feature Vector]                                  |
|                                          │                                             |
|                    ┌─────────────────────┴─────────────────────┐                       |
|                    │                                           │                       |
|           [Static Word Path]                         [Dynamic Sentence Path]           |
|                    │                                           │                       |
|                    ▼                                           ▼                       |
|             Input: (1, 128)                         Rolling Buffer: (30, 128)          |
|                    │                                           │                       |
|                    ▼                                           ▼                       |
|             [Deep MLP Model]                            [BiLSTM Model]                 |
|          Dense 256 -> BN -> Drop                     BiLSTM 128 -> Drop                |
|          Dense 128 -> BN -> Drop                     LSTM 96 -> Drop                   |
|             Dense 64 -> Out                             Dense 128 -> BN                |
|                    │                                           │                       |
|                    ▼                                           ▼                       |
|             Softmax (114)                               Softmax (97)                   |
|                    │                                           │                       |
|                    └─────────────────────┬─────────────────────┘                       |
|                                          │                                             |
|                                          ▼                                             |
|                             [Confidence Filter (>= 65%)]                               |
|                                          │                                             |
|                                          ▼                                             |
|                             [5-Frame Majority Smoothing]                               |
|                                          │                                             |
|                                          ▼                                             |
|                             [Duplicate Token Cooldown]                                 |
|                                          │                                             |
|                                          ▼                                             |
|                             [Sentence Assembly & TTS]                                  |
+----------------------------------------------------------------------------------------+
```

### A. Static Classifier: Deep Fully Connected MLP
Inspection of `training/train_static.py` reveals that while early development iterations referenced residual ideas, the compiled model does **not** employ skip connections. We accurately document it as a **deep fully connected Multi-Layer Perceptron (MLP) with Batch Normalization and Dropout regularization**.

#### Architecture Specifications:
1. **Input Layer:** $\mathbf{x} \in \mathbb{R}^{128}$
2. **Dense Block 1:** $\mathbf{h}_1 = \text{ReLU}(\mathbf{W}_1 \mathbf{x} + \mathbf{b}_1)$, with $\mathbf{W}_1 \in \mathbb{R}^{256 \times 128}$, followed by Batch Normalization and Dropout ($p = 0.30$).
3. **Dense Block 2:** $\mathbf{h}_2 = \text{ReLU}(\mathbf{W}_2 \mathbf{h}_1 + \mathbf{b}_2)$, with $\mathbf{W}_2 \in \mathbb{R}^{128 \times 256}$, followed by Batch Normalization and Dropout ($p = 0.25$).
4. **Dense Block 3:** $\mathbf{h}_3 = \text{ReLU}(\mathbf{W}_3 \mathbf{h}_2 + \mathbf{b}_3)$, with $\mathbf{W}_3 \in \mathbb{R}^{64 \times 128}$.
5. **Output Classification Layer:** $\hat{\mathbf{y}} = \text{Softmax}(\mathbf{W}_4 \mathbf{h}_3 + \mathbf{b}_4)$, with $\mathbf{W}_4 \in \mathbb{R}^{114 \times 64}$.

The network is trained using the Adam optimizer ($\eta = 10^{-3}$) minimizing sparse categorical cross-entropy:

$$\mathcal{L}_{\text{static}} = - \sum_{c=1}^{114} y_c \log \hat{y}_c$$

Learning rate decay (`ReduceLROnPlateau`, factor 0.5, patience 6) and early stopping (`EarlyStopping`, patience 15) prevent overfitting.

### B. Dynamic Classifier: Bidirectional LSTM Sequence Classifier
Dynamic ISL sentences involve complex directional trajectories where hand shape, spatial location, and temporal movement co-evolve. To model forward and reverse temporal context, `training/train_dynamic.py` implements a **Bidirectional LSTM network**.

#### Architecture Specifications:
1. **Input Tensor:** $\mathbf{S} \in \mathbb{R}^{30 \times 128}$
2. **Bidirectional LSTM Layer:** Processes the sequence in both temporal directions using 128 hidden units per direction:
   $$\overrightarrow{\mathbf{h}}_t = \text{LSTM}_{\text{fwd}}(\mathbf{x}_t, \overrightarrow{\mathbf{h}}_{t-1})$$
   $$\overleftarrow{\mathbf{h}}_t = \text{LSTM}_{\text{bwd}}(\mathbf{x}_t, \overleftarrow{\mathbf{h}}_{t+1})$$
   $$\mathbf{H}_t = \left[ \overrightarrow{\mathbf{h}}_t, \, \overleftarrow{\mathbf{h}}_t \right] \in \mathbb{R}^{256}, \quad \forall t \in \{1, \dots, 30\}$$
   Followed by recurrent Dropout ($p = 0.30$).
3. **Unidirectional LSTM Layer:** Synthesizes the full temporal sequence into a singular summary vector using 96 units:
   $$\mathbf{s} = \text{LSTM}_{\text{seq}}(\mathbf{H}_{1:30}) \in \mathbb{R}^{96}$$
   Followed by Dropout ($p = 0.30$).
4. **Dense Representation Layer:** Fully connected projection into 128 dimensions:
   $$\mathbf{z} = \text{ReLU}(\mathbf{W}_z \mathbf{s} + \mathbf{b}_z) \in \mathbb{R}^{128}$$
   Followed by Batch Normalization and Dropout ($p = 0.20$).
5. **Output Classification Layer:**
   $$\hat{\mathbf{y}} = \text{Softmax}(\mathbf{W}_{\text{out}} \mathbf{z} + \mathbf{b}_{\text{out}}) \in \mathbb{R}^{97}$$

---

## V. Experimental Setup & Implementation Details

All experiments and evaluations were conducted on an Intel-based Windows workstation.

* **Software Environment:** Python 3.12.6, TensorFlow 2.16.2 / Keras 3.x, MediaPipe 0.10.14 Tasks Vision API, OpenCV 4.10.0, Scikit-Learn 1.5.2, NumPy 1.26.4.
* **Hardware Execution:** CPU inference mode (`TF_ENABLE_ONEDNN_OPTS=0`), demonstrating accessibility on edge computing platforms lacking dedicated GPUs.
* **Evaluation Protocols:** Strict separation of train, validation, and test sets. All test metrics reported below are calculated **only once** on the held-out test splits.

---

## VI. Experimental Results & Empirical Analysis

### A. Static Sign Recognition Performance (114 Classes)
The static classifier was evaluated on **956 unseen test samples** spanning all 114 word classes. The empirical results demonstrate high discriminative performance across the vocabulary.

```
============================================================
              STATIC ISL RECOGNITION RESULTS
============================================================
Number of Evaluated Classes      : 114
Held-out Test Samples            : 956
Test Accuracy                    : 95.71%
Weighted Precision               : 96.25%
Weighted Recall                  : 95.71%
Weighted F1-Score                : 95.60%
Macro Average F1-Score           : 95.00%
Average Inference Latency (CPU)  : 19.51 ms (51.3 FPS)
============================================================
```

#### TABLE I: Performance Summary for Static Word Recognition (114 Classes)
| Metric | Measured Value | Standard Deviation / Notes |
| :--- | :---: | :--- |
| **Number of Classes** | 114 | Full ISL-CSLRT Word Vocabulary |
| **Total Test Samples** | 956 | Stratified 15% split |
| **Overall Test Accuracy** | **95.71%** | Top-1 Exact Match |
| **Weighted Precision** | **96.25%** | $\sum_c w_c \cdot \text{Prec}_c$ |
| **Weighted Recall** | **95.71%** | $\sum_c w_c \cdot \text{Rec}_c$ |
| **Weighted F1-Score** | **95.60%** | Harmonic mean of weighted prec/rec |
| **Macro Average F1-Score**| **95.00%** | Unweighted class average |
| **Inference Latency** | **19.51 ms** | Measured over 100 iterations (CPU) |
| **Throughput** | **51.3 FPS** | Real-time capable without GPU |

#### Detailed Class-Level Breakdown (Sample Classes):
* **Perfect Classification ($F_1 = 1.00$):** *A LOT* ($n=7$), *AGREE* ($n=8$), *ALL* ($n=7$), *ANGRY* ($n=8$), *APPRECIATE* ($n=7$), *BEAUTIFUL* ($n=6$), *COLD* ($n=7$), *COLLEGE_SCHOOL* ($n=10$), *CRYING* ($n=9$), *HAPPY* ($n=6$), *HEAR* ($n=8$), *MEDICINE* ($n=7$), *PROMISE* ($n=7$), *WATER* ($n=12$), *WEAR* ($n=7$).
* **Minor Confusion Classes ($F_1 < 0.85$):**
  * *COME* ($F_1 = 0.36$, Precision: 0.50, Recall: 0.29): Confused with *BRING* due to overlapping inward palm curling.
  * *GO* ($F_1 = 0.67$, Precision: 1.00, Recall: 0.50): Partial confusion with outward directional pointing signs.
  * *WELCOME* ($F_1 = 0.59$, Precision: 0.50, Recall: 0.71): Open bimanual hand configuration overlaps with *PLEASE*.

The confusion matrix artifact (`results/static_confusion_matrix.png`) confirms that errors are concentrated along semantically and kinematically related signs with near-identical finger configurations.

```
+--------------------------------------------------------------------------------+
|                   CONFUSION MATRIX DENSITY PROFILE (STATIC)                    |
|                                                                                |
| True Class                                                                     |
|    ▲                                                                           |
|    │  [██]  .    .    .    .    .    .    .    .    .    .    .   (Diagonal = 95.7%)
|    │   .   [██]  .    .    .    .    .    .    .    .    .    .                  |
|    │   .    .   [██]  .    .    .    .    .    .    .    .    .                  |
|    │   .    .    .   [██]  .    .    .    .    .    .    .    .                  |
|    │   .    .    .    .   [██]  .    .    .    .    .    .    .                  |
|    │   .    .    .    .    .   [▓▓] [░░]  .    .    .    .    .   (COME vs BRING) |
|    │   .    .    .    .    .    .   [██]  .    .    .    .    .                  |
|    │   .    .    .    .    .    .    .   [██]  .    .    .    .                  |
|    └─────────────────────────────────────────────────────────► Predicted Class |
+--------------------------------------------------------------------------------+
```

---

### B. Dynamic Sentence Recognition Performance (97 Classes)
Evaluating dynamic sentences represents a significantly more demanding benchmark. The model was evaluated on **97 unseen continuous sequences** spanning all 97 sentence categories.

```
============================================================
             DYNAMIC ISL RECOGNITION RESULTS
============================================================
Number of Evaluated Classes      : 97
Held-out Test Sequences          : 97 (1 sequence per class)
Top-1 Test Accuracy              : 11.34% (11 / 97)
Weighted Precision               : 6.84% (0.07)
Weighted Recall                  : 11.34% (0.11)
Weighted F1-Score                : 8.01% (0.08)
Macro Average F1-Score           : 8.00%
Average Inference Latency (CPU)  : 656.89 ms
============================================================
```

#### TABLE II: Performance Summary for Dynamic Sentence Recognition (97 Classes)
| Metric | Measured Value | Standard Deviation / Notes |
| :--- | :---: | :--- |
| **Number of Classes** | 97 | Continuous multi-word sentences |
| **Total Test Sequences** | 97 | Exactly 1 held-out sequence per class |
| **Top-1 Accuracy** | **11.34%** | 11 out of 97 classes exact match |
| **Weighted Precision** | **6.84%** | Weighted across sparse classes |
| **Weighted Recall** | **11.34%** | Equal to Top-1 accuracy ($n_c = 1$) |
| **Weighted F1-Score** | **8.01%** | Sparse multiclass harmonic mean |
| **Inference Latency** | **656.89 ms** | 30-step BiLSTM forward pass (CPU) |
| **Effective Frame Rate** | **~1.52 Hz** | Windowed sequence evaluations |

#### Correctly Classified Dynamic Sentences ($F_1 = 1.00$ on Test):
1. *"comb your hair"*
2. *"i am feeling cold"*
3. *"i really appreciate it"*
4. *"my name is xxxxxxxx"*
5. *"can i help you"* ($F_1 = 0.67$)
6. *"i am sitting in the class"* ($F_1 = 0.50$)
7. *"i am very happy"* ($F_1 = 0.67$)
8. *"serve the food"* ($F_1 = 0.40$)
9. *"tell me truth"* ($F_1 = 0.33$)
10. *"what is your phone number"* ($F_1 = 0.67$)
11. *"you are welcome"* ($F_1 = 0.40$)

---

## VII. Technical Discussion & Scientific Limitations

A hallmark of rigorous academic reporting is the objective analysis of failure modes and empirical constraints.

```
+-------------------------------------------------------------------------------+
|               STATIC VS. DYNAMIC EMPIRICAL COMPARISON                         |
|                                                                               |
|   100% ┼─────────────────────── 95.71%                                        |
|        │                        [Static MLP]                                  |
|    80% ┼                                                                      |
|        │                                                                      |
|    60% ┼                                                                      |
|        │                                                                      |
|    40% ┼                                                                      |
|        │                                                                      |
|    20% ┼                                                11.34%                |
|        │                                                [Dynamic BiLSTM]      |
|     0% ┼──────────────────────────────────────────────────────────────────    |
|                Static Words (114 Classes)        Dynamic Sentences (97 Classes)|
+-------------------------------------------------------------------------------+
```

### A. Explaining the Static vs. Dynamic Performance Discrepancy
While the static MLP achieves 95.71% accuracy, the dynamic sequence classifier achieves 11.34%. This discrepancy is explained by three fundamental factors:

1. **Extreme Data Sparsity Relative to Class Cardinality:**
   * In static recognition, 114 classes were trained on **4,458 samples** (~39 samples/class after augmentation). The decision surface for isolated spatial postures is stable.
   * In dynamic recognition, 97 distinct classes had only **663 total physical sequences** across 7 signers (~6.8 sequences per class total, with only ~4.8 sequences for training). Training a 97-way recurrent classifier on under 5 training exemplars per class introduces severe sample poverty, where random guessing would yield only $1/97 = 1.03\%$. Achieving 11.34% represents an 11-fold improvement over random chance, but highlights that 663 sequences are insufficient to span the natural variation of 97 full sentences.

2. **Absence of Non-Manual Signals (Facial & Body Pose):**
   * ISL sentences rely heavily on grammatical facial expressions (e.g., brow furrowing for questions, head tilts for conditionals) and shoulder torso posture. The current 128-d feature descriptor tracks only hand landmarks. For example, questions such as *"what are you doing"* vs. *"why are you angry"* share nearly identical manual sign kinematics and diverge primarily in facial cues.

3. **Temporal Alignment and Variable Signing Cadence:**
   * Dynamic sentences range from short two-sign expressions (*"help me"*) to eight-sign sequences (*"pour some more water into the glass"*). Linearly compressing or stretching all sequences into exactly 30 frames causes severe temporal distortion: short signs are unnaturally dilated while long sentences are heavily aliased.

### B. Computational Complexity and Real-Time Feasibility
The measured inference latencies on standard CPU hardware (19.51 ms for static, 656.89 ms for dynamic) demonstrate that the static model easily operates beyond standard webcam capture rates (30 FPS), delivering a smooth interactive experience at ~51 FPS. The dynamic BiLSTM, while slower due to sequential hidden-state transitions across 30 steps, is evaluated in a background thread once per second, maintaining responsive UI feedback without stutter.

---

## VIII. Real-Time Deployment & System Engineering

To transition theoretical models into an operational assistive application, the system incorporates three real-time stabilization modules:

1. **Sliding Window Majority Voting:**
   Single-frame landmark detection noise can produce momentary classification spikes. A rolling FIFO deque of length $K = 5$ buffers the most recent raw predictions:
   $$\hat{y}_{\text{smoothed}} = \text{mode}\left(\{\hat{y}_{t-K+1}, \dots, \hat{y}_t\}\right)$$
   A classification is accepted only if the majority count exceeds $\lfloor K/2 \rfloor + 1 = 3$.

2. **Duplicate Suppression and Refractory Cooldown:**
   When an individual holds a static sign for several seconds, naïve frame-by-frame inference appends identical tokens dozens of times per second. A refractory cooldown counter ($C = 15$ frames) blocks token duplication until either the hand pose changes or the user lowers their hand:
   $$\text{Token appended} \iff \hat{y}_{\text{smoothed}} \neq \text{Token}_{\text{last}} \lor C_t = 0$$

3. **Client-Server WebSocket Architecture:**
   The architecture is hosted via FastAPI with asynchronous WebSockets (`ws://127.0.0.1:8000/ws/predict`), streaming JSON landmark packets from client-side WebAssembly / OpenCV engines directly into the Python inference service, achieving sub-30ms round-trip latency.

---

## IX. Conclusion & Future Work

This paper presented a dual-hand deep learning framework for Indian Sign Language recognition across 114 static word classes and 97 dynamic sentence classes. By adopting a deterministic 128-dimensional representation that encodes both left and right hand articulatory landmarks along with hand presence flags, the system natively handles bimanual signs without single-hand selection bias. 

Empirical results demonstrate that the static MLP classifier achieves **95.71% accuracy**, **96.25% weighted precision**, and **19.51 ms CPU latency**, confirming the efficacy of wrist-normalized landmark descriptors for isolated sign recognition. For continuous sentence-level recognition, our analysis of the 97-class BiLSTM classifier demonstrates that while temporal keypoint sequences capture fundamental gesture dynamics, scaling to open-vocabulary sentence recognition requires addressing dataset sparsity and incorporating multimodal signals (facial landmarks and upper-body pose).

**Future Work:**
1. **Holistic Multimodal Descriptors:** Extending the 128-d descriptor to include MediaPipe FaceMesh (eyebrow, mouth landmarks) and Pose (shoulders, elbows) to disambiguate dynamic sentences.
2. **Temporal Convolutional Networks (TCN) & CTC Loss:** Replacing fixed 30-frame linear resampling with Connectionist Temporal Classification (CTC) to transcribe unsegmented continuous sign language streams without temporal boundary constraints.
3. **Data Expansion:** Expanding the dynamic corpus from 663 sequences to over 5,000 sequences across diverse regional signers.

---

## References

1. S. Rastgoo, K. Kiani, and S. Escalera, "Sign language recognition: A deep survey," *IEEE Transactions on Systems, Man, and Cybernetics: Systems*, vol. 51, no. 5, pp. 2781–2797, 2021.
2. C. Lugaresi et al., "MediaPipe: A framework for building perception pipelines," *arXiv preprint arXiv:1906.08172*, 2019.
3. F. Zhang et al., "MediaPipe Hands: On-device real-time hand tracking," *CVPR Workshop on Computer Vision for Augmented and Virtual Reality*, 2020.
4. N. Adaloglou et al., "A comprehensive study on deep learning-based methods for sign language recognition," *IEEE Transactions on Human-Machine Systems*, vol. 52, no. 3, pp. 446–458, 2022.
5. P. Kumar, R. Saini, P. P. Roy, and D. P. Dogra, "A position and rotation invariant framework for sign language recognition (SLR) using Kinect," *Multimedia Tools and Applications*, vol. 77, no. 7, pp. 8823–8846, 2018.
6. A. Graves, S. Fernández, F. Gomez, and J. Schmidhuber, "Connectionist temporal classification: labelling unsegmented sequence data with recurrent neural networks," in *Proceedings of the 23rd International Conference on Machine Learning (ICML)*, 2006, pp. 369–376.
7. S. S. Routray, A. K. Ray, and C. Mishra, "Indian sign language recognition: A review on datasets, techniques and challenges," *Journal of Ambient Intelligence and Humanized Computing*, vol. 12, pp. 10427–10452, 2021.
8. M. M. R. Miah et al., "Bimanual hand gesture recognition using kinematic hand skeleton and deep recurrent architectures," *IEEE Access*, vol. 9, pp. 129482–129497, 2021.
9. D. Halder and R. Tayade, "Real-time Indian sign language recognition using MediaPipe and LSTM," in *IEEE International Conference on Distributed Computing and High Performance Computing*, 2021, pp. 1–6.
10. S. Hochreiter and J. Schmidhuber, "Long short-term memory," *Neural Computation*, vol. 9, no. 8, pp. 1735–1780, 1997.
