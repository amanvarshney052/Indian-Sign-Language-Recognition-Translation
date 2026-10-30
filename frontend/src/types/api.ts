/**
 * API types matching FastAPI backend contracts in backend/main.py and backend/service.py
 */

export interface SystemStatusResponse {
  status: 'online' | 'offline' | 'degraded';
  models: {
    static_model_loaded: boolean;
    static_classes: string[];
    dynamic_model_loaded: boolean;
    dynamic_classes: string[];
    confidence_threshold: number;
    smoothing_window: number;
    sequence_length: number;
    feature_dim: number;
  };
}

export interface ISLClassMetadata {
  name: string;
  type: 'Static Word / Sign' | 'Dynamic Sentence / Gesture';
  description: string;
}

export interface ClassesResponse {
  static_classes: ISLClassMetadata[];
  dynamic_classes: ISLClassMetadata[];
}

export interface PredictionCandidate {
  label: string;
  confidence: number;
}

export interface StaticPredictionResponse {
  label: string | null;
  raw_label: string;
  confidence: number;
  probabilities?: Record<string, number>;
  top_candidates: PredictionCandidate[];
  error?: string;
}

export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
}

export interface FramePredictionResponse {
  hand_detected: boolean;
  message?: string;
  landmarks?: {
    Left: [number, number, number][] | null;
    Right: [number, number, number][] | null;
  } | null;
  prediction?: StaticPredictionResponse;
}

// WebSocket Message Types
export type WebSocketClientCommand =
  | { command: 'switch_mode' | 'set_mode'; mode: 'STATIC' | 'DYNAMIC' }
  | { command: 'clear_sentence' }
  | { command: 'reset_buffer' }
  | {
      image?: string;
      landmarks?:
        | { Left?: number[][] | null; Right?: number[][] | null }
        | number[]
        | { handedness: 'Left' | 'Right'; landmarks: number[][] }[];
      mode?: 'STATIC' | 'DYNAMIC';
    };

export interface WebSocketPredictionUpdate {
  type: 'prediction_update';
  mode: 'STATIC' | 'DYNAMIC';
  hand_detected: boolean;
  landmarks?: {
    Left: [number, number, number][] | null;
    Right: [number, number, number][] | null;
  } | null;
  prediction: string | null;
  predicted_token: string | null;
  raw_prediction: string | null;
  confidence: number;
  top_candidates: PredictionCandidate[];
  candidates: PredictionCandidate[];
  dynamic_buffer_count: number;
  buffer_fill: number;
  sentence: string;
  sentence_tokens: string[];
}

export interface WebSocketModeUpdated {
  type: 'mode_updated';
  mode: 'STATIC' | 'DYNAMIC';
}

export interface WebSocketSentenceCleared {
  type: 'sentence_cleared';
  sentence: string;
  sentence_tokens: string[];
}

export interface WebSocketBufferReset {
  type: 'buffer_reset';
  buffer_fill: number;
  dynamic_buffer_count: number;
}

export interface WebSocketError {
  type: 'error';
  message: string;
}

export type WebSocketServerMessage =
  | WebSocketPredictionUpdate
  | WebSocketModeUpdated
  | WebSocketSentenceCleared
  | WebSocketBufferReset
  | WebSocketError;

