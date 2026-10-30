import React, { useRef } from 'react';
import { Camera, CameraOff, RefreshCw, Upload, Camera as CameraIcon } from 'lucide-react';
import { CameraDevice } from '../../types/translation';

interface CameraControlsProps {
  isActive: boolean;
  devices: CameraDevice[];
  selectedDeviceId: string;
  isProcessingFrame: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onSwitchDevice: (deviceId: string) => void;
  onCaptureFrame: () => void;
  onUploadImage: (file: File) => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  isActive,
  devices,
  selectedDeviceId,
  isProcessingFrame,
  onStartCamera,
  onStopCamera,
  onSwitchDevice,
  onCaptureFrame,
  onUploadImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
      {/* Camera Power & Device Selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {!isActive ? (
          <button
            type="button"
            onClick={onStartCamera}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#252720] text-white text-xs sm:text-sm font-bold shadow-soft hover:bg-[#3E4237] transition"
          >
            <Camera className="w-4 h-4" />
            <span>Enable Camera</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onStopCamera}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FEE2E2] text-[#991B1B] text-xs sm:text-sm font-bold border border-[#FECACA] hover:bg-[#FECACA] transition"
          >
            <CameraOff className="w-4 h-4" />
            <span>Stop Camera</span>
          </button>
        )}

        {/* Device selector if multiple cameras detected */}
        {devices.length > 1 && (
          <select
            value={selectedDeviceId}
            onChange={(e) => onSwitchDevice(e.target.value)}
            className="px-3 py-2 rounded-full text-xs font-semibold bg-white border border-[#F0F2F3] text-[#252720] shadow-soft focus:ring-2 focus:ring-[#D5E2C2] focus:outline-none"
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Snapshot and File Upload Actions */}
      <div className="flex items-center gap-2">
        {isActive && (
          <button
            type="button"
            onClick={onCaptureFrame}
            disabled={isProcessingFrame}
            title="Send single video frame to /api/predict/frame"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#E4F2D8] text-[#21431A] text-xs font-bold border border-[#BFD3A3] hover:bg-[#D5E2C2] transition disabled:opacity-50"
          >
            <CameraIcon className="w-3.5 h-3.5" />
            <span>{isProcessingFrame ? 'Processing...' : 'Analyze Frame'}</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Upload image file to /api/predict/frame"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white text-[#252720] text-xs font-semibold border border-[#E8EEDF] hover:bg-[#F0F2F3] transition shadow-soft"
        >
          <Upload className="w-3.5 h-3.5 text-[#747873]" />
          <span>Upload Image</span>
        </button>
      </div>
    </div>
  );
};

