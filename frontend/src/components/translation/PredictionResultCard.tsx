import React from 'react';
import { RecognitionMode } from '../../types/translation';
import { PredictionCandidate } from '../../types/api';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { CandidateList } from './CandidateList';
import { formatSignLabel, formatTimeAgo } from '../../utils/formatting';
import { BACKEND_CONFIDENCE_THRESHOLD } from '../../utils/confidence';
import { Sparkles, Layers, Activity, AlertCircle } from 'lucide-react';

interface PredictionResultCardProps {
  mode: RecognitionMode;
  currentPrediction: string | null;
  rawPrediction: string | null;
  confidence: number;
  candidates: PredictionCandidate[];
  bufferFill: number;
  lastUpdateTime: number | null;
  isMockMode: boolean;
}

export const PredictionResultCard: React.FC<PredictionResultCardProps> = ({
  mode,
  currentPrediction,
  rawPrediction,
  confidence,
  candidates,
  bufferFill,
  lastUpdateTime,
  isMockMode,
}) => {
  const isAccepted = confidence >= BACKEND_CONFIDENCE_THRESHOLD;
  const displayText = currentPrediction || rawPrediction;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#F0F2F3] space-y-5">
      {/* Header: Mode badge, buffer indicator & last update */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
              mode === 'STATIC'
                ? 'bg-[#E4F2D8] text-[#21431A]'
                : 'bg-[#E0EAFF] text-[#1E3A8A]'
            }`}
          >
            {mode === 'STATIC' ? (
              <>
                <Activity className="w-3.5 h-3.5" />
                <span>Static Word Recognition</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5" />
                <span>Dynamic Gesture Sequence</span>
              </>
            )}
          </span>

          {isMockMode && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFE17A] text-[#78350F]">
              Simulated
            </span>
          )}
        </div>

        {lastUpdateTime && (
          <span className="text-[11px] text-[#9DA29B] font-medium">
            Updated {formatTimeAgo(lastUpdateTime)}
          </span>
        )}
      </div>

      {/* Dynamic Mode Buffer Bar */}
      {mode === 'DYNAMIC' && (
        <div className="p-3 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF]/80">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-[#747873]">Temporal Sequence Buffer</span>
            <span className="font-mono text-[#252720]">{bufferFill} / 30 frames</span>
          </div>
          <div className="w-full h-2 bg-[#E8EEDF] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1E3A8A] rounded-full transition-all duration-200"
              style={{ width: `${Math.min((bufferFill / 30) * 100, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-[#9DA29B] mt-1.5">
            Requires 30 continuous normalized landmark frames for dynamic BiLSTM inference
          </p>
        </div>
      )}

      {/* Primary Recognition Result Box */}
      <div
        className={`p-6 rounded-3xl transition-all duration-200 text-center ${
          displayText
            ? isAccepted
              ? 'bg-[#F5F8F0] border-2 border-[#BFD3A3]'
              : 'bg-[#FEF3C7]/40 border-2 border-[#FDE68A]'
            : 'bg-[#F7F8F4] border border-[#E8EEDF]'
        }`}
      >
        <span className="text-xs font-semibold text-[#747873] uppercase tracking-wider block mb-1">
          {mode === 'STATIC' ? 'Recognized Word Sign' : 'Recognized Sentence'}
        </span>

        {displayText ? (
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#252720] tracking-tight leading-tight my-2">
              {formatSignLabel(displayText)}
            </h2>
            {!isAccepted && (
              <div className="inline-flex items-center gap-1.5 text-xs text-[#78350F] font-semibold mt-1 bg-[#FEF3C7] px-3 py-1 rounded-full">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Calibrating ({Math.round(confidence * 100)}% - Hold steady to confirm)</span>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4">
            <p className="text-lg font-bold text-[#9DA29B]">Waiting for sign gesture...</p>
            <p className="text-xs text-[#9DA29B] mt-1">
              Position both hands within webcam view
            </p>
          </div>
        )}
      </div>

      {/* Confidence Indicator */}
      <ConfidenceIndicator confidence={confidence} />

      {/* Top Candidates List */}
      <CandidateList candidates={candidates} topLabel={currentPrediction} />
    </div>
  );
};

