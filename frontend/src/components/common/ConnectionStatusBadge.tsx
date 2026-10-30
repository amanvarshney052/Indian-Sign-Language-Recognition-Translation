import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface ConnectionStatusBadgeProps {
  isOnline: boolean;
  isLoading?: boolean;
  latencyMs?: number | null;
  isMockMode?: boolean;
  onClick?: () => void;
}

export const ConnectionStatusBadge: React.FC<ConnectionStatusBadgeProps> = ({
  isOnline,
  isLoading,
  latencyMs,
  isMockMode,
  onClick,
}) => {
  if (isMockMode) {
    return (
      <button
        onClick={onClick}
        title="Running in Demo / Simulated Mode"
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-[#FFE17A]/40 text-[#78350F] border border-[#FFE17A] hover:bg-[#FFE17A]/60 transition"
      >
        <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
        <span className="font-semibold">Demo Mode</span>
      </button>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F0F2F3] text-[#747873]">
        <span className="w-2 h-2 rounded-full bg-[#9DA29B] animate-ping" />
        <span>Connecting...</span>
      </div>
    );
  }

  if (isOnline) {
    return (
      <button
        onClick={onClick}
        title={latencyMs ? `Backend connected (${latencyMs}ms latency)` : 'Backend connected'}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-[#E4F2D8] text-[#21431A] border border-[#BFD3A3] hover:bg-[#D5E2C2]/50 transition"
      >
        <Wifi className="w-3.5 h-3.5 text-[#4D6431]" />
        <span className="font-medium">Backend Online</span>
        {latencyMs !== null && latencyMs !== undefined && (
          <span className="text-[10px] text-[#4D6431]/80 font-mono">({latencyMs}ms)</span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      title="Backend server is unreachable (Click to view settings)"
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA] hover:bg-[#FEE2E2]/80 transition"
    >
      <WifiOff className="w-3.5 h-3.5 text-[#DC2626]" />
      <span className="font-medium">Offline (Port 8000)</span>
    </button>
  );
};

