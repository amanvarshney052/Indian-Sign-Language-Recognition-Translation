import React from 'react';
import { RecognitionMode } from '../../types/translation';
import { Activity, Layers } from 'lucide-react';

interface ModeSelectorProps {
  mode: RecognitionMode;
  onModeChange: (newMode: RecognitionMode) => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  onModeChange,
  disabled = false,
}) => {
  return (
    <div className="bg-[#F0F2F3] p-1.5 rounded-3xl flex items-center gap-1.5 border border-[#E8EEDF]">
      {/* Static Mode Pill */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onModeChange('STATIC')}
        className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
          mode === 'STATIC'
            ? 'bg-[#252720] text-white shadow-card'
            : 'text-[#747873] hover:text-[#252720] hover:bg-white/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Activity className="w-4 h-4 shrink-0" />
        <div className="text-left">
          <span className="block leading-none">Static Mode</span>
          <span
            className={`text-[10px] block mt-0.5 font-normal ${
              mode === 'STATIC' ? 'text-[#D5E2C2]' : 'text-[#9DA29B]'
            }`}
          >
            114 Word Signs (128-d)
          </span>
        </div>
      </button>

      {/* Dynamic Mode Pill */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onModeChange('DYNAMIC')}
        className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
          mode === 'DYNAMIC'
            ? 'bg-[#252720] text-white shadow-card'
            : 'text-[#747873] hover:text-[#252720] hover:bg-white/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Layers className="w-4 h-4 shrink-0" />
        <div className="text-left">
          <span className="block leading-none">Dynamic Mode</span>
          <span
            className={`text-[10px] block mt-0.5 font-normal ${
              mode === 'DYNAMIC' ? 'text-[#B7C8FF]' : 'text-[#9DA29B]'
            }`}
          >
            97 Sentences (30 Frames)
          </span>
        </div>
      </button>
    </div>
  );
};

