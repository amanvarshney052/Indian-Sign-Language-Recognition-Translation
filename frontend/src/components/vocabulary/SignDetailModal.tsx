import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VocabularyItem } from '../../types/vocabulary';
import { formatSignLabel } from '../../utils/formatting';
import {
  X,
  Activity,
  Layers,
  Hand,
  VideoOff,
  Video,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface SignDetailModalProps {
  item: VocabularyItem | null;
  onClose: () => void;
}

export const SignDetailModal: React.FC<SignDetailModalProps> = ({ item, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && item) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  const isStatic = item.type === 'static';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252720]/30 backdrop-blur-sm animate-fadeIn"
    >
      <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#F0F2F3] transform transition-all animate-scaleUp max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                isStatic
                  ? 'bg-[#E4F2D8] text-[#21431A]'
                  : 'bg-[#E0EAFF] text-[#1E3A8A]'
              }`}
            >
              {isStatic ? <Activity className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
              <span>{isStatic ? 'Static Word Sign' : 'Dynamic Sentence Gesture'}</span>
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#F0F2F3] text-[#747873]">
              {item.category}
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-full text-[#747873] hover:text-[#252720] hover:bg-[#F0F2F3] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#252720] mt-3">
          {formatSignLabel(item.name)}
        </h2>

        {/* Visual Asset Availability Notice */}
        <div className="mt-4 p-4 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] flex items-center gap-3 text-xs text-[#747873]">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#9DA29B] shrink-0 border border-[#E8EEDF]">
            <VideoOff className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-[#252720] block">
              Reference Video Not Stored
            </span>
            <span>
              Official video demonstration asset is not packaged. The system performs recognition directly from MediaPipe dual-hand landmark coordinates.
            </span>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="mt-5 space-y-3">
          <h4 className="text-xs font-bold text-[#747873] uppercase tracking-wider">
            Inference Specifications
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF]">
              <span className="text-[#747873] block mb-1">Feature Dimension</span>
              <strong className="text-[#252720] text-sm">128 Normalized Floats</strong>
              <p className="text-[11px] text-[#9DA29B] mt-0.5">
                63 Left + 63 Right + 2 Presence Flags
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF]">
              <span className="text-[#747873] block mb-1">Classifier Model</span>
              <strong className="text-[#252720] text-sm">
                {isStatic ? 'Dense MLP (256-128-64)' : 'BiLSTM (128 - LSTM 96)'}
              </strong>
              <p className="text-[11px] text-[#9DA29B] mt-0.5">
                {isStatic ? 'Single frame inference' : '30-frame rolling sequence'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF]">
              <span className="text-[#747873] block mb-1">Hand Configuration</span>
              <strong className="text-[#252720] text-sm">
                {item.handDominance === 'two-hand' ? 'Two Hands Required' : 'Single or Dual Hand'}
              </strong>
              <p className="text-[11px] text-[#9DA29B] mt-0.5">Wrist-relative scale invariant</p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF]">
              <span className="text-[#747873] block mb-1">Smoothing & Filter</span>
              <strong className="text-[#252720] text-sm">≥65% Confidence</strong>
              <p className="text-[11px] text-[#9DA29B] mt-0.5">5-frame majority voting filter</p>
            </div>
          </div>
        </div>

        {/* Practice CTA */}
        <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-[#F0F2F3]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-[#252720] bg-[#F0F2F3] hover:bg-[#E4E7E9] transition"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(`/translate?mode=${isStatic ? 'STATIC' : 'DYNAMIC'}`);
            }}
            className="px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#252720] hover:bg-[#3E4237] transition shadow-soft flex items-center gap-2"
          >
            <Video className="w-4 h-4" />
            <span>Practice in Live Studio</span>
          </button>
        </div>
      </div>
    </div>
  );
};

