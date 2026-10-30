import React, { useState } from 'react';
import { TranslationHistoryItem } from '../../types/translation';
import {
  formatExactDateTime,
  formatTimeAgo,
  formatDuration,
  formatSignLabel,
} from '../../utils/formatting';
import { formatConfidencePercent, getConfidenceStyle } from '../../utils/confidence';
import {
  Volume2,
  Copy,
  Check,
  Trash2,
  Activity,
  Layers,
  Sparkles,
  Clock,
} from 'lucide-react';

interface TranslationHistoryTableProps {
  items: TranslationHistoryItem[];
  onDelete: (id: string) => void;
  onSpeak: (text: string) => void;
}

export const TranslationHistoryTable: React.FC<TranslationHistoryTableProps> = ({
  items,
  onDelete,
  onSpeak,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-3xl shadow-soft border border-[#F0F2F3] overflow-hidden">
      <div className="divide-y divide-[#F0F2F3]">
        {items.map((item) => {
          const isStatic = item.mode === 'STATIC';
          const confStyle = getConfidenceStyle(item.averageConfidence);

          return (
            <div
              key={item.id}
              className="p-5 sm:p-6 transition hover:bg-[#F7F8F4]/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Left Details */}
              <div className="space-y-2 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
                      isStatic
                        ? 'bg-[#E4F2D8] text-[#21431A]'
                        : 'bg-[#E0EAFF] text-[#1E3A8A]'
                    }`}
                  >
                    {isStatic ? (
                      <Activity className="w-3 h-3" />
                    ) : (
                      <Layers className="w-3 h-3" />
                    )}
                    <span>{isStatic ? 'Static Sign' : 'Dynamic Sentence'}</span>
                  </span>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold font-mono ${confStyle.bg} ${confStyle.text}`}
                  >
                    {formatConfidencePercent(item.averageConfidence)}
                  </span>

                  {item.source === 'demo' && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFE17A]/40 text-[#78350F]">
                      Demo
                    </span>
                  )}

                  <span
                    title={formatExactDateTime(item.timestamp)}
                    className="text-xs text-[#9DA29B] font-medium flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(item.timestamp)}</span>
                  </span>
                </div>

                {/* Recognized Text */}
                <h3 className="text-lg sm:text-xl font-extrabold text-[#252720] tracking-tight">
                  {formatSignLabel(item.text)}
                </h3>

                {/* Tokens and Session Duration */}
                <div className="flex items-center gap-4 text-xs text-[#747873] flex-wrap">
                  {item.tokens.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#252720]">
                        {item.tokens.length}
                      </span>
                      <span>{item.tokens.length === 1 ? 'token' : 'tokens'}</span>
                    </span>
                  )}
                  {item.durationSeconds !== undefined && item.durationSeconds > 0 && (
                    <span className="text-[#9DA29B]">
                      Duration: {formatDuration(item.durationSeconds)}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => onSpeak(item.text)}
                  title="Speak sentence"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#747873] hover:text-[#252720] hover:bg-[#F0F2F3] transition"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(item.id, item.text)}
                  title="Copy to clipboard"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#747873] hover:text-[#252720] hover:bg-[#F0F2F3] transition"
                >
                  {copiedId === item.id ? (
                    <Check className="w-4 h-4 text-[#4D6431]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  title="Delete record"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[#9DA29B] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

