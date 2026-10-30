import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { TranslationHistoryItem } from '../../types/translation';
import { formatTimeAgo, formatSignLabel } from '../../utils/formatting';
import { formatConfidencePercent, getConfidenceStyle } from '../../utils/confidence';
import { Volume2, Copy, Check, ArrowRight, Clock } from 'lucide-react';

interface RecentTranslationsListProps {
  items: TranslationHistoryItem[];
  onSpeak?: (text: string) => void;
}

export const RecentTranslationsList: React.FC<RecentTranslationsListProps> = ({
  items,
  onSpeak,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const recentItems = items.slice(0, 4);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#F0F2F3]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm text-[#252720]">Recent Translations</h3>
          <p className="text-xs text-[#747873]">Latest recognized gestures & sentences</p>
        </div>
        <NavLink
          to="/history"
          className="text-xs font-semibold text-[#4D6431] hover:text-[#252720] flex items-center gap-1 transition"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </NavLink>
      </div>

      {recentItems.length === 0 ? (
        <div className="py-8 text-center bg-[#F7F8F4] rounded-2xl border border-dashed border-[#E8EEDF]">
          <Clock className="w-6 h-6 text-[#9DA29B] mx-auto mb-2" />
          <p className="text-xs font-semibold text-[#747873]">No translation sessions yet</p>
          <NavLink
            to="/translate"
            className="mt-3 inline-block px-4 py-1.5 rounded-full bg-[#252720] text-white text-xs font-medium"
          >
            Start Translating
          </NavLink>
        </div>
      ) : (
        <div className="space-y-3">
          {recentItems.map((item) => {
            const confStyle = getConfidenceStyle(item.averageConfidence);
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF]/60 flex items-center justify-between gap-3 transition hover:bg-[#F0F2F3]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.mode === 'STATIC'
                          ? 'bg-[#E4F2D8] text-[#21431A]'
                          : 'bg-[#E0EAFF] text-[#1E3A8A]'
                      }`}
                    >
                      {item.mode === 'STATIC' ? 'Static Sign' : 'Dynamic Sentence'}
                    </span>
                    <span className="text-[11px] text-[#9DA29B] font-medium">
                      {formatTimeAgo(item.timestamp)}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-bold ${confStyle.bg} ${confStyle.text}`}
                    >
                      {formatConfidencePercent(item.averageConfidence)}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#252720] truncate">
                    {formatSignLabel(item.text)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {onSpeak && (
                    <button
                      onClick={() => onSpeak(item.text)}
                      aria-label="Speak translated text"
                      title="Speak translated text"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[#747873] hover:text-[#252720] hover:bg-white transition"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleCopy(item.id, item.text)}
                    aria-label="Copy translated text"
                    title="Copy translated text"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#747873] hover:text-[#252720] hover:bg-white transition"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-[#4D6431]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

