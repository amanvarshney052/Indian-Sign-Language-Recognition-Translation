import {
  WebSocketClientCommand,
  WebSocketServerMessage,
} from '../types/api';

const DEFAULT_WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws/predict';

export type WebSocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface WebSocketServiceListener {
  onMessage?: (data: WebSocketServerMessage) => void;
  onStatusChange?: (status: WebSocketStatus) => void;
  onError?: (err: Event | Error) => void;
}

export class ISLWebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private status: WebSocketStatus = 'disconnected';
  private listeners: Set<WebSocketServiceListener> = new Set();
  private reconnectTimer: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isExplicitlyClosed = false;

  constructor() {
    this.url = localStorage.getItem('isl_ws_url') || DEFAULT_WS_URL;
  }

  public setUrl(url: string) {
    this.url = url;
    localStorage.setItem('isl_ws_url', url);
    if (this.socket && this.status === 'connected') {
      this.disconnect();
      this.connect();
    }
  }

  public getUrl(): string {
    return this.url;
  }

  public getStatus(): WebSocketStatus {
    return this.status;
  }

  public subscribe(listener: WebSocketServiceListener): () => void {
    this.listeners.add(listener);
    listener.onStatusChange?.(this.status);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateStatus(newStatus: WebSocketStatus) {
    this.status = newStatus;
    this.listeners.forEach((l) => l.onStatusChange?.(newStatus));
  }

  public connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isExplicitlyClosed = false;
    this.updateStatus('connecting');

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.updateStatus('connected');
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as WebSocketServerMessage;
          this.listeners.forEach((l) => l.onMessage?.(parsed));
        } catch (e) {
          console.warn('[WS] Received malformed message:', event.data, e);
        }
      };

      this.socket.onerror = (err) => {
        this.updateStatus('error');
        this.listeners.forEach((l) => l.onError?.(err));
      };

      this.socket.onclose = () => {
        this.socket = null;
        if (!this.isExplicitlyClosed) {
          this.updateStatus('disconnected');
          this.scheduleReconnect();
        } else {
          this.updateStatus('disconnected');
        }
      };
    } catch (err: any) {
      this.updateStatus('error');
      this.listeners.forEach((l) => l.onError?.(err));
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.isExplicitlyClosed || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 8000);
    this.reconnectAttempts++;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, delay);
  }

  public send(payload: WebSocketClientCommand) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return false;
    }
    try {
      this.socket.send(JSON.stringify(payload));
      return true;
    } catch (e) {
      console.error('[WS] Failed to send payload', e);
      return false;
    }
  }

  public switchMode(mode: 'STATIC' | 'DYNAMIC') {
    return this.send({ command: 'switch_mode', mode });
  }

  public clearSentence() {
    return this.send({ command: 'clear_sentence' });
  }

  public resetBuffer() {
    return this.send({ command: 'reset_buffer' });
  }

  public streamLandmarks(landmarks: any, mode?: 'STATIC' | 'DYNAMIC') {
    return this.send({ landmarks, mode });
  }

  public streamFrameImage(image: string, mode?: 'STATIC' | 'DYNAMIC') {
    return this.send({ image, mode });
  }


  public disconnect() {
    this.isExplicitlyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.updateStatus('disconnected');
  }
}

export const wsService = new ISLWebSocketService();

