import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  submessage,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#D5E2C2]/40 flex items-center justify-center mb-4">
        <Loader2 className="w-6 h-6 text-[#4D6431] animate-spin" />
      </div>
      <p className="text-base font-semibold text-[#252720]">{message}</p>
      {submessage && <p className="text-sm text-[#747873] mt-1">{submessage}</p>}
    </div>
  );
};

