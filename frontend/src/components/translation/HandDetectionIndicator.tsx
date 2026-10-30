import React from 'react';
import { HandStatus } from '../../types/translation';
import { Hand, Eye, CheckCircle2, Clock } from 'lucide-react';

interface HandDetectionIndicatorProps {
  handStatus: HandStatus;
}

export const HandDetectionIndicator: React.FC<HandDetectionIndicatorProps> = ({
  handStatus,
}) => {
  const { leftDetected, rightDetected, status } = handStatus;

  const getStatusBadge = () => {
    switch (status) {
      case 'recognizing':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#21431A]" />,
          text: 'Recognizing sign',
          bg: 'bg-[#E4F2D8] text-[#21431A] border-[#BFD3A3]',
          pulse: false,
        };
      case 'detecting':
        return {
          icon: <Eye className="w-3.5 h-3.5 text-[#78350F]" />,
          text: 'Detecting hands',
          bg: 'bg-[#FEF3C7] text-[#78350F] border-[#FDE68A]',
          pulse: true,
        };
      case 'waiting':
      default:
        return {
          icon: <Clock className="w-3.5 h-3.5 text-[#747873]" />,
          text: 'Waiting for hands',
          bg: 'bg-white/90 text-[#747873] border-[#E8EEDF]',
          pulse: true,
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div
      aria-live="polite"
      className="flex items-center gap-2 flex-wrap"
    >
      {/* Overall state badge */}
      <div
        className={`px-3 py-1.5 rounded-full text-xs font-bold border shadow-soft flex items-center gap-1.5 backdrop-blur-md ${badge.bg}`}
      >
        {badge.icon}
        <span>{badge.text}</span>
        {badge.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />}
      </div>

      {/* Left Hand Indicator */}
      <div
        title={leftDetected ? 'Left Hand Detected' : 'Left Hand Not Detected'}
        className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border transition ${
          leftDetected
            ? 'bg-[#E4F2D8] text-[#21431A] border-[#BFD3A3]'
            : 'bg-white/80 text-[#9DA29B] border-[#E8EEDF]'
        }`}
      >
        <Hand className="w-3 h-3" />
        <span>L: {leftDetected ? 'Active' : 'Idle'}</span>
      </div>

      {/* Right Hand Indicator */}
      <div
        title={rightDetected ? 'Right Hand Detected' : 'Right Hand Not Detected'}
        className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 border transition ${
          rightDetected
            ? 'bg-[#E0EAFF] text-[#1E3A8A] border-[#B7C8FF]'
            : 'bg-white/80 text-[#9DA29B] border-[#E8EEDF]'
        }`}
      >
        <Hand className="w-3 h-3" />
        <span>R: {rightDetected ? 'Active' : 'Idle'}</span>
      </div>
    </div>
  );
};

