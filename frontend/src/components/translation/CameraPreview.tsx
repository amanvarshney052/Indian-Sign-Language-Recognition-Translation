import React from 'react';
import { Camera, CameraOff, AlertCircle, Scan, Sparkles } from 'lucide-react';
import { LandmarkOverlay } from './LandmarkOverlay';
import { HandDetectionIndicator } from './HandDetectionIndicator';
import { CameraControls } from './CameraControls';
import {
  CameraDevice,
  CameraPermissionState,
  DualHandLandmarks,
  HandStatus,
} from '../../types/translation';

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  permission: CameraPermissionState;
  devices: CameraDevice[];
  selectedDeviceId: string;
  error: string | null;
  handStatus: HandStatus;
  landmarks: DualHandLandmarks;
  isSessionActive: boolean;
  isProcessingFrame: boolean;
  isMockMode: boolean;
  isWsConnected?: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onSwitchDevice: (deviceId: string) => void;
  onCaptureFrame: () => void;
  onUploadImage: (file: File) => void;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  videoRef,
  isActive,
  permission,
  devices,
  selectedDeviceId,
  error,
  handStatus,
  landmarks,
  isSessionActive,
  isProcessingFrame,
  isMockMode,
  isWsConnected,
  onStartCamera,
  onStopCamera,
  onSwitchDevice,
  onCaptureFrame,
  onUploadImage,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-[#F0F2F3] space-y-4">
      {/* Top Bar inside Camera Panel */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isActive ? 'bg-[#84A45B] animate-pulse' : 'bg-[#9DA29B]'
            }`}
          />
          <span className="font-bold text-sm text-[#252720]">
            {isActive ? 'Live Video Feed' : 'Camera Inactive'}
          </span>
          {isActive && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E4F2D8] text-[#21431A] animate-pulse">
              ● Live Scanning {isWsConnected ? '(WebSocket)' : '(HTTP)'}
            </span>
          )}
          <span className="text-[11px] font-mono text-[#9DA29B]">
            640 × 480 px
          </span>
        </div>

        {/* Hand Detection Overlay Badges */}
        <HandDetectionIndicator handStatus={handStatus} />
      </div>

      {/* Video Viewport Container */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-[#1A1C16] rounded-2xl overflow-hidden flex items-center justify-center border border-[#E8EEDF]/60 shadow-inner group">
        {/* Real HTML5 Video element */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-contain ${
            isActive ? 'block' : 'hidden'
          }`}
        />

        {/* Real-time Landmark Canvas Overlay */}
        <LandmarkOverlay landmarks={landmarks} isActive={isActive || isMockMode} />

        {/* Scanning Laser Animation during Active Session */}
        {isActive && isSessionActive && (
          <div className="absolute inset-x-0 h-1 scanning-laser animate-scan pointer-events-none opacity-70 z-20" />
        )}

        {/* Target Reticle corners */}
        {isActive && (
          <div className="absolute inset-6 pointer-events-none border border-white/10 rounded-xl z-10">
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#D5E2C2]" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#D5E2C2]" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#D5E2C2]" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#D5E2C2]" />
          </div>
        )}

        {/* Placeholder when Camera is stopped */}
        {!isActive && (
          <div className="flex flex-col items-center justify-center p-6 text-center text-white/80 max-w-sm z-20">
            <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 text-[#D5E2C2]">
              <Camera className="w-8 h-8" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              Camera is currently stopped
            </h3>
            <p className="text-xs text-white/60 mb-5 leading-relaxed">
              Enable your webcam to start real-time landmark recognition, or upload an image frame for static classification.
            </p>

            <button
              type="button"
              onClick={onStartCamera}
              className="px-6 py-2.5 rounded-full bg-[#D5E2C2] text-[#252720] text-xs font-bold hover:bg-[#BFD3A3] transition shadow-md"
            >
              Start Webcam
            </button>
          </div>
        )}

        {/* Permission Denied Overlay */}
        {permission === 'denied' && (
          <div className="absolute inset-0 bg-[#1A1C16]/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-12 h-12 rounded-2xl bg-[#FEE2E2] text-[#991B1B] flex items-center justify-center mb-3">
              <CameraOff className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Camera Access Denied</h4>
            <p className="text-xs text-white/70 max-w-xs mt-1 mb-4">
              Please grant camera permissions in your browser address bar to use live video translation.
            </p>
            <button
              onClick={onStartCamera}
              className="px-4 py-2 rounded-full bg-white text-[#252720] text-xs font-bold hover:bg-[#F0F2F3] transition"
            >
              Retry Permission
            </button>
          </div>
        )}

        {/* Processing badge overlay */}
        {isProcessingFrame && (
          <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D5E2C2] animate-spin" />
            <span>Analyzing MediaPipe frame...</span>
          </div>
        )}
      </div>

      {/* Error notification if any */}
      {error && (
        <div className="p-3 rounded-2xl bg-[#FEE2E2] border border-[#FECACA] flex items-center gap-2.5 text-xs text-[#991B1B]">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
          <span>{error}</span>
        </div>
      )}

      {/* Bottom Camera & Snapshot Controls */}
      <CameraControls
        isActive={isActive}
        devices={devices}
        selectedDeviceId={selectedDeviceId}
        isProcessingFrame={isProcessingFrame}
        onStartCamera={onStartCamera}
        onStopCamera={onStopCamera}
        onSwitchDevice={onSwitchDevice}
        onCaptureFrame={onCaptureFrame}
        onUploadImage={onUploadImage}
      />
    </div>
  );
};

