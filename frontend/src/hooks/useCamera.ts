import { useEffect, useRef, useState, useCallback } from 'react';
import { cameraService } from '../services/camera';
import { CameraDevice, CameraPermissionState } from '../types/translation';

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [permission, setPermission] = useState<CameraPermissionState>('prompt');
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Load available camera devices
  const refreshDevices = useCallback(async () => {
    const list = await cameraService.getCameraDevices();
    setDevices(list);
    if (list.length > 0 && !selectedDeviceId) {
      setSelectedDeviceId(list[0].deviceId);
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  // Start camera stream
  const startCamera = useCallback(async (deviceIdToUse?: string) => {
    setError(null);
    const targetId = deviceIdToUse || selectedDeviceId;
    const result = await cameraService.startStream(targetId);
    setPermission(result.permission);

    if (result.permission === 'granted' && result.stream) {
      if (videoRef.current) {
        videoRef.current.srcObject = result.stream;
        videoRef.current.play().catch((e) => console.warn('Video play error:', e));
      }
      setIsActive(true);
      await refreshDevices();
    } else {
      setIsActive(false);
      if (result.permission === 'denied') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else {
        setError('Camera is not available or is being used by another application.');
      }
    }
  }, [selectedDeviceId, refreshDevices]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    cameraService.stopStream();
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  // Change selected camera device
  const switchDevice = useCallback(
    async (newDeviceId: string) => {
      setSelectedDeviceId(newDeviceId);
      if (isActive) {
        await startCamera(newDeviceId);
      }
    },
    [isActive, startCamera]
  );

  // Capture a snapshot blob from the live video
  const captureFrame = useCallback(async (): Promise<Blob | null> => {
    if (!videoRef.current) return null;
    return cameraService.captureFrameBlob(videoRef.current);
  }, []);

  // Capture a snapshot base64 string from live video for low-latency streaming
  const captureFrameBase64 = useCallback((quality = 0.55): string | null => {
    if (!videoRef.current) return null;
    return cameraService.captureFrameBase64(videoRef.current, quality);
  }, []);

  // Clean up tracks when hook unmounts
  useEffect(() => {
    return () => {
      cameraService.stopStream();
    };
  }, []);

  return {
    videoRef,
    isActive,
    permission,
    devices,
    selectedDeviceId,
    error,
    startCamera,
    stopCamera,
    switchDevice,
    captureFrame,
    captureFrameBase64,
    refreshDevices,
  };
}

