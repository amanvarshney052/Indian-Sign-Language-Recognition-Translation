import { useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/api';
import { SystemStatusResponse } from '../types/api';

export interface BackendStatusState {
  isOnline: boolean;
  isLoading: boolean;
  error: string | null;
  statusData: SystemStatusResponse | null;
  staticClassesCount: number;
  dynamicClassesCount: number;
  staticModelLoaded: boolean;
  dynamicModelLoaded: boolean;
  latencyMs: number | null;
  lastChecked: number | null;
}

export function useBackendStatus(pollIntervalMs = 15000) {
  const [state, setState] = useState<BackendStatusState>({
    isOnline: false,
    isLoading: true,
    error: null,
    statusData: null,
    staticClassesCount: 114,
    dynamicClassesCount: 97,
    staticModelLoaded: false,
    dynamicModelLoaded: false,
    latencyMs: null,
    lastChecked: null,
  });

  const checkStatus = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    const startTime = performance.now();
    try {
      const data = await apiService.getSystemStatus();
      const latency = Math.round(performance.now() - startTime);

      setState({
        isOnline: data.status === 'online',
        isLoading: false,
        error: null,
        statusData: data,
        staticClassesCount: data.models?.static_classes?.length ?? 114,
        dynamicClassesCount: data.models?.dynamic_classes?.length ?? 97,
        staticModelLoaded: Boolean(data.models?.static_model_loaded),
        dynamicModelLoaded: Boolean(data.models?.dynamic_model_loaded),
        latencyMs: latency,
        lastChecked: Date.now(),
      });
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        isOnline: false,
        isLoading: false,
        error: err.message || 'Unable to connect to ISL backend',
        latencyMs: null,
        lastChecked: Date.now(),
      }));
    }
  }, []);

  useEffect(() => {
    checkStatus();
    if (pollIntervalMs > 0) {
      const timer = setInterval(checkStatus, pollIntervalMs);
      return () => clearInterval(timer);
    }
  }, [checkStatus, pollIntervalMs]);

  return { ...state, refetch: checkStatus };
}

