import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyService } from '../services/history';
import { RecognitionMode, TranslationHistoryItem } from '../types/translation';
import { PageHeader } from '../components/common/PageHeader';
import { HistorySearchFilter } from '../components/history/HistorySearchFilter';
import { TranslationHistoryTable } from '../components/history/TranslationHistoryTable';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { History, Video, Sparkles } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<TranslationHistoryItem[]>(() => historyService.getAllHistory());
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<'all' | RecognitionMode>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const refreshHistory = () => {
    setItems(historyService.getAllHistory());
  };

  const handleDelete = (id: string) => {
    historyService.deleteEntry(id);
    refreshHistory();
  };

  const handleClearAll = () => {
    historyService.clearHistory();
    refreshHistory();
    setShowClearConfirm(false);
  };

  const handleExportCSV = () => {
    const csvContent = historyService.exportAsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `isl_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const jsonContent = historyService.exportAsJSON();
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `isl_history_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchText = item.text.toLowerCase().includes(q);
          const matchTokens = item.tokens.some((t) => t.toLowerCase().includes(q));
          if (!matchText && !matchTokens) return false;
        }

        if (modeFilter !== 'all' && item.mode !== modeFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return b.timestamp - a.timestamp;
        }
        return a.timestamp - b.timestamp;
      });
  }, [items, searchQuery, modeFilter, sortOrder]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="Translation History"
        subtitle="Review, listen to, and export previous sign recognition sessions stored locally in your browser."
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#D1B9E8]/40 text-[#4A2D6E] border border-[#D1B9E8]">
            <History className="w-3.5 h-3.5" />
            <span>{items.length} Saved Records</span>
          </span>
        }
        actions={
          <button
            onClick={() => navigate('/translate')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#252720] text-white text-xs sm:text-sm font-bold shadow-soft hover:bg-[#3E4237] transition"
          >
            <Video className="w-4 h-4" />
            <span>New Translation Session</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <HistorySearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        modeFilter={modeFilter}
        onModeFilterChange={setModeFilter}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        totalCount={items.length}
        onClearAll={() => setShowClearConfirm(true)}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
      />

      {/* Table or Empty State */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<History className="w-8 h-8 text-[#9DA29B]" />}
          title="No translation sessions found"
          description={
            searchQuery || modeFilter !== 'all'
              ? 'Try adjusting your search query or mode filter to view historical records.'
              : 'You have not saved any translations yet. Start a live session to recognize gestures.'
          }
          action={
            <button
              onClick={() => navigate('/translate')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#252720] text-white text-xs sm:text-sm font-bold shadow-md hover:bg-[#3E4237] transition"
            >
              <Video className="w-4 h-4" />
              <span>Start a New Session</span>
            </button>
          }
        />
      ) : (
        <TranslationHistoryTable
          items={filteredItems}
          onDelete={handleDelete}
          onSpeak={handleSpeak}
        />
      )}

      {/* Clear All Confirmation Modal */}
      <ConfirmationDialog
        isOpen={showClearConfirm}
        title="Clear All Translation History"
        description="Are you sure you want to delete all saved translation records from your browser storage? This cannot be undone."
        confirmLabel="Clear All"
        isDestructive={true}
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};

