import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  GraduationCap,
  Scale,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const ISLResourcesCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#F0F2F3] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
            <h3 className="font-bold text-sm text-[#252720]">
              National Initiatives & Standards
            </h3>
          </div>
          <p className="text-xs text-[#747873] mt-0.5">
            Key government & educational frameworks empowering ISL
          </p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-[#92400E]">
          <Landmark className="w-4 h-4 text-[#D97706]" />
        </div>
      </div>

      {/* 3 Initiatives Compact List */}
      <div className="space-y-2.5">
        <div className="p-3 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#E4F2D8] flex items-center justify-center text-[#21431A] shrink-0 mt-0.5">
            <Landmark className="w-3.5 h-3.5 text-[#4D6431]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-[#252720]">
                ISLRTC Standardized Dictionary
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#4D6431] border border-[#BFD3A3]">
                10k+ Terms
              </span>
            </div>
            <p className="text-[11px] text-[#747873] mt-0.5 leading-snug">
              Indian Sign Language Research & Training Centre standardization across academic and civic sectors.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#E0EAFF] flex items-center justify-center text-[#1E3A8A] shrink-0 mt-0.5">
            <GraduationCap className="w-3.5 h-3.5 text-[#1E3A8A]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-[#252720]">
                NCERT Digital ISL Curriculum
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#1E3A8A] border border-[#B7C8FF]">
                Class 1–12
              </span>
            </div>
            <p className="text-[11px] text-[#747873] mt-0.5 leading-snug">
              Official textbook conversion into sign language videos to ensure inclusive education for deaf students.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#F3E8FF] flex items-center justify-center text-[#4A2D6E] shrink-0 mt-0.5">
            <Scale className="w-3.5 h-3.5 text-[#4A2D6E]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-bold text-[#252720]">
                RPWD Act 2016 Recognition
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-[#4A2D6E] border border-[#D1B9E8]">
                Statutory
              </span>
            </div>
            <p className="text-[11px] text-[#747873] mt-0.5 leading-snug">
              Mandates accessible visual communication across public media, courts, and civil institutions in India.
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-[#F0F2F3] flex items-center justify-between">
        <span className="text-[11px] text-[#747873]">
          Empowering accessibility with AI
        </span>
        <button
          onClick={() => navigate('/vocabulary')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4D6431] hover:text-[#252720] transition"
        >
          <span>Explore 211 Vocabulary</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
