# ISL Bridge — Indian Sign Language Recognition & Translation Platform

A modern, accessible, responsive web application for real-time Indian Sign Language (ISL) recognition and speech synthesis. Designed with a calm pastel aesthetic, rounded card architecture, pill navigation, and deep accessibility features.

---

## 1. Features & Capabilities

- **Dashboard:**
  - Dynamic greeting with system readiness badge.
  - 4 compact pastel statistics cards (Words Recognized, Sentences Translated, Sessions, Recognition Modes).
  - Two-column layout with 21-point dual-hand skeletal preview, mode selector shortcuts, Recharts activity visualization, and real-time FastAPI engine health card.
  - "Continue where you left off" quick-resume panel for previous sessions.

- **Live Translation Studio:**
  - High-performance live webcam preview with MediaDevices API and hardware enumeration.
  - Dual-hand landmark canvas overlay aligned to video with distinct Left-Hand (`#D5E2C2` / `#4D6431`) and Right-Hand (`#B7C8FF` / `#1E3A8A`) skeleton tracking.
  - Independent Left and Right hand detection status pills (`L` & `R`) with state badges (*Waiting for hands*, *Detecting hands*, *Recognizing sign*).
  - Mode segmented control:
    - **Static Mode:** 114 word classes, 128-dimensional normalized feature vectors.
    - **Dynamic Mode:** 97 sentence classes, 30-frame rolling sequence buffer.
  - Recognition result card with animated confidence bar, 65% threshold indicator, and top 4 prediction candidates.
  - Dedicated **Your Sentence** builder: ordered token chips with delete buttons, editable text area, copy to clipboard, and native Web Speech API Text-to-Speech (TTS) playback.
  - Direct frame snapshot analysis calling `POST /api/predict/frame` and file upload fallback for image-based static inference.
  - Session controls: Start, Pause, Resume, End & Save to History, and Reset Sequence Buffer.

- **ISL Vocabulary Explorer:**
  - Searchable catalog of all 211 supported ISL classes (114 static word signs + 97 dynamic sentence gestures).
  - Live filtering by mode (All / Static Words / Dynamic Sentences), category (Questions, Greetings, Emotions, Objects, Actions), and alphabetical sorting (A-Z, Z-A).
  - Sign detail modal with technical inference specs (feature dimensions, classifier architecture, hand dominance, and practice CTA).

- **Translation History:**
  - Searchable local history persisted in `localStorage`.
  - Filter by mode, sort by newest/oldest, and view session durations and average confidences.
  - Copy to clipboard, replay speech audio, and export to CSV or JSON.

- **Settings & Privacy:**
  - REST API base URL and WebSocket URL configuration with connection latency ping.
  - Camera device selection and test.
  - Preferred default recognition mode and Text-to-Speech speech rate slider (0.5x – 1.5x).
  - Simulation / Demo Mode toggle for testing offline without backend models.
  - Local history storage management and privacy notice.

---

## 2. Technology Stack

- **Framework:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS (custom pastel tokens & rounded card theme)
- **Routing:** React Router v7 (`react-router-dom`)
- **Icons:** Lucide React
- **Visualizations:** Recharts (responsive bar chart)
- **HTTP Client:** Axios
- **Real-Time Streaming:** Native WebSocket client with auto-reconnect
- **Speech Synthesis:** Browser Web Speech API (`window.speechSynthesis`)
- **Effects:** Canvas Confetti

---

## 3. Design System & Palette

| Token | Hex | Usage |
|---|---|---|
| Primary Sage Green | `#D5E2C2` | Primary brand accent, Left hand skeleton, active badges |
| Main Background | `#F7F8F4` | App page background |
| Card Background | `#FFFFFF` | Rounded cards (18–24px radius) |
| Soft Gray Surface | `#F0F2F3` | Section backgrounds, pill buttons |
| Primary Text | `#252720` | High-contrast dark charcoal headings & text |
| Secondary Text | `#747873` | Subtitles, labels, metadata |
| Soft Blue | `#B7C8FF` | Dynamic mode, Right hand skeleton accent |
| Lavender | `#D1B9E8` | History accent, statistical badges |
| Warm Yellow | `#FFE17A` | Demo mode pill, warnings |
| Muted Coral | `#F1B6B9` | Accent points, notifications |

---

## 4. Getting Started

### Prerequisites

- Node.js (v18+ recommended, tested with v24.22)
- npm or pnpm

### Installation

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

The application will start on `http://localhost:5173`.
Vite will proxy `/api` and `/ws` requests to `http://localhost:8000`.

### Production Build

```bash
npm run build
```

Build outputs are generated in `frontend/dist`.
The FastAPI backend (`python run_server.py`) will automatically serve this production build at `http://localhost:8000/`.

---

## 5. Environment Variables

Create a `.env` file in the `frontend` root:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws/predict
VITE_ENABLE_MOCK_FALLBACK=true
```

---

## 6. Dual-Hand Landmark Normalization Format

The ISL backend expects 128 normalized float features:
- `[0:63]`: 21 (x, y, z) coordinates for Left Hand, wrist-relative and scaled to `[-1.0, 1.0]` (or zeros if absent).
- `[63:126]`: 21 (x, y, z) coordinates for Right Hand, wrist-relative and scaled to `[-1.0, 1.0]` (or zeros if absent).
- `[126]`: Left hand presence flag (`1.0` if present, `0.0` if absent).
- `[127]`: Right hand presence flag (`1.0` if present, `0.0` if absent).

Total: **128 features**.
Threshold: **≥ 65% confidence** with 5-frame majority-voting smoothing.
