import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { TopNavigation } from './TopNavigation';
import { useBackendStatus } from '../../hooks/useBackendStatus';
import { Sparkles, Info } from 'lucide-react';

interface AppLayoutProps {
  isMockMode: boolean;
  onToggleMockMode: () => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  isMockMode,
  onToggleMockMode,
}) => {
  const { isOnline, isLoading, latencyMs, staticModelLoaded, dynamicModelLoaded } =
    useBackendStatus(12000);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8F4] text-[#252720]">
      {/* Top Banner if in Demo Mode */}
      {isMockMode && (
        <div className="bg-[#FFE17A]/80 border-b border-[#FFE17A] text-[#78350F] px-4 py-2 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <Sparkles className="w-4 h-4 shrink-0 text-[#D97706]" />
            <span>
              <strong>Demo Mode Active:</strong> Running interactive mock predictions with real ISL vocabulary classes. You can connect your live backend on port 8000 anytime.
            </span>
            <button
              onClick={onToggleMockMode}
              className="ml-auto underline font-bold hover:text-[#252720] shrink-0"
            >
              Switch to Live Mode
            </button>
          </div>
        </div>
      )}

      {/* Main Top Navigation */}
      <TopNavigation
        isOnline={isOnline}
        isLoadingStatus={isLoading}
        latencyMs={latencyMs}
        isMockMode={isMockMode}
        onToggleMockMode={onToggleMockMode}
      />

      {/* Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Polished Accessible Footer */}
      <footer className="mt-auto border-t border-[#E8EEDF]/80 py-6 text-xs text-[#747873]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#A4BF80]" />
            <span>
              <strong>ISL Bridge</strong> — Indian Sign Language AI Recognition Platform
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#747873]" />
              Dual-Hand 128-d Normalization • 114 Static & 97 Dynamic Classes
            </span>
            <span>WCAG 2.1 AA Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

