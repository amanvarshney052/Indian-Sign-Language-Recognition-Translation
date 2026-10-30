import { PredictionCandidate } from '../types/api';
import { RecognitionMode } from '../types/translation';

export interface MockPredictionSample {
  mode: RecognitionMode;
  label: string;
  confidence: number;
  topCandidates: PredictionCandidate[];
  landmarks: {
    Left: [number, number, number][] | null;
    Right: [number, number, number][] | null;
  };
}

// MediaPipe 21 Hand Landmarks hand pose generator (normalized between 0.1 and 0.9)
export function generateHandLandmarks(baseX: number, baseY: number, scale = 0.25): [number, number, number][] {
  // Hand landmark schema:
  // 0: Wrist
  // 1-4: Thumb
  // 5-8: Index
  // 9-12: Middle
  // 13-16: Ring
  // 17-20: Pinky
  const jitter = () => (Math.random() - 0.5) * 0.015;

  const points: [number, number, number][] = [
    // 0: Wrist
    [baseX + jitter(), baseY + jitter(), 0],
    // Thumb: CMC, MCP, IP, TIP
    [baseX - scale * 0.35 + jitter(), baseY - scale * 0.2 + jitter(), -0.02],
    [baseX - scale * 0.55 + jitter(), baseY - scale * 0.45 + jitter(), -0.03],
    [baseX - scale * 0.65 + jitter(), baseY - scale * 0.7 + jitter(), -0.04],
    [baseX - scale * 0.75 + jitter(), baseY - scale * 0.9 + jitter(), -0.05],
    // Index: MCP, PIP, DIP, TIP
    [baseX - scale * 0.2 + jitter(), baseY - scale * 0.75 + jitter(), -0.01],
    [baseX - scale * 0.22 + jitter(), baseY - scale * 1.05 + jitter(), -0.02],
    [baseX - scale * 0.24 + jitter(), baseY - scale * 1.3 + jitter(), -0.03],
    [baseX - scale * 0.25 + jitter(), baseY - scale * 1.5 + jitter(), -0.04],
    // Middle: MCP, PIP, DIP, TIP
    [baseX + jitter(), baseY - scale * 0.78 + jitter(), 0],
    [baseX + jitter(), baseY - scale * 1.1 + jitter(), -0.01],
    [baseX + jitter(), baseY - scale * 1.4 + jitter(), -0.02],
    [baseX + jitter(), baseY - scale * 1.62 + jitter(), -0.03],
    // Ring: MCP, PIP, DIP, TIP
    [baseX + scale * 0.2 + jitter(), baseY - scale * 0.73 + jitter(), 0.01],
    [baseX + scale * 0.22 + jitter(), baseY - scale * 1.02 + jitter(), 0.01],
    [baseX + scale * 0.23 + jitter(), baseY - scale * 1.28 + jitter(), 0.01],
    [baseX + scale * 0.24 + jitter(), baseY - scale * 1.48 + jitter(), 0.01],
    // Pinky: MCP, PIP, DIP, TIP
    [baseX + scale * 0.4 + jitter(), baseY - scale * 0.65 + jitter(), 0.02],
    [baseX + scale * 0.45 + jitter(), baseY - scale * 0.88 + jitter(), 0.02],
    [baseX + scale * 0.48 + jitter(), baseY - scale * 1.08 + jitter(), 0.02],
    [baseX + scale * 0.5 + jitter(), baseY - scale * 1.25 + jitter(), 0.02],
  ];

  return points;
}

export const SAMPLE_STATIC_PREDICTIONS: MockPredictionSample[] = [
  {
    mode: 'STATIC',
    label: 'THANK',
    confidence: 0.94,
    topCandidates: [
      { label: 'THANK', confidence: 0.94 },
      { label: 'PLEASE', confidence: 0.04 },
      { label: 'WELCOME', confidence: 0.01 },
      { label: 'GOOD', confidence: 0.01 },
    ],
    landmarks: {
      Left: null,
      Right: generateHandLandmarks(0.62, 0.68),
    },
  },
  {
    mode: 'STATIC',
    label: 'WATER',
    confidence: 0.88,
    topCandidates: [
      { label: 'WATER', confidence: 0.88 },
      { label: 'FOOD', confidence: 0.07 },
      { label: 'GLASS', confidence: 0.03 },
      { label: 'POUR', confidence: 0.02 },
    ],
    landmarks: {
      Left: null,
      Right: generateHandLandmarks(0.65, 0.65),
    },
  },
  {
    mode: 'STATIC',
    label: 'FRIEND',
    confidence: 0.91,
    topCandidates: [
      { label: 'FRIEND', confidence: 0.91 },
      { label: 'PERSON', confidence: 0.05 },
      { label: 'MEET', confidence: 0.03 },
      { label: 'HELP', confidence: 0.01 },
    ],
    landmarks: {
      Left: generateHandLandmarks(0.35, 0.68),
      Right: generateHandLandmarks(0.65, 0.68),
    },
  },
  {
    mode: 'STATIC',
    label: 'HELP',
    confidence: 0.86,
    topCandidates: [
      { label: 'HELP', confidence: 0.86 },
      { label: 'NEED', confidence: 0.08 },
      { label: 'TRY', confidence: 0.04 },
      { label: 'UNDERSTAND', confidence: 0.02 },
    ],
    landmarks: {
      Left: generateHandLandmarks(0.38, 0.67),
      Right: generateHandLandmarks(0.62, 0.65),
    },
  },
  {
    mode: 'STATIC',
    label: 'HAPPY',
    confidence: 0.92,
    topCandidates: [
      { label: 'HAPPY', confidence: 0.92 },
      { label: 'ENJOY', confidence: 0.05 },
      { label: 'BEAUTIFUL', confidence: 0.02 },
      { label: 'FINE', confidence: 0.01 },
    ],
    landmarks: {
      Left: generateHandLandmarks(0.36, 0.64),
      Right: generateHandLandmarks(0.64, 0.64),
    },
  },
];

export const SAMPLE_DYNAMIC_PREDICTIONS: MockPredictionSample[] = [
  {
    mode: 'DYNAMIC',
    label: 'how can i help you',
    confidence: 0.89,
    topCandidates: [
      { label: 'how can i help you', confidence: 0.89 },
      { label: 'can i help you', confidence: 0.07 },
      { label: 'do you need something', confidence: 0.03 },
      { label: 'what you want', confidence: 0.01 },
    ],
    landmarks: {
      Left: generateHandLandmarks(0.32, 0.65),
      Right: generateHandLandmarks(0.68, 0.65),
    },
  },
  {
    mode: 'DYNAMIC',
    label: 'nice to meet you',
    confidence: 0.93,
    topCandidates: [
      { label: 'nice to meet you', confidence: 0.93 },
      { label: 'hi how are you', confidence: 0.04 },
      { label: 'it was nice chatting with you', confidence: 0.02 },
      { label: 'you are welcome', confidence: 0.01 },
    ],
    landmarks: {
      Left: generateHandLandmarks(0.34, 0.66),
      Right: generateHandLandmarks(0.66, 0.66),
    },
  },
  {
    mode: 'DYNAMIC',
    label: 'thank you so much',
    confidence: 0.95,
    topCandidates: [
      { label: 'thank you so much', confidence: 0.95 },
      { label: 'that is so kind of you', confidence: 0.03 },
      { label: 'i am really grateful', confidence: 0.01 },
      { label: 'you are welcome', confidence: 0.01 },
    ],
    landmarks: {
      Left: generateHandLandmarks(0.36, 0.62),
      Right: generateHandLandmarks(0.64, 0.62),
    },
  },
  {
    mode: 'DYNAMIC',
    label: 'This place is beautiful',
    confidence: 0.87,
    topCandidates: [
      { label: 'This place is beautiful', confidence: 0.87 },
      { label: 'i enjoyed a lot', confidence: 0.08 },
      { label: 'we are all with you', confidence: 0.03 },
      { label: 'take care of yourself', confidence: 0.02 },
    ],
    landmarks: {
      Left: generateHandLandmarks(0.35, 0.65),
      Right: generateHandLandmarks(0.65, 0.65),
    },
  },
];

