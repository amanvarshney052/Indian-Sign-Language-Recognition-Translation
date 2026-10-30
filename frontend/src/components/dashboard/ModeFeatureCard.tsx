import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, ArrowRight, Sparkles, Layers, Activity } from 'lucide-react';

export const ModeFeatureCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Big Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#D5E2C2]/40 via-[#F7F8F4] to-[#B7C8FF]/30 p-7 sm:p-8 border border-[#E8EEDF] shadow-card">
        {/* Subtle Decorative Geometric Shapes */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 rounded-full bg-[#D5E2C2]/30 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-8 w-44 h-44 rounded-full bg-[#B7C8FF]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="max-w-md">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white text-[#4D6431] shadow-soft mb-3 border border-[#E8EEDF]">
              <Sparkles className="w-3.5 h-3.5 text-[#84A45B]" />
              Dual-Hand Landmark AI Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#252720] tracking-tight leading-tight">
              Real-Time ISL Translation Studio
            </h2>
            <p className="mt-2 text-sm text-[#747873] leading-relaxed">
              Translate Indian Sign Language in real time through your webcam or uploaded snapshots. Powered by wrist-relative 128-dimensional dual-hand normalization.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/translate')}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#252720] text-white text-sm font-bold shadow-md hover:bg-[#3E4237] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Video className="w-4 h-4" />
                <span>Launch Live Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/vocabulary')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-[#252720] text-sm font-semibold border border-[#E8EEDF] shadow-soft hover:bg-[#F0F2F3] transition"
              >
                <span>Browse 211 Classes</span>
              </button>
            </div>
          </div>

          {/* Visual Landmark Skeletal Hand Preview */}
          <div className="relative w-full sm:w-48 h-44 bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E8EEDF] p-3 flex flex-col items-center justify-center shadow-soft">
            <svg
              className="w-full h-full text-[#4D6431]"
              viewBox="0 0 160 140"
              fill="none"
              stroke="currentColor"
            >
              {/* Palm / Wrist */}
              <circle cx="80" cy="115" r="4.5" fill="#252720" stroke="#252720" />
              <line x1="80" y1="115" x2="55" y2="90" stroke="#84A45B" strokeWidth="2" />
              <line x1="80" y1="115" x2="68" y2="70" stroke="#84A45B" strokeWidth="2" />
              <line x1="80" y1="115" x2="80" y2="65" stroke="#84A45B" strokeWidth="2" />
              <line x1="80" y1="115" x2="94" y2="70" stroke="#84A45B" strokeWidth="2" />
              <line x1="80" y1="115" x2="108" y2="80" stroke="#84A45B" strokeWidth="2" />

              {/* Thumb */}
              <circle cx="55" cy="90" r="3.5" fill="#D5E2C2" stroke="#4D6431" strokeWidth="1.5" />
              <line x1="55" y1="90" x2="40" y2="75" stroke="#84A45B" strokeWidth="2" />
              <circle cx="40" cy="75" r="3.5" fill="#D5E2C2" stroke="#4D6431" strokeWidth="1.5" />
              <line x1="40" y1="75" x2="30" y2="60" stroke="#84A45B" strokeWidth="2" />
              <circle cx="30" cy="60" r="4" fill="#B7C8FF" stroke="#252720" strokeWidth="1.5" />

              {/* Index */}
              <circle cx="68" cy="70" r="3.5" fill="#D5E2C2" stroke="#4D6431" strokeWidth="1.5" />
              <line x1="68" y1="70" x2="64" y2="45" stroke="#84A45B" strokeWidth="2" />
              <circle cx="64" cy="45" r="3.5" fill="#D5E2C2" stroke="#4D6431" strokeWidth="1.5" />
              <line x1="64" y1="45" x2="60" y2="25" stroke="#84A45B" strokeWidth="2" />
              <circle cx="60" cy="25" r="4" fill="#FFE17A" stroke="#252720" strokeWidth="1.5" />

              {/* Middle */}
              <circle cx="80" cy="65" r="3.5" fill="#D5E2C2" stroke="#4D6431" strokeWidth="1.5" />
              <line x1="80" y1="65" x2="80" y2="40" stroke="#84A45B" strokeWidth="2" />
              <circle cx="80" cy="40" r="3.5" fill="#D5E2C2" stroke="#4D6431" strokeWidth="1.5" />
              <line x1="80" y1="40" x2="80" y2="18" stroke="#84A45B" strokeWidth="2" />
              <circle cx="80" cy="18" r="4" fill="#D5E2C2" stroke="#252720" strokeWidth="1.5" />

              {/* Ring */}
              <circle cx="94" cy="70" r="3.5" fill="#D5E2C2" stroke="#4D6431" strokeWidth="1.5" />
              <line x1="94" y1="70" x2="98" y2="46" stroke="#84A45B" strokeWidth="2" />
              <circle cx="98" cy="46" r="3.5" fill="#D5E2C2" stroke="#4D6431" strokeWidth="1.5" />
              <line x1="98" y1="46" x2="100" y2="28" stroke="#84A45B" strokeWidth="2" />
              <circle cx="100" cy="28" r="4" fill="#D1B9E8" stroke="#252720" strokeWidth="1.5" />

              {/* Pinky */}
              <circle cx="108" cy="80" r="3.5" fill="#D5E2C2" stroke="#4D6431" strokeWidth="1.5" />
              <line x1="108" y1="80" x2="116" y2="60" stroke="#84A45B" strokeWidth="2" />
              <circle cx="116" cy="60" r="3.5" fill="#D5E2C2" stroke="#4D6431" strokeWidth="1.5" />
              <line x1="116" y1="60" x2="122" y2="44" stroke="#84A45B" strokeWidth="2" />
              <circle cx="122" cy="44" r="4" fill="#F1B6B9" stroke="#252720" strokeWidth="1.5" />
            </svg>
            <span className="text-[10px] font-mono font-semibold text-[#747873] mt-1">
              21 Landmarks × 2 Hands
            </span>
          </div>
        </div>
      </div>

      {/* Two Recognition Mode Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Static Mode Card */}
        <div
          onClick={() => navigate('/translate?mode=STATIC')}
          className="bg-white rounded-3xl p-6 shadow-soft border border-[#F0F2F3] cursor-pointer hover:shadow-card hover:border-[#D5E2C2] transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#D5E2C2] flex items-center justify-center text-[#252720] shadow-sm group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 text-[#252720]" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E4F2D8] text-[#21431A]">
              114 Word Signs
            </span>
          </div>

          <h3 className="text-lg font-bold text-[#252720] mt-4 group-hover:text-[#4D6431] transition">
            Static Signs Mode
          </h3>
          <p className="mt-1.5 text-xs text-[#747873] leading-relaxed">
            Recognize isolated word-level signs from single video frames using a 128-dimensional normalized feature vector.
          </p>

          <div className="mt-4 pt-3 border-t border-[#F0F2F3] flex items-center justify-between text-xs font-semibold text-[#252720]">
            <span>Fast Frame Classification</span>
            <ArrowRight className="w-4 h-4 text-[#747873] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Dynamic Mode Card */}
        <div
          onClick={() => navigate('/translate?mode=DYNAMIC')}
          className="bg-white rounded-3xl p-6 shadow-soft border border-[#F0F2F3] cursor-pointer hover:shadow-card hover:border-[#B7C8FF] transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#B7C8FF] flex items-center justify-center text-[#1E3A8A] shadow-sm group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6 text-[#1E3A8A]" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E0EAFF] text-[#1E3A8A]">
              97 Sentences
            </span>
          </div>

          <h3 className="text-lg font-bold text-[#252720] mt-4 group-hover:text-[#1E3A8A] transition">
            Dynamic Sentences Mode
          </h3>
          <p className="mt-1.5 text-xs text-[#747873] leading-relaxed">
            Recognize continuous gestures and multi-word phrases evaluated over a rolling 30-frame sequence buffer.
          </p>

          <div className="mt-4 pt-3 border-t border-[#F0F2F3] flex items-center justify-between text-xs font-semibold text-[#252720]">
            <span>Rolling 30-Frame BiLSTM</span>
            <ArrowRight className="w-4 h-4 text-[#747873] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

