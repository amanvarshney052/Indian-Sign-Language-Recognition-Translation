import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  GraduationCap,
  Scale,
  Sparkles,
  ArrowRight,
  MapPin,
  Smile,
  BookOpen,
} from 'lucide-react';

export const ISLResourcesCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-[#F0F2F3] flex flex-col justify-between space-y-6 h-full">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#747873]">
              National Standards & Culture
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-[#252720] mt-1">
            Indian Sign Language Ecosystem
          </h3>
        </div>
        <div className="w-9 h-9 rounded-2xl bg-[#FEF3C7] flex items-center justify-center text-[#92400E] shrink-0">
          <Landmark className="w-4 h-4 text-[#D97706]" />
        </div>
      </div>

      {/* 2. Top 3 Initiatives */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xl bg-[#E4F2D8] flex items-center justify-center text-[#21431A] mb-3">
              <Landmark className="w-4 h-4 text-[#4D6431]" />
            </div>
            <h4 className="text-sm font-bold text-[#252720]">ISLRTC Portal</h4>
            <p className="text-xs text-[#747873] mt-1 leading-relaxed">
              Standardized dictionary of 10,000+ certified signs by the Ministry of Social Justice.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#E8EEDF] text-[11px] font-semibold text-[#4D6431]">
            Standardized Corpus
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xl bg-[#E0EAFF] flex items-center justify-center text-[#1E3A8A] mb-3">
              <GraduationCap className="w-4 h-4 text-[#1E3A8A]" />
            </div>
            <h4 className="text-sm font-bold text-[#252720]">NCERT ISL Books</h4>
            <p className="text-xs text-[#747873] mt-1 leading-relaxed">
              Official textbook conversion into sign videos for deaf students from Class 1 to 12.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#E8EEDF] text-[11px] font-semibold text-[#1E3A8A]">
            Inclusive Education
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-xl bg-[#F3E8FF] flex items-center justify-center text-[#4A2D6E] mb-3">
              <Scale className="w-4 h-4 text-[#4A2D6E]" />
            </div>
            <h4 className="text-sm font-bold text-[#252720]">RPWD Act 2016</h4>
            <p className="text-xs text-[#747873] mt-1 leading-relaxed">
              Statutory mandate recognizing ISL in public broadcast, courts, and civil institutions.
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#E8EEDF] text-[11px] font-semibold text-[#4A2D6E]">
            Legal Framework
          </div>
        </div>
      </div>

      {/* 3. Cultural & Linguistic Insights Section (Matches Signing Guide's Bottom Section) */}
      <div className="p-4 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#252720]">
            Regional Dialects & Linguistic Nuance
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E4F2D8] text-[#21431A] font-semibold">
            Pan-India
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-white border border-[#E8EEDF] flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#FFE17A]/50 flex items-center justify-center text-[#78350F] shrink-0 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#B45309]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#252720] block">
                Regional Variations
              </span>
              <p className="text-[11px] text-[#747873] mt-0.5 leading-snug">
                Northern (Delhi/UP), Western (Mumbai), and Southern dialects share universal grammar with minor lexical accents.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white border border-[#E8EEDF] flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#D1B9E8]/50 flex items-center justify-center text-[#4A2D6E] shrink-0 mt-0.5">
              <Smile className="w-3.5 h-3.5 text-[#6B21A8]" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#252720] block">
                Non-Manual Features (NMF)
              </span>
              <p className="text-[11px] text-[#747873] mt-0.5 leading-snug">
                Eyebrow raise, head tilt, and mouthing transform statements into questions or alter sign intensity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Action Footer */}
      <div className="pt-2 border-t border-[#F0F2F3] flex items-center justify-between">
        <span className="text-xs text-[#747873]">
          Explore certified ISL vocabulary with 128-d AI models
        </span>
        <button
          onClick={() => navigate('/vocabulary')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#252720] hover:text-[#4D6431] transition"
        >
          <span>Open Lexicon Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
