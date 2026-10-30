import React, { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  sublabel?: string;
  pastelBg: string; // e.g., 'bg-[#D5E2C2]', 'bg-[#B7C8FF]'
  iconColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  sublabel,
  pastelBg,
  iconColor,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-[#F0F2F3] flex items-center gap-4 transition-all duration-200 hover:shadow-card hover:-translate-y-0.5">
      <div
        className={`w-14 h-14 rounded-2xl ${pastelBg} flex items-center justify-center shrink-0 shadow-sm`}
      >
        <div className={iconColor}>{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-2xl sm:text-3xl font-extrabold text-[#252720] tracking-tight">
          {value}
        </p>
        <h3 className="text-xs sm:text-sm font-semibold text-[#747873] truncate mt-0.5">
          {label}
        </h3>
        {sublabel && (
          <p className="text-[11px] text-[#9DA29B] font-medium mt-0.5">{sublabel}</p>
        )}
      </div>
    </div>
  );
};

