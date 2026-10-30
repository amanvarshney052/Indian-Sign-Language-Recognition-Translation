import React from 'react';
import { Server, CheckCircle2, XCircle, Activity, Cpu, Layers } from 'lucide-react';
import { SystemStatusResponse } from '../../types/api';

interface BackendStatusCardProps {
  isOnline: boolean;
  statusData: SystemStatusResponse | null;
  staticLoaded: boolean;
  dynamicLoaded: boolean;
  latencyMs: number | null;
  onRefresh?: () => void;
}

export const BackendStatusCard: React.FC<BackendStatusCardProps> = ({
  isOnline,
  statusData,
  staticLoaded,
  dynamicLoaded,
  latencyMs,
  onRefresh,
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-[#F0F2F3]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#F0F2F3] flex items-center justify-center text-[#252720]">
            <Server className="w-5 h-5 text-[#252720]" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#252720]">Backend Engine Status</h3>
            <p className="text-xs text-[#747873]">FastAPI ML Inference Service</p>
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            isOnline
              ? 'bg-[#E4F2D8] text-[#21431A]'
              : 'bg-[#FEE2E2] text-[#991B1B]'
          }`}
        >
          {isOnline ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#4D6431]" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>Offline</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <div className="p-3.5 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF]/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#747873]">
            <Cpu className="w-3.5 h-3.5 text-[#4D6431]" />
            <span>Static MLP Model</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-bold text-[#252720]">
              {staticLoaded ? '114 Classes' : 'Not Loaded'}
            </span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                staticLoaded ? 'bg-[#84A45B]' : 'bg-[#D97706]'
              }`}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#F7F8F4] border border-[#E8EEDF]/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#747873]">
            <Layers className="w-3.5 h-3.5 text-[#1E3A8A]" />
            <span>Dynamic BiLSTM</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-bold text-[#252720]">
              {dynamicLoaded ? '97 Gestures' : 'Not Loaded'}
            </span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                dynamicLoaded ? 'bg-[#84A45B]' : 'bg-[#D97706]'
              }`}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#F0F2F3] flex items-center justify-between text-xs text-[#747873]">
        <span className="flex items-center gap-1.5 font-medium">
          <Activity className="w-3.5 h-3.5 text-[#A4BF80]" />
          Feature Dimension: <strong className="text-[#252720]">128-d</strong>
        </span>
        <span className="font-medium">
          Threshold: <strong className="text-[#252720]">65%</strong>
        </span>
        {latencyMs !== null && (
          <span className="font-mono text-[11px] text-[#4D6431]">
            Ping: {latencyMs}ms
          </span>
        )}
      </div>
    </div>
  );
};

