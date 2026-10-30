import React from 'react';
import { Search, ArrowUpDown, Trash2, Download, X } from 'lucide-react';
import { RecognitionMode } from '../../types/translation';

interface HistorySearchFilterProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  modeFilter: 'all' | RecognitionMode;
  onModeFilterChange: (mode: 'all' | RecognitionMode) => void;
  sortOrder: 'newest' | 'oldest';
  onSortOrderChange: (order: 'newest' | 'oldest') => void;
  totalCount: number;
  onClearAll: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
}

export const HistorySearchFilter: React.FC<HistorySearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  modeFilter,
  onModeFilterChange,
  sortOrder,
  onSortOrderChange,
  totalCount,
  onClearAll,
  onExportCSV,
  onExportJSON,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-[#F0F2F3] space-y-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9DA29B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search translated words or sentences..."
            className="w-full pl-11 pr-10 py-3 rounded-full bg-[#F7F8F4] border border-[#E8EEDF] text-sm text-[#252720] placeholder:text-[#9DA29B] focus:bg-white focus:border-[#4D6431] focus:ring-2 focus:ring-[#D5E2C2] focus:outline-none transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#9DA29B] hover:text-[#252720]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-[#F7F8F4] p-1 rounded-full border border-[#E8EEDF]">
            <button
              type="button"
              onClick={() => onModeFilterChange('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                modeFilter === 'all'
                  ? 'bg-[#252720] text-white'
                  : 'text-[#747873] hover:text-[#252720]'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onModeFilterChange('STATIC')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                modeFilter === 'STATIC'
                  ? 'bg-[#252720] text-white'
                  : 'text-[#747873] hover:text-[#252720]'
              }`}
            >
              Static
            </button>
            <button
              type="button"
              onClick={() => onModeFilterChange('DYNAMIC')}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                modeFilter === 'DYNAMIC'
                  ? 'bg-[#252720] text-white'
                  : 'text-[#747873] hover:text-[#252720]'
              }`}
            >
              Dynamic
            </button>
          </div>

          <button
            type="button"
            onClick={() => onSortOrderChange(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="px-3.5 py-2.5 rounded-full bg-[#F7F8F4] border border-[#E8EEDF] text-xs font-semibold text-[#252720] flex items-center gap-1.5 hover:bg-[#E4E7E9] transition"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* Export & Clear Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-[#F0F2F3] flex-wrap gap-2 text-xs">
        <span className="text-[#747873] font-medium">
          Total stored records: <strong className="text-[#252720]">{totalCount}</strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportCSV}
            disabled={totalCount === 0}
            className="px-3 py-1.5 rounded-full bg-white border border-[#E8EEDF] text-[#252720] text-xs font-semibold hover:bg-[#F0F2F3] transition disabled:opacity-40"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={onExportJSON}
            disabled={totalCount === 0}
            className="px-3 py-1.5 rounded-full bg-white border border-[#E8EEDF] text-[#252720] text-xs font-semibold hover:bg-[#F0F2F3] transition disabled:opacity-40"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={onClearAll}
            disabled={totalCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEE2E2] text-[#991B1B] text-xs font-bold border border-[#FECACA] hover:bg-[#FECACA] transition disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>
    </div>
  );
};

