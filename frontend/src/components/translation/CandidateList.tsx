import React from 'react';
import { PredictionCandidate } from '../../types/api';
import { formatSignLabel } from '../../utils/formatting';
import { formatConfidencePercent, getConfidenceStyle } from '../../utils/confidence';

interface CandidateListProps {
  candidates: PredictionCandidate[];
  topLabel?: string | null;
}

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  topLabel,
}) => {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF]/60 text-center">
        <p className="text-xs text-[#9DA29B]">No prediction candidates yet</p>
      </div>
    );
  }

  // Display top 4 candidates
  const displayCandidates = candidates.slice(0, 4);

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold text-[#747873] uppercase tracking-wider">
        Top Prediction Candidates
      </h4>
      <div className="space-y-1.5">
        {displayCandidates.map((cand, idx) => {
          const isTop = idx === 0 || cand.label === topLabel;
          const confStyle = getConfidenceStyle(cand.confidence);
          const percentVal = Math.round(cand.confidence * 100);

          return (
            <div
              key={`${cand.label}-${idx}`}
              className={`p-2.5 rounded-2xl transition flex items-center justify-between gap-3 text-xs ${
                isTop
                  ? 'bg-[#F5F8F0] border border-[#BFD3A3] font-semibold text-[#252720]'
                  : 'bg-white border border-[#F0F2F3] text-[#747873]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                    isTop ? 'bg-[#252720] text-white' : 'bg-[#F0F2F3] text-[#747873]'
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="truncate font-bold text-[#252720]">
                  {formatSignLabel(cand.label)}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="w-16 h-1.5 bg-[#F0F2F3] rounded-full overflow-hidden hidden sm:block">
                  <div
                    className={`h-full rounded-full ${confStyle.bar}`}
                    style={{ width: `${percentVal}%` }}
                  />
                </div>
                <span
                  className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded-md ${confStyle.bg} ${confStyle.text}`}
                >
                  {formatConfidencePercent(cand.confidence)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

