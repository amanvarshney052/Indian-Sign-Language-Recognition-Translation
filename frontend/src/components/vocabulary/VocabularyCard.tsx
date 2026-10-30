import React from 'react';
import { VocabularyItem } from '../../types/vocabulary';
import { formatSignLabel } from '../../utils/formatting';
import { Activity, Layers, Hand, VideoOff, ArrowUpRight } from 'lucide-react';

interface VocabularyCardProps {
  item: VocabularyItem;
  onClick: (item: VocabularyItem) => void;
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({ item, onClick }) => {
  const isStatic = item.type === 'static';

  return (
    <div
      onClick={() => onClick(item)}
      className="bg-white rounded-3xl p-5 shadow-soft border border-[#F0F2F3] cursor-pointer hover:shadow-card hover:-translate-y-1 hover:border-[#D5E2C2] transition-all duration-200 flex flex-col justify-between group"
    >
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 ${
              isStatic
                ? 'bg-[#E4F2D8] text-[#21431A]'
                : 'bg-[#E0EAFF] text-[#1E3A8A]'
            }`}
          >
            {isStatic ? <Activity className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
            <span>{isStatic ? 'Static Word' : 'Dynamic Sentence'}</span>
          </span>

          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F0F2F3] text-[#747873]">
            {item.category}
          </span>
        </div>

        {/* Sign Title */}
        <h3 className="text-lg font-extrabold text-[#252720] group-hover:text-[#4D6431] transition-colors leading-snug">
          {formatSignLabel(item.name)}
        </h3>

        <p className="mt-2 text-xs text-[#747873] line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-[#F0F2F3] flex items-center justify-between text-xs text-[#747873]">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Hand className="w-3.5 h-3.5 text-[#9DA29B]" />
          <span>{item.handDominance === 'two-hand' ? 'Two Hands' : 'Single Hand'}</span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#252720] group-hover:text-[#4D6431]">
          <span>Details</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};

