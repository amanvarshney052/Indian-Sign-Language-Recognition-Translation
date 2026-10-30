import { useEffect, useState, useCallback, useRef } from 'react';
import { wsService, WebSocketStatus } from '../services/websocket';
import { WebSocketServerMessage } from '../types/api';

export function useWebSocket(onMessageCallback?: (msg: WebSocketServerMessage) => void) {
  const [status, setStatus] = useState<WebSocketStatus>(wsService.getStatus());
  const callbackRef = useRef(onMessageCallback);
  callbackRef.current = onMessageCallback;

  useEffect(() => {
    const unsubscribe = wsService.subscribe({
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
      },
      onMessage: (msg) => {
        callbackRef.current?.(msg);
      },
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const connect = useCallback(() => {
    wsService.connect();
  }, []);

  const disconnect = useCallback(() => {
    wsService.disconnect();
  }, []);

  const switchMode = useCallback((mode: 'STATIC' | 'DYNAMIC') => {
    return wsService.switchMode(mode);
  }, []);

  const clearSentence = useCallback(() => {
    return wsService.clearSentence();
  }, []);

  const resetBuffer = useCallback(() => {
    return wsService.resetBuffer();
  }, []);

  const streamLandmarks = useCallback((landmarks: any, mode?: 'STATIC' | 'DYNAMIC') => {
    return wsService.streamLandmarks(landmarks, mode);
  }, []);

  const streamFrameImage = useCallback((image: string, mode?: 'STATIC' | 'DYNAMIC') => {
    return wsService.streamFrameImage(image, mode);
  }, []);

  return {
    status,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    connect,
    disconnect,
    switchMode,
    clearSentence,
    resetBuffer,
    streamLandmarks,
    streamFrameImage,
  };
}

