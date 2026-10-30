import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { wsService } from '../../services/websocket';
import { historyService } from '../../services/history';
import { CameraDevice, RecognitionMode } from '../../types/translation';
import {
  Server,
  Camera,
  Volume2,
  Shield,
  Trash2,
  RefreshCw,
  Check,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { ConfirmationDialog } from '../common/ConfirmationDialog';

interface SettingsPanelProps {
  isOnline: boolean;
  latencyMs: number | null;
  devices: CameraDevice[];
  selectedDeviceId: string;
  isMockMode: boolean;
  onSwitchDevice: (id: string) => void;
  onToggleMockMode: () => void;
  onRefetchStatus: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOnline,
  latencyMs,
  devices,
  selectedDeviceId,
  isMockMode,
  onSwitchDevice,
  onToggleMockMode,
  onRefetchStatus,
}) => {
  const [apiUrl, setApiUrl] = useState(apiService.getBaseUrl());
  const [wsUrl, setWsUrl] = useState(wsService.getUrl());
  const [preferredMode, setPreferredMode] = useState<RecognitionMode>(() => {
    return (localStorage.getItem('isl_preferred_mode') as RecognitionMode) || 'STATIC';
  });
  const [speechRate, setSpeechRate] = useState<number>(() => {
    return Number(localStorage.getItem('isl_tts_rate')) || 0.95;
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleSaveEndpoints = (e: React.FormEvent) => {
    e.preventDefault();
    apiService.setBaseUrl(apiUrl);
    wsService.setUrl(wsUrl);
    localStorage.setItem('isl_preferred_mode', preferredMode);
    localStorage.setItem('isl_tts_rate', String(speechRate));

    setSavedSuccess(true);
    onRefetchStatus();
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetEndpoints = () => {
    const defaultApi = 'http://localhost:8000';
    const defaultWs = 'ws://localhost:8000/ws/predict';
    setApiUrl(defaultApi);
    setWsUrl(defaultWs);
    apiService.setBaseUrl(defaultApi);
    wsService.setUrl(defaultWs);
    onRefetchStatus();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 1. API & Backend Configuration */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-[#F0F2F3] space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D5E2C2] flex items-center justify-center text-[#252720]">
              <Server className="w-5 h-5 text-[#4D6431]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#252720]">
                Backend Service Configuration
              </h3>
              <p className="text-xs text-[#747873]">
                FastAPI REST and WebSocket inference endpoints
              </p>
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isOnline ? 'bg-[#E4F2D8] text-[#21431A]' : 'bg-[#FEE2E2] text-[#991B1B]'
            }`}
          >
            {isOnline
              ? latencyMs
                ? `Online (${latencyMs}ms)`
                : 'Online'
              : 'Disconnected'}
          </div>
        </div>

        <form onSubmit={handleSaveEndpoints} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#252720] mb-1.5">
              HTTP REST API Base URL
            </label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] text-sm text-[#252720] font-mono focus:bg-white focus:border-[#4D6431] focus:ring-2 focus:ring-[#D5E2C2] focus:outline-none transition"
              placeholder="http://localhost:8000"
            />
            <p className="text-[11px] text-[#9DA29B] mt-1">
              Targets /api/status, /api/classes, and /api/predict/frame
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#252720] mb-1.5">
              WebSocket Real-Time URL
            </label>
            <input
              type="text"
              value={wsUrl}
              onChange={(e) => setWsUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] text-sm text-[#252720] font-mono focus:bg-white focus:border-[#4D6431] focus:ring-2 focus:ring-[#D5E2C2] focus:outline-none transition"
              placeholder="ws://localhost:8000/ws/predict"
            />
            <p className="text-[11px] text-[#9DA29B] mt-1">
              Bi-directional low-latency landmark streaming endpoint
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleResetEndpoints}
              className="text-xs text-[#747873] hover:text-[#252720] underline font-medium"
            >
              Reset to Defaults
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onRefetchStatus}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-[#F0F2F3] text-[#252720] hover:bg-[#E4E7E9] transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Test Connection</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-full text-xs font-bold bg-[#252720] text-white hover:bg-[#3E4237] transition shadow-soft flex items-center gap-1.5"
              >
                {savedSuccess ? <Check className="w-3.5 h-3.5 text-[#D5E2C2]" /> : null}
                <span>{savedSuccess ? 'Saved' : 'Save Endpoints'}</span>
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* 2. Device & Recognition Preferences */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-[#F0F2F3] space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#B7C8FF] flex items-center justify-center text-[#1E3A8A]">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#252720]">
              Recognition & Device Preferences
            </h3>
            <p className="text-xs text-[#747873]">
              Default camera and prediction modes
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Default Mode */}
          <div>
            <label className="block text-xs font-bold text-[#252720] mb-1.5">
              Default Recognition Mode
            </label>
            <select
              value={preferredMode}
              onChange={(e) => {
                const val = e.target.value as RecognitionMode;
                setPreferredMode(val);
                localStorage.setItem('isl_preferred_mode', val);
              }}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] text-xs font-semibold text-[#252720] focus:ring-2 focus:ring-[#D5E2C2] focus:outline-none"
            >
              <option value="STATIC">Static Signs (114 Classes - Word Level)</option>
              <option value="DYNAMIC">Dynamic Gestures (97 Classes - Sentence Level)</option>
            </select>
          </div>

          {/* Camera Selection */}
          <div>
            <label className="block text-xs font-bold text-[#252720] mb-1.5">
              Preferred Camera Device
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => onSwitchDevice(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] text-xs font-semibold text-[#252720] focus:ring-2 focus:ring-[#D5E2C2] focus:outline-none"
            >
              {devices.length === 0 ? (
                <option value="">No Camera Detected</option>
              ) : (
                devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Camera ${d.deviceId.slice(0, 5)}`}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* TTS Speech Rate */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#252720] mb-2">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-[#747873]" />
              Text-To-Speech Speech Rate
            </span>
            <span className="font-mono text-[#4D6431]">{speechRate}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={speechRate}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSpeechRate(val);
              localStorage.setItem('isl_tts_rate', String(val));
            }}
            className="w-full accent-[#252720]"
          />
          <div className="flex items-center justify-between text-[10px] text-[#9DA29B] mt-1">
            <span>0.5x (Slow)</span>
            <span>1.0x (Normal)</span>
            <span>1.5x (Fast)</span>
          </div>
        </div>
      </section>

      {/* 3. Demo / Mock Mode & Storage */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-[#F0F2F3] space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFE17A] flex items-center justify-center text-[#78350F]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#252720]">
                Simulation & Storage Management
              </h3>
              <p className="text-xs text-[#747873]">
                Manage offline mock mode and local translation records
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#252720] block">
              Offline Demo / Simulation Mode
            </span>
            <p className="text-xs text-[#747873] mt-0.5">
              Simulates realistic landmark poses and inference results from official ISL vocabulary when backend is offline.
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleMockMode}
            className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition ${
              isMockMode
                ? 'bg-[#FFE17A] text-[#78350F]'
                : 'bg-white border border-[#E8EEDF] text-[#252720] hover:bg-[#F0F2F3]'
            }`}
          >
            {isMockMode ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-xs font-bold text-[#252720] block">
              Clear Local Translation History
            </span>
            <p className="text-xs text-[#747873]">
              Remove all saved translation sessions from browser storage.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="px-4 py-2 rounded-full text-xs font-bold bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FECACA] transition flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </section>

      {/* 4. Privacy & Data Handling Information */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-[#F0F2F3] space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#F0F2F3] flex items-center justify-center text-[#252720]">
            <Shield className="w-5 h-5 text-[#252720]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#252720]">
              Privacy & Frame Processing Notice
            </h3>
            <p className="text-xs text-[#747873]">
              Transparent information on video capture and landmark streaming
            </p>
          </div>
        </div>

        <div className="text-xs text-[#747873] leading-relaxed space-y-2 pt-2">
          <p>
            • <strong>Video Processing:</strong> Your webcam video stream is processed in real time. Video frames are never permanently stored on any server or database.
          </p>
          <p>
            • <strong>Landmark Extraction:</strong> When transmitting over WebSocket, only wrist-relative 128-dimensional mathematical coordinates (x, y, z normalized floats) are sent to the neural network for inference.
          </p>
          <p>
            • <strong>Local History:</strong> All saved translation sessions are stored strictly on your local device via your browser's local storage and can be cleared at any time.
          </p>
        </div>
      </section>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showClearConfirm}
        title="Clear All Translation History"
        description="Are you sure you want to permanently delete all translation records stored in your browser? This action cannot be undone."
        confirmLabel="Clear All"
        isDestructive={true}
        onConfirm={() => {
          historyService.clearHistory();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};

