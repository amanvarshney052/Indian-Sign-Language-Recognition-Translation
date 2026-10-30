import React from 'react';
import {
  formatConfidencePercent,
  getConfidenceStyle,
  BACKEND_CONFIDENCE_THRESHOLD,
} from '../../utils/confidence';

interface ConfidenceIndicatorProps {
  confidence: number;
  showThresholdMarker?: boolean;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidence,
  showThresholdMarker = true,
}) => {
  const percentage = Math.min(Math.max(confidence * 100, 0), 100);
  const style = getConfidenceStyle(confidence);
  const isAccepted = confidence >= BACKEND_CONFIDENCE_THRESHOLD;

  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[#747873]">Confidence Score</span>
        <div className="flex items-center gap-1.5">
          <span
            className={`font-mono font-bold text-xs px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}
          >
            {formatConfidencePercent(confidence)}
          </span>
          <span className="text-[10px] text-[#9DA29B]">
            ({isAccepted ? 'Accepted' : 'Below 65%'})
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-2.5 bg-[#F0F2F3] rounded-full overflow-hidden">
        {/* Fill bar */}
        <div
          className={`h-full rounded-full transition-all duration-300 ${style.bar}`}
          style={{ width: `${percentage}%` }}
        />

        {/* 65% threshold line indicator */}
        {showThresholdMarker && (
          <div
            title="Backend Acceptance Threshold (65%)"
            className="absolute top-0 bottom-0 w-0.5 bg-[#252720]/40 z-10"
            style={{ left: '65%' }}
          />
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-[#9DA29B] font-mono">
        <span>0%</span>
        <span className="font-semibold text-[#747873]">Threshold: 65%</span>
        <span>100%</span>
      </div>
    </div>
  );
};

