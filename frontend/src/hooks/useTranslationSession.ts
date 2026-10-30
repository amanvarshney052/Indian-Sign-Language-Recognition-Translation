import { useState, useCallback, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { apiService } from '../services/api';
import { historyService } from '../services/history';
import {
  DualHandLandmarks,
  HandStatus,
  RecognitionMode,
} from '../types/translation';
import { PredictionCandidate, WebSocketServerMessage } from '../types/api';
import { useWebSocket } from './useWebSocket';
import {
  SAMPLE_DYNAMIC_PREDICTIONS,
  SAMPLE_STATIC_PREDICTIONS,
} from '../mocks/mockPredictions';

export function useTranslationSession(isBackendOnline: boolean) {
  // Session State
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [mode, setMode] = useState<RecognitionMode>('STATIC');
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [isMockMode, setIsMockMode] = useState<boolean>(() => {
    return localStorage.getItem('isl_mock_mode_override') === 'true';
  });

  // Hand detection & Landmarks
  const [handStatus, setHandStatus] = useState<HandStatus>({
    leftDetected: false,
    rightDetected: false,
    status: 'idle',
  });
  const [landmarks, setLandmarks] = useState<DualHandLandmarks>({
    Left: null,
    Right: null,
  });

  // Prediction State
  const [currentPrediction, setCurrentPrediction] = useState<string | null>(null);
  const [rawPrediction, setRawPrediction] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [candidates, setCandidates] = useState<PredictionCandidate[]>([]);
  const [bufferFill, setBufferFill] = useState<number>(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<number | null>(null);

  // Sentence Builder State
  const [sentenceTokens, setSentenceTokens] = useState<string[]>([]);
  const [assembledSentence, setAssembledSentence] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isProcessingFrame, setIsProcessingFrame] = useState<boolean>(false);

  // Refs for timers and audio
  const sessionTimerRef = useRef<number | null>(null);
  const mockIntervalRef = useRef<number | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback(
    (msg: WebSocketServerMessage) => {
      if (isPaused) return;

      if (msg.type === 'prediction_update') {
        const leftDetected = Boolean(msg.landmarks?.Left);
        const rightDetected = Boolean(msg.landmarks?.Right);
        const handDetected = Boolean(msg.hand_detected) || leftDetected || rightDetected;

        setHandStatus({
          leftDetected: leftDetected || handDetected,
          rightDetected: rightDetected || handDetected,
          status: handDetected ? (msg.prediction ? 'recognizing' : 'detecting') : 'waiting',
        });

        if (msg.landmarks) {
          setLandmarks({
            Left: msg.landmarks.Left || null,
            Right: msg.landmarks.Right || null,
          });
        } else if (!handDetected) {
          setLandmarks({ Left: null, Right: null });
        }

        setCurrentPrediction(msg.prediction);
        setRawPrediction(msg.raw_prediction);
        setConfidence(msg.confidence || 0);
        setCandidates(msg.candidates || msg.top_candidates || []);
        setBufferFill(msg.buffer_fill || msg.dynamic_buffer_count || 0);
        setLastUpdateTime(Date.now());

        if (msg.sentence_tokens && msg.sentence_tokens.length > 0) {
          setSentenceTokens(msg.sentence_tokens);
          setAssembledSentence(msg.sentence || msg.sentence_tokens.join(' '));
        }
      } else if (msg.type === 'mode_updated') {
        setMode(msg.mode);
      } else if (msg.type === 'sentence_cleared') {
        setSentenceTokens([]);
        setAssembledSentence('');
      } else if (msg.type === 'buffer_reset') {
        setBufferFill(0);
      }
    },
    [isPaused]
  );

  const {
    status: wsStatus,
    isConnected: isWsConnected,
    connect: connectWs,
    disconnect: disconnectWs,
    switchMode: wsSwitchMode,
    clearSentence: wsClearSentence,
    resetBuffer: wsResetBuffer,
    streamLandmarks,
    streamFrameImage,
  } = useWebSocket(handleWebSocketMessage);

  // Auto-connect WS whenever backend is online and not in mock mode
  useEffect(() => {
    if (isBackendOnline && !isMockMode) {
      connectWs();
    }
  }, [isBackendOnline, isMockMode, connectWs]);

  // Session duration timer
  useEffect(() => {
    if (isSessionActive && !isPaused) {
      sessionTimerRef.current = window.setInterval(() => {
        setSessionDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    }
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, [isSessionActive, isPaused]);

  // Mock Mode loop when offline or forced mock
  useEffect(() => {
    const shouldRunMock = isSessionActive && !isPaused && (!isBackendOnline || isMockMode);

    if (shouldRunMock) {
      mockIntervalRef.current = window.setInterval(() => {
        const pool = mode === 'STATIC' ? SAMPLE_STATIC_PREDICTIONS : SAMPLE_DYNAMIC_PREDICTIONS;
        const randomSample = pool[Math.floor(Math.random() * pool.length)];

        setHandStatus({
          leftDetected: Boolean(randomSample.landmarks.Left),
          rightDetected: Boolean(randomSample.landmarks.Right),
          status: 'recognizing',
        });
        setLandmarks(randomSample.landmarks);
        setCurrentPrediction(randomSample.label);
        setRawPrediction(randomSample.label);
        setConfidence(randomSample.confidence);
        setCandidates(randomSample.topCandidates);
        setLastUpdateTime(Date.now());
        setBufferFill(mode === 'DYNAMIC' ? 30 : 1);

        // Append to sentence tokens if novel
        setSentenceTokens((prev) => {
          if (prev.length === 0 || prev[prev.length - 1] !== randomSample.label) {
            const next = [...prev, randomSample.label];
            setAssembledSentence(next.join(' '));
            return next;
          }
          return prev;
        });
      }, 3500);
    } else {
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current);
        mockIntervalRef.current = null;
      }
    }

    return () => {
      if (mockIntervalRef.current) clearInterval(mockIntervalRef.current);
    };
  }, [isSessionActive, isPaused, isBackendOnline, isMockMode, mode]);

  // Start Translation Session
  const startSession = useCallback(() => {
    setIsSessionActive(true);
    setIsPaused(false);
    setSessionDuration(0);
    setHandStatus({
      leftDetected: false,
      rightDetected: false,
      status: 'waiting',
    });
  }, []);

  // Pause Recognition
  const pauseSession = useCallback(() => {
    setIsPaused(true);
    setHandStatus((prev) => ({ ...prev, status: 'idle' }));
  }, []);

  // Resume Recognition
  const resumeSession = useCallback(() => {
    setIsPaused(false);
    setHandStatus((prev) => ({ ...prev, status: 'waiting' }));
  }, []);

  // End Translation Session & persist to history
  const endSession = useCallback(() => {
    if (assembledSentence.trim() || sentenceTokens.length > 0) {
      const avgConf = confidence > 0 ? confidence : 0.88;
      historyService.addEntry(
        assembledSentence || sentenceTokens.join(' '),
        sentenceTokens,
        mode,
        avgConf,
        isMockMode || !isBackendOnline ? 'demo' : 'live',
        sessionDuration
      );

      // Trigger celebratory confetti for completed translation
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.85 },
          colors: ['#D5E2C2', '#B7C8FF', '#D1B9E8', '#FFE17A'],
        });
      } catch (e) {
        // ignore
      }
    }

    setIsSessionActive(false);
    setIsPaused(false);
    setHandStatus({
      leftDetected: false,
      rightDetected: false,
      status: 'idle',
    });
    setLandmarks({ Left: null, Right: null });
  }, [assembledSentence, sentenceTokens, mode, confidence, isMockMode, isBackendOnline, sessionDuration]);

  // Mode switching
  const handleModeChange = useCallback(
    (newMode: RecognitionMode) => {
      setMode(newMode);
      setBufferFill(0);
      setCurrentPrediction(null);
      setRawPrediction(null);
      setCandidates([]);

      if (isWsConnected) {
        wsSwitchMode(newMode);
      }
    },
    [isWsConnected, wsSwitchMode]
  );

  // Clear Sentence
  const clearSentence = useCallback(() => {
    setSentenceTokens([]);
    setAssembledSentence('');
    if (isWsConnected) {
      wsClearSentence();
    }
  }, [isWsConnected, wsClearSentence]);

  // Reset rolling buffer
  const resetBuffer = useCallback(() => {
    setBufferFill(0);
    if (isWsConnected) {
      wsResetBuffer();
    }
  }, [isWsConnected, wsResetBuffer]);

  // Remove individual token
  const removeToken = useCallback((indexToRemove: number) => {
    setSentenceTokens((prev) => {
      const updated = prev.filter((_, idx) => idx !== indexToRemove);
      setAssembledSentence(updated.join(' '));
      return updated;
    });
  }, []);

  // Manual Sentence text change
  const handleSentenceChange = useCallback((newText: string) => {
    setAssembledSentence(newText);
    const splitTokens = newText.trim() ? newText.trim().split(/\s+/) : [];
    setSentenceTokens(splitTokens);
  }, []);

  // Process a frame through POST /api/predict/frame
  const processFrame = useCallback(
    async (blob: Blob) => {
      if (isProcessingFrame) return;
      setIsProcessingFrame(true);

      try {
        const result = await apiService.predictFrame(blob, mode);
        if (result.hand_detected) {
          setHandStatus({
            leftDetected: Boolean(result.landmarks?.Left),
            rightDetected: Boolean(result.landmarks?.Right),
            status: 'recognizing',
          });
          setLandmarks({
            Left: result.landmarks?.Left ?? null,
            Right: result.landmarks?.Right ?? null,
          });

          if (result.prediction) {
            const pred = result.prediction;
            setCurrentPrediction(pred.label);
            setRawPrediction(pred.raw_label);
            setConfidence(pred.confidence);
            setCandidates(pred.top_candidates || []);
            setLastUpdateTime(Date.now());

            if (pred.label) {
              setSentenceTokens((prev) => {
                if (prev.length === 0 || prev[prev.length - 1] !== pred.label) {
                  const updated = [...prev, pred.label as string];
                  setAssembledSentence(updated.join(' '));
                  return updated;
                }
                return prev;
              });
            }
          }
        } else {
          setHandStatus({
            leftDetected: false,
            rightDetected: false,
            status: 'waiting',
          });
          setLandmarks({ Left: null, Right: null });
        }
      } catch (e) {
        console.warn('[FrameInference] Error predicting frame:', e);
      } finally {
        setIsProcessingFrame(false);
      }
    },
    [isProcessingFrame, mode]
  );

  // Text-To-Speech (Native Web Speech API)
  const speakSentence = useCallback(
    (textToSpeak?: string) => {
      const text = textToSpeak || assembledSentence;
      if (!text || !text.trim()) return;

      if (!('speechSynthesis' in window)) {
        alert('Text-to-speech is not supported by your browser.');
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN'; // Indian English accent
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [assembledSentence]
  );

  // Stream image over WebSocket
  const streamFrame = useCallback(
    (base64Image: string) => {
      if (isWsConnected) {
        streamFrameImage(base64Image, mode);
      }
    },
    [isWsConnected, streamFrameImage, mode]
  );

  const toggleMockMode = useCallback((val?: boolean) => {
    setIsMockMode((prev) => {
      const next = val !== undefined ? val : !prev;
      localStorage.setItem('isl_mock_mode_override', String(next));
      return next;
    });
  }, []);

  return {
    isSessionActive,
    isPaused,
    mode,
    sessionDuration,
    isMockMode,
    toggleMockMode,
    handStatus,
    landmarks,
    currentPrediction,
    rawPrediction,
    confidence,
    candidates,
    bufferFill,
    lastUpdateTime,
    sentenceTokens,
    assembledSentence,
    isSpeaking,
    isProcessingFrame,
    wsStatus,
    isWsConnected,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    handleModeChange,
    clearSentence,
    resetBuffer,
    removeToken,
    handleSentenceChange,
    processFrame,
    streamFrame,
    speakSentence,
  };
}

