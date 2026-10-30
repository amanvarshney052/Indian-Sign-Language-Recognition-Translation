import React from 'react';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react';
import { VocabularySortOption } from '../../types/vocabulary';

interface VocabularyFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  typeFilter: 'all' | 'static' | 'dynamic';
  onTypeFilterChange: (type: 'all' | 'static' | 'dynamic') => void;
  categoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
  categories: string[];
  sortOption: VocabularySortOption;
  onSortOptionChange: (sort: VocabularySortOption) => void;
  totalCount: number;
  filteredCount: number;
}

export const VocabularyFilters: React.FC<VocabularyFiltersProps> = ({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  sortOption,
  onSortOptionChange,
  totalCount,
  filteredCount,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-soft border border-[#F0F2F3] space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9DA29B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search 211 supported ISL signs or sentences..."
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

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="appearance-none pl-4 pr-9 py-3 rounded-full bg-[#F7F8F4] border border-[#E8EEDF] text-xs font-semibold text-[#252720] focus:outline-none focus:ring-2 focus:ring-[#D5E2C2]"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9DA29B] pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => onSortOptionChange(e.target.value as VocabularySortOption)}
              className="appearance-none pl-4 pr-9 py-3 rounded-full bg-[#F7F8F4] border border-[#E8EEDF] text-xs font-semibold text-[#252720] focus:outline-none focus:ring-2 focus:ring-[#D5E2C2]"
            >
              <option value="alpha-asc">Alphabetical (A - Z)</option>
              <option value="alpha-desc">Alphabetical (Z - A)</option>
              <option value="category">Category</option>
              <option value="type">Sign Type</option>
            </select>
            <ArrowUpDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9DA29B] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Pill Filter Badges & Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F0F2F3]">
        <div className="flex items-center gap-1.5 bg-[#F7F8F4] p-1 rounded-full border border-[#E8EEDF]">
          <button
            type="button"
            onClick={() => onTypeFilterChange('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              typeFilter === 'all'
                ? 'bg-[#252720] text-white shadow-sm'
                : 'text-[#747873] hover:text-[#252720]'
            }`}
          >
            All Signs ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => onTypeFilterChange('static')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              typeFilter === 'static'
                ? 'bg-[#252720] text-white shadow-sm'
                : 'text-[#747873] hover:text-[#252720]'
            }`}
          >
            Static Words (114)
          </button>
          <button
            type="button"
            onClick={() => onTypeFilterChange('dynamic')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
              typeFilter === 'dynamic'
                ? 'bg-[#252720] text-white shadow-sm'
                : 'text-[#747873] hover:text-[#252720]'
            }`}
          >
            Dynamic Sentences (97)
          </button>
        </div>

        <p className="text-xs text-[#747873] font-medium">
          Showing <strong className="text-[#252720]">{filteredCount}</strong> of {totalCount} signs
        </p>
      </div>
    </div>
  );
};

