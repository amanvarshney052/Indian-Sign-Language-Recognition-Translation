import { PredictionCandidate } from './api';

export type RecognitionMode = 'STATIC' | 'DYNAMIC';

export type HandPresenceState = 'idle' | 'waiting' | 'detecting' | 'recognizing';

export interface HandStatus {
  leftDetected: boolean;
  rightDetected: boolean;
  status: HandPresenceState;
}

export interface DualHandLandmarks {
  Left: [number, number, number][] | null;
  Right: [number, number, number][] | null;
}

export interface CurrentPrediction {
  text: string | null;
  rawText: string | null;
  confidence: number;
  candidates: PredictionCandidate[];
  mode: RecognitionMode;
  timestamp: number;
}

export interface TranslationHistoryItem {
  id: string;
  timestamp: number;
  text: string;
  tokens: string[];
  mode: RecognitionMode;
  averageConfidence: number;
  durationSeconds?: number;
  source: 'live' | 'snapshot' | 'demo';
}

export interface SessionStatistics {
  wordsRecognized: number;
  sentencesTranslated: number;
  sessionCount: number;
  staticCount: number;
  dynamicCount: number;
  avgConfidence: number;
}

export interface CameraDevice {
  deviceId: string;
  label: string;
}

export type CameraPermissionState = 'prompt' | 'granted' | 'denied' | 'unavailable';

