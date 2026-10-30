import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/dashboard/StatCard';
import { ModeFeatureCard } from '../components/dashboard/ModeFeatureCard';
import { BackendStatusCard } from '../components/dashboard/BackendStatusCard';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { RecentTranslationsList } from '../components/dashboard/RecentTranslationsList';
import { ISLOverviewCard } from '../components/dashboard/ISLOverviewCard';
import { ISLSigningGuideCard } from '../components/dashboard/ISLSigningGuideCard';
import { ISLResourcesCard } from '../components/dashboard/ISLResourcesCard';
import { useBackendStatus } from '../hooks/useBackendStatus';
import { historyService } from '../services/history';
import { SessionStatistics, TranslationHistoryItem } from '../types/translation';
import {
  Video,
  BookOpen,
  Sparkles,
  Layers,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    isOnline,
    statusData,
    staticModelLoaded,
    dynamicModelLoaded,
    latencyMs,
    refetch,
  } = useBackendStatus(15000);

  const [stats, setStats] = useState<SessionStatistics>(() => historyService.getStatistics());
  const [historyItems, setHistoryItems] = useState<TranslationHistoryItem[]>(() =>
    historyService.getAllHistory()
  );

  useEffect(() => {
    setStats(historyService.getStatistics());
    setHistoryItems(historyService.getAllHistory());
  }, []);

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const isModelReady = staticModelLoaded || dynamicModelLoaded;
  const lastSession = historyItems.length > 0 ? historyItems[0] : null;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white rounded-3xl p-7 sm:p-9 shadow-soft border border-[#F0F2F3]">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#252720]">
              {getGreeting()}, welcome to ISL Bridge
            </h1>

            {/* AI Ready Badge (only when backend models are loaded) */}
            {isOnline && isModelReady && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E4F2D8] text-[#21431A] border border-[#BFD3A3] shadow-soft">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4D6431]" />
                <span>AI Recognition Ready</span>
              </span>
            )}
          </div>

          <p className="text-base sm:text-lg text-[#747873] leading-relaxed">
            Turn Indian Sign Language into words, one gesture at a time.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/translate')}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#252720] text-white text-sm font-bold shadow-md hover:bg-[#3E4237] hover:scale-105 active:scale-95 transition"
            >
              <Video className="w-4 h-4" />
              <span>Start Live Translation</span>
            </button>

            <button
              onClick={() => navigate('/vocabulary')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#F0F2F3] text-[#252720] text-sm font-semibold hover:bg-[#E4E7E9] transition"
            >
              <BookOpen className="w-4 h-4 text-[#747873]" />
              <span>Explore ISL Vocabulary</span>
            </button>
          </div>
        </div>

        {/* Quick Summary Pill for classes */}
        <div className="flex sm:flex-col items-center justify-between gap-3 p-4 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF] shrink-0">
          <div className="text-left sm:text-center">
            <span className="text-[11px] font-semibold text-[#747873] block uppercase tracking-wider">
              Supported Lexicon
            </span>
            <span className="text-2xl font-extrabold text-[#252720] font-mono">
              211 Classes
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#4D6431]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dual-Hand 128-d</span>
          </div>
        </div>
      </div>

      {/* 2. 4 Compact Pastel Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          icon={<Activity className="w-7 h-7" />}
          value={stats.wordsRecognized}
          label="Words Recognized"
          sublabel="Static 114 class lexicon"
          pastelBg="bg-[#D5E2C2]"
          iconColor="text-[#252720]"
        />

        <StatCard
          icon={<Layers className="w-7 h-7" />}
          value={stats.sentencesTranslated}
          label="Sentences Translated"
          sublabel="Dynamic BiLSTM sequences"
          pastelBg="bg-[#B7C8FF]"
          iconColor="text-[#1E3A8A]"
        />

        <StatCard
          icon={<Clock className="w-7 h-7" />}
          value={stats.sessionCount}
          label="Translation Sessions"
          sublabel="Persisted translation runs"
          pastelBg="bg-[#D1B9E8]"
          iconColor="text-[#4A2D6E]"
        />

        <StatCard
          icon={<Sparkles className="w-7 h-7" />}
          value="2 Modes"
          label="Recognition Engines"
          sublabel="Static (MLP) + Dynamic (LSTM)"
          pastelBg="bg-[#FFE17A]"
          iconColor="text-[#78350F]"
        />
      </div>

      {/* 3. Continue Where You Left Off (if session history exists) */}
      {lastSession && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-[#F0F2F3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#E4F2D8] text-[#21431A] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#4D6431]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#747873]">
                  Continue where you left off
                </span>
                <span className="text-[11px] text-[#9DA29B] font-medium">
                  {lastSession.mode === 'STATIC' ? 'Static Mode' : 'Dynamic Mode'}
                </span>
              </div>
              <p className="text-base font-bold text-[#252720] mt-0.5">
                "{lastSession.text}"
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/translate?mode=${lastSession.mode}`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#252720] text-white text-xs sm:text-sm font-semibold hover:bg-[#3E4237] transition shrink-0"
          >
            <span>Resume Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. Perfectly Balanced Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 items-start">
        {/* Left Column: AI Studio Hero, Mode Selector, Linguistics & Signing Guide */}
        <div className="space-y-6">
          <ModeFeatureCard />
          <ISLOverviewCard />
          <ISLSigningGuideCard />
        </div>

        {/* Right Column: Server Health, Recent Translations, Activity Analytics & National Initiatives */}
        <div className="space-y-6">
          <BackendStatusCard
            isOnline={isOnline}
            statusData={statusData}
            staticLoaded={staticModelLoaded}
            dynamicLoaded={dynamicModelLoaded}
            latencyMs={latencyMs}
            onRefresh={refetch}
          />

          <RecentTranslationsList
            items={historyItems}
            onSpeak={(text) => {
              if ('speechSynthesis' in window) {
                const u = new SpeechSynthesisUtterance(text);
                u.lang = 'en-IN';
                window.speechSynthesis.speak(u);
              }
            }}
          />

          <ActivityChart />

          <ISLResourcesCard />
        </div>
      </div>
    </div>
  );
};

