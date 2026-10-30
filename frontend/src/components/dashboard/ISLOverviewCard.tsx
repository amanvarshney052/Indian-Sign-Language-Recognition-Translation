import React, { useState } from 'react';
import {
  Globe2,
  Users,
  BookOpen,
  Sparkles,
  Layers,
  ChevronRight,
  Award,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ISLOverviewCard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'facts' | 'linguistics' | 'corpus'>('facts');

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-soft border border-[#F0F2F3] space-y-6">
      {/* Header with Navigation Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#84A45B]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#747873]">
              Cultural & Linguistic Context
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-[#252720] mt-1">
            Indian Sign Language (ISL) at a Glance
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="inline-flex rounded-full bg-[#F7F8F4] p-1 border border-[#E8EEDF] self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('facts')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === 'facts'
                ? 'bg-[#252720] text-white shadow-sm'
                : 'text-[#747873] hover:text-[#252720]'
            }`}
          >
            Demographics
          </button>
          <button
            onClick={() => setActiveTab('linguistics')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === 'linguistics'
                ? 'bg-[#252720] text-white shadow-sm'
                : 'text-[#747873] hover:text-[#252720]'
            }`}
          >
            Linguistics
          </button>
          <button
            onClick={() => setActiveTab('corpus')}
            className={`px-3.5 py-1.5 rounded-full transition-all ${
              activeTab === 'corpus'
                ? 'bg-[#252720] text-white shadow-sm'
                : 'text-[#747873] hover:text-[#252720]'
            }`}
          >
            Dataset & AI
          </button>
        </div>
      </div>

      {/* Tab 1: Key Statistics & Demographics */}
      {activeTab === 'facts' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Mini Stat Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF]">
              <div className="flex items-center gap-1.5 text-xs text-[#747873] font-medium">
                <Users className="w-3.5 h-3.5 text-[#4D6431]" />
                <span>Deaf Population</span>
              </div>
              <p className="text-xl font-extrabold text-[#252720] mt-1 font-mono">
                ~63 Million
              </p>
              <p className="text-[11px] text-[#747873] mt-0.5">Hearing impaired in India</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF]">
              <div className="flex items-center gap-1.5 text-xs text-[#747873] font-medium">
                <BookOpen className="w-3.5 h-3.5 text-[#1E3A8A]" />
                <span>Standard Lexicon</span>
              </div>
              <p className="text-xl font-extrabold text-[#252720] mt-1 font-mono">
                10,000+
              </p>
              <p className="text-[11px] text-[#747873] mt-0.5">ISLRTC dictionary signs</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF]">
              <div className="flex items-center gap-1.5 text-xs text-[#747873] font-medium">
                <Layers className="w-3.5 h-3.5 text-[#78350F]" />
                <span>Syntax Order</span>
              </div>
              <p className="text-xl font-extrabold text-[#252720] mt-1 font-mono">
                SOV
              </p>
              <p className="text-[11px] text-[#747873] mt-0.5">Subject-Object-Verb</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF]">
              <div className="flex items-center gap-1.5 text-xs text-[#747873] font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#4A2D6E]" />
                <span>Alphabet Type</span>
              </div>
              <p className="text-xl font-extrabold text-[#252720] mt-1 font-mono">
                Dual-Hand
              </p>
              <p className="text-[11px] text-[#747873] mt-0.5">Two-handed manual system</p>
            </div>
          </div>

          {/* Educational Callout Box */}
          <div className="p-4 rounded-2xl bg-[#F0F5E9] border border-[#D5E2C2] flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-soft">
              <Lightbulb className="w-5 h-5 text-[#4D6431]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#21431A]">
                A Complete, Natural Language
              </h4>
              <p className="text-xs text-[#4D6431] mt-0.5 leading-relaxed">
                Indian Sign Language is neither a visual translation of Hindi nor English. It is an autonomous language with its own rich grammar, morphological spatial inflection, and two-handed manual fingerspelling.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Linguistic Architecture */}
      {activeTab === 'linguistics' && (
        <div className="space-y-4 animate-fadeIn">
          <p className="text-xs text-[#747873] leading-relaxed">
            Every sign in ISL is articulated through five distinct phonological parameters. Missing or misorienting one alters the complete meaning:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#252720]">1. Handshape (Hasta Mudra)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D5E2C2] text-[#252720] font-semibold">
                  21 Joints
                </span>
              </div>
              <p className="text-[#747873]">
                Specific finger flexion, fist, and open-palm formations across dual hands.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#252720]">2. Spatial Location (Sthana)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B7C8FF] text-[#1E3A8A] font-semibold">
                  3D Coordinates
                </span>
              </div>
              <p className="text-[#747873]">
                Articulated relative to the forehead, chin, chest, or neutral torso space.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#252720]">3. Movement Trajectory (Gati)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFE17A] text-[#78350F] font-semibold">
                  30 Frames
                </span>
              </div>
              <p className="text-[#747873]">
                Linear, circular, oscillating, or repeating strokes captured by our BiLSTM.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#252720]">4. Palm Orientation</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D1B9E8] text-[#4A2D6E] font-semibold">
                  Scale Normal
                </span>
              </div>
              <p className="text-[#747873]">
                Facing inward toward the chest, outward toward the viewer, or facing opposite hands.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Dataset Benchmark & AI Model Details */}
      {activeTab === 'corpus' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF]">
              <span className="text-[10px] uppercase font-bold text-[#747873] tracking-wider block">
                Static Word-Level Dataset
              </span>
              <p className="text-base font-extrabold text-[#252720] mt-1">
                ISL-CSLRT Word Corpus
              </p>
              <div className="mt-2 space-y-1 text-[#747873]">
                <div className="flex justify-between">
                  <span>Total Classes:</span>
                  <strong className="text-[#252720]">114 Words</strong>
                </div>
                <div className="flex justify-between">
                  <span>Frame Samples:</span>
                  <strong className="text-[#252720]">1,036 Images</strong>
                </div>
                <div className="flex justify-between">
                  <span>Architecture:</span>
                  <strong className="text-[#252720]">Dense MLP (256-128-64)</strong>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF]">
              <span className="text-[10px] uppercase font-bold text-[#747873] tracking-wider block">
                Dynamic Sentence Dataset
              </span>
              <p className="text-base font-extrabold text-[#252720] mt-1">
                Continuous Gesture Corpus
              </p>
              <div className="mt-2 space-y-1 text-[#747873]">
                <div className="flex justify-between">
                  <span>Total Classes:</span>
                  <strong className="text-[#252720]">97 Sentences</strong>
                </div>
                <div className="flex justify-between">
                  <span>Video Frames:</span>
                  <strong className="text-[#252720]">18,863 Frames</strong>
                </div>
                <div className="flex justify-between">
                  <span>Architecture:</span>
                  <strong className="text-[#252720]">BiLSTM (128) + LSTM (96)</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#747873]">
              Full feature vector: <strong>63 (Left) + 63 (Right) + 2 (Flags) = 128-d</strong>
            </span>
            <button
              onClick={() => navigate('/vocabulary')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#252720] hover:text-[#4D6431] transition"
            >
              <span>Explore All 211 Classes</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
