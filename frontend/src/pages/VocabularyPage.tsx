import React, { useState, useEffect, useMemo } from 'react';
import { apiService } from '../services/api';
import { buildMockVocabulary } from '../mocks/mockClasses';
import { VocabularyItem, VocabularySortOption } from '../types/vocabulary';
import { PageHeader } from '../components/common/PageHeader';
import { VocabularyFilters } from '../components/vocabulary/VocabularyFilters';
import { VocabularyCard } from '../components/vocabulary/VocabularyCard';
import { SignDetailModal } from '../components/vocabulary/SignDetailModal';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { BookOpen, Search, Sparkles } from 'lucide-react';

export const VocabularyPage: React.FC = () => {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'static' | 'dynamic'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOption, setSortOption] = useState<VocabularySortOption>('alpha-asc');

  // Selected item for modal
  const [selectedItem, setSelectedItem] = useState<VocabularyItem | null>(null);

  const loadClasses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getClasses();
      const loaded: VocabularyItem[] = [];

      // Transform backend classes
      response.static_classes.forEach((sc, idx) => {
        loaded.push({
          id: `api-static-${idx}`,
          name: sc.name,
          type: 'static',
          category: inferCategory(sc.name),
          description: sc.description || `Indian Sign Language word sign for "${sc.name}".`,
          videoAvailable: false,
          handDominance: ['A LOT', 'CONGRATULATIONS', 'DIFFERENCE', 'THANK'].includes(sc.name)
            ? 'two-hand'
            : 'one-hand',
        });
      });

      response.dynamic_classes.forEach((dc, idx) => {
        loaded.push({
          id: `api-dynamic-${idx}`,
          name: dc.name,
          type: 'dynamic',
          category: inferCategory(dc.name),
          description: dc.description || `Dynamic gesture phrase for "${dc.name}".`,
          videoAvailable: false,
          handDominance: 'two-hand',
        });
      });

      if (loaded.length === 0) {
        setItems(buildMockVocabulary());
      } else {
        setItems(loaded);
      }
    } catch (e: any) {
      console.warn('[VocabularyPage] Backend unavailable, falling back to built-in ISL lexicon:', e);
      // Fallback cleanly to mock vocabulary of 211 classes
      setItems(buildMockVocabulary());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  function inferCategory(name: string): string {
    const upper = name.toUpperCase();
    if (upper.includes("WHAT") || upper.includes("WHERE") || upper.includes("WHEN") || upper.includes("WHO") || upper.includes("WHY") || upper.includes("HOW") || upper.includes("WHICH")) {
      return "Questions";
    }
    if (upper.includes("THANK") || upper.includes("PLEASE") || upper.includes("SORRY") || upper.includes("HI") || upper.includes("MEET") || upper.includes("WELCOME") || upper.includes("CONGRATULAT")) {
      return "Social & Greetings";
    }
    if (upper.includes("HAPPY") || upper.includes("AFRAID") || upper.includes("ANGRY") || upper.includes("BORED") || upper.includes("CRYING") || upper.includes("DISAPPOINTED") || upper.includes("FEVER") || upper.includes("TIRED") || upper.includes("WORRY") || upper.includes("LOVE") || upper.includes("LIKE")) {
      return "Emotions & Health";
    }
    if (upper.includes("FOOD") || upper.includes("WATER") || upper.includes("BED") || upper.includes("GLASS") || upper.includes("SHIRT") || upper.includes("TRAIN") || upper.includes("ROOM") || upper.includes("PLACE")) {
      return "Daily Objects & Places";
    }
    if (upper.includes("DO") || upper.includes("GO") || upper.includes("COME") || upper.includes("BRING") || upper.includes("TAKE") || upper.includes("MAKE") || upper.includes("WALK") || upper.includes("SLEEP") || upper.includes("POUR") || upper.includes("SERVE")) {
      return "Actions & Verbs";
    }
    return "General Vocabulary";
  }

  // Get distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => set.add(item.category));
    return Array.from(set).sort();
  }, [items]);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        // Type filter
        if (typeFilter !== 'all' && item.type !== typeFilter) {
          return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && item.category !== categoryFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'alpha-asc') {
          return a.name.localeCompare(b.name);
        }
        if (sortOption === 'alpha-desc') {
          return b.name.localeCompare(a.name);
        }
        if (sortOption === 'category') {
          return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
        }
        if (sortOption === 'type') {
          return a.type.localeCompare(b.type) || a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [items, searchQuery, typeFilter, categoryFilter, sortOption]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <PageHeader
        title="ISL Vocabulary Explorer"
        subtitle="Explore the 211 supported Indian Sign Language vocabulary signs, isolated words, and continuous sentence gestures."
        badge={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E4F2D8] text-[#21431A] border border-[#BFD3A3]">
            <Sparkles className="w-3.5 h-3.5 text-[#4D6431]" />
            <span>211 Total Classes</span>
          </span>
        }
      />

      {/* Filter and Search Bar */}
      <VocabularyFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        categories={categories}
        sortOption={sortOption}
        onSortOptionChange={setSortOption}
        totalCount={items.length}
        filteredCount={filteredItems.length}
      />

      {/* Main Grid View */}
      {isLoading ? (
        <LoadingState
          message="Loading ISL Vocabulary..."
          submessage="Connecting to backend classes endpoint"
        />
      ) : error ? (
        <ErrorState
          title="Could not load vocabulary"
          message={error}
          onRetry={loadClasses}
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={<Search className="w-8 h-8 text-[#9DA29B]" />}
          title="No signs matched your search"
          description="Try adjusting your search query, clearing filters, or switching categories."
          action={
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setCategoryFilter('all');
              }}
              className="px-5 py-2.5 rounded-full bg-[#252720] text-white text-xs font-semibold hover:bg-[#3E4237] transition"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredItems.map((item) => (
            <VocabularyCard
              key={item.id}
              item={item}
              onClick={(clicked) => setSelectedItem(clicked)}
            />
          ))}
        </div>
      )}

      {/* Modal for Sign Details */}
      <SignDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};

