import React, { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-14 text-center bg-white rounded-3xl border border-[#F0F2F3] shadow-soft">
      <div className="w-14 h-14 rounded-2xl bg-[#F0F2F3] flex items-center justify-center mb-4 text-[#747873]">
        {icon || <Sparkles className="w-7 h-7 text-[#A4BF80]" />}
      </div>
      <h3 className="text-lg font-bold text-[#252720]">{title}</h3>
      <p className="mt-1.5 text-sm text-[#747873] max-w-sm leading-relaxed">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

