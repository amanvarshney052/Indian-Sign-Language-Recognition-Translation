import { CameraDevice, CameraPermissionState } from '../types/translation';

export class CameraService {
  private currentStream: MediaStream | null = null;
  private offscreenCanvas: HTMLCanvasElement | null = null;

  /**
   * Query available camera video input devices
   */
  async getCameraDevices(): Promise<CameraDevice[]> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      return [];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter((d) => d.kind === 'videoinput')
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${index + 1}`,
        }));
    } catch (e) {
      console.warn('[CameraService] Could not enumerate devices:', e);
      return [];
    }
  }

  /**
   * Request user permission and attach stream
   */
  async startStream(
    deviceId?: string,
    width = 640,
    height = 480
  ): Promise<{ stream: MediaStream; permission: CameraPermissionState }> {
    this.stopStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { stream: null as any, permission: 'unavailable' };
    }

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: deviceId
        ? { deviceId: { exact: deviceId }, width: { ideal: width }, height: { ideal: height } }
        : { facingMode: 'user', width: { ideal: width }, height: { ideal: height } },
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.currentStream = stream;
      return { stream, permission: 'granted' };
    } catch (err: any) {
      console.error('[CameraService] getUserMedia error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        return { stream: null as any, permission: 'denied' };
      }
      return { stream: null as any, permission: 'unavailable' };
    }
  }

  /**
   * Capture a single frame from video element as a JPEG Blob
   */
  captureFrameBlob(videoElement: HTMLVideoElement, quality = 0.85): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
        resolve(null);
        return;
      }

      if (!this.offscreenCanvas) {
        this.offscreenCanvas = document.createElement('canvas');
      }

      const canvas = this.offscreenCanvas;
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      // Draw current video frame
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        quality
      );
    });
  }

  /**
   * Capture an optimized frame from video element as a Base64 JPEG data URL for low-latency WebSocket streaming
   */
  captureFrameBase64(videoElement: HTMLVideoElement, quality = 0.55): string | null {
    if (!videoElement || videoElement.videoWidth === 0 || videoElement.videoHeight === 0) {
      return null;
    }

    if (!this.offscreenCanvas) {
      this.offscreenCanvas = document.createElement('canvas');
    }

    const canvas = this.offscreenCanvas;
    // Downscale slightly to 480w for speed and network efficiency
    const targetWidth = Math.min(videoElement.videoWidth, 480);
    const scale = targetWidth / videoElement.videoWidth;
    canvas.width = targetWidth;
    canvas.height = Math.round(videoElement.videoHeight * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  }

  /**
   * Stop active tracks and release camera hardware
   */
  stopStream() {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          // ignore
        }
      });
      this.currentStream = null;
    }
  }

  getActiveStream(): MediaStream | null {
    return this.currentStream;
  }
}

export const cameraService = new CameraService();

