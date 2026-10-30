import React from 'react';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Sparkles,
  Clock,
} from 'lucide-react';
import { formatDuration } from '../../utils/formatting';

interface SessionControlsProps {
  isSessionActive: boolean;
  isPaused: boolean;
  sessionDuration: number;
  bufferFill: number;
  onStartSession: () => void;
  onPauseSession: () => void;
  onResumeSession: () => void;
  onEndSession: () => void;
  onResetBuffer: () => void;
  disabled?: boolean;
}

export const SessionControls: React.FC<SessionControlsProps> = ({
  isSessionActive,
  isPaused,
  sessionDuration,
  bufferFill,
  onStartSession,
  onPauseSession,
  onResumeSession,
  onEndSession,
  onResetBuffer,
  disabled = false,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-soft border border-[#F0F2F3] flex flex-wrap items-center justify-between gap-4">
      {/* Session Timer & Status */}
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            isSessionActive
              ? isPaused
                ? 'bg-[#FEF3C7] text-[#78350F]'
                : 'bg-[#E4F2D8] text-[#21431A]'
              : 'bg-[#F0F2F3] text-[#747873]'
          }`}
        >
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#747873]">
              {isSessionActive
                ? isPaused
                  ? 'Session Paused'
                  : 'Active Session'
                : 'Session Idle'}
            </span>
            {isSessionActive && !isPaused && (
              <span className="w-2 h-2 rounded-full bg-[#4D6431] animate-ping" />
            )}
          </div>
          <p className="text-lg font-mono font-bold text-[#252720]">
            {formatDuration(sessionDuration)}
          </p>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {!isSessionActive ? (
          <button
            type="button"
            disabled={disabled}
            onClick={onStartSession}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#252720] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#3E4237] hover:scale-105 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Session</span>
          </button>
        ) : (
          <>
            {isPaused ? (
              <button
                type="button"
                onClick={onResumeSession}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E4F2D8] text-[#21431A] text-xs font-bold border border-[#BFD3A3] hover:bg-[#D5E2C2] transition"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onPauseSession}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FEF3C7] text-[#78350F] text-xs font-bold border border-[#FDE68A] hover:bg-[#FDE68A] transition"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </button>
            )}

            <button
              type="button"
              onClick={onResetBuffer}
              title="Reset rolling sequence frame buffer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#F0F2F3] text-[#252720] text-xs font-semibold hover:bg-[#E4E7E9] transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Buffer</span>
            </button>

            <button
              type="button"
              onClick={onEndSession}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FEE2E2] text-[#991B1B] text-xs font-bold border border-[#FECACA] hover:bg-[#FECACA] transition"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>End & Save</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

