import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Sun,
  Maximize2,
  Hand,
} from 'lucide-react';

export const ISLSigningGuideCard: React.FC = () => {
  const navigate = useNavigate();

  const commonSigns = [
    { name: 'HELLO', type: 'Static Sign', desc: 'Open palm raised near temple, waving gently' },
    { name: 'THANK YOU', type: 'Static Sign', desc: 'Flat hand touches chin and extends outward toward viewer' },
    { name: 'PLEASE / HELP', type: 'Static Sign', desc: 'Dominant palm rubs circular motion on chest' },
    { name: 'how can i help you', type: 'Dynamic Sentence', desc: 'Dual-hand open gesture transitioning to inward chest point' },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-[#F0F2F3] flex flex-col justify-between space-y-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#747873]">
              Accuracy & Camera Guide
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-[#252720] mt-1">
            Best Practices for Real-Time Translation
          </h3>
        </div>

        <button
          onClick={() => navigate('/translate')}
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#252720] text-white text-xs font-semibold hover:bg-[#3E4237] transition shrink-0"
        >
          <span>Open Camera Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3 Practical Tips with Clean Visual Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xl bg-[#FFE17A]/60 flex items-center justify-center text-[#78350F] mb-3">
              <Sun className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-[#252720]">Even Front Lighting</h4>
            <p className="text-xs text-[#747873] mt-1 leading-relaxed">
              Ensure your hands and face are well-lit. Avoid heavy backlights or dark shadows across palms.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#E8EEDF] text-[11px] font-semibold text-[#4D6431] flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Optimal landmark detection</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xl bg-[#D5E2C2] flex items-center justify-center text-[#21431A] mb-3">
              <Maximize2 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-[#252720]">Chest-Level Framing</h4>
            <p className="text-xs text-[#747873] mt-1 leading-relaxed">
              Position yourself 1.5 to 2.5 feet from the lens. Keep both hands visible in the signing box.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#E8EEDF] text-[11px] font-semibold text-[#4D6431] flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Dual-hand tracking active</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xl bg-[#B7C8FF] flex items-center justify-center text-[#1E3A8A] mb-3">
              <Hand className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-[#252720]">Hold Static Poses ~0.5s</h4>
            <p className="text-xs text-[#747873] mt-1 leading-relaxed">
              In Static mode, pause slightly for majority smoothing to confirm and speak the word.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#E8EEDF] text-[11px] font-semibold text-[#4D6431] flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Over 90% confidence score</span>
          </div>
        </div>
      </div>

      {/* Everyday Signs Quick Preview List */}
      <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#252720]">
            Common ISL Gestures in Lexicon
          </span>
          <button
            onClick={() => navigate('/vocabulary')}
            className="text-xs text-[#4D6431] font-bold hover:underline"
          >
            View all 211
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {commonSigns.map((sign, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/vocabulary?search=${encodeURIComponent(sign.name)}`)}
              className="p-3 rounded-xl bg-white border border-[#E8EEDF] flex items-start justify-between gap-3 cursor-pointer hover:border-[#84A45B] hover:shadow-soft transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-[#252720] tracking-wide font-mono">
                    {sign.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E4F2D8] text-[#21431A] font-semibold">
                    {sign.type}
                  </span>
                </div>
                <p className="text-[11px] text-[#747873] mt-1 leading-snug">
                  {sign.desc}
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#9DA29B] shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

