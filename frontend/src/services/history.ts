import { INITIAL_DEMO_HISTORY } from '../mocks/mockHistory';
import { SessionStatistics, TranslationHistoryItem } from '../types/translation';

const STORAGE_KEY = 'isl_bridge_translation_history_v1';

class HistoryService {
  private getStorageData(): TranslationHistoryItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Seed with initial demo history if brand new
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_HISTORY));
        return INITIAL_DEMO_HISTORY;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[HistoryService] Failed to read history from localStorage:', e);
      return INITIAL_DEMO_HISTORY;
    }
  }

  private saveStorageData(items: TranslationHistoryItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('[HistoryService] Failed to persist history to localStorage:', e);
    }
  }

  getAllHistory(): TranslationHistoryItem[] {
    return this.getStorageData().sort((a, b) => b.timestamp - a.timestamp);
  }

  addEntry(
    text: string,
    tokens: string[],
    mode: 'STATIC' | 'DYNAMIC',
    confidence: number,
    source: 'live' | 'snapshot' | 'demo' = 'live',
    durationSeconds = 0
  ): TranslationHistoryItem {
    const items = this.getStorageData();
    const newItem: TranslationHistoryItem = {
      id: 'trans-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
      text: text.trim(),
      tokens: [...tokens],
      mode,
      averageConfidence: confidence,
      durationSeconds,
      source,
    };

    items.unshift(newItem);
    // Keep last 100 entries max to prevent excessive storage
    if (items.length > 100) items.length = 100;
    this.saveStorageData(items);
    return newItem;
  }

  deleteEntry(id: string): boolean {
    const items = this.getStorageData();
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length !== items.length) {
      this.saveStorageData(filtered);
      return true;
    }
    return false;
  }

  clearHistory() {
    this.saveStorageData([]);
  }

  resetToDemo() {
    this.saveStorageData(INITIAL_DEMO_HISTORY);
  }

  getStatistics(): SessionStatistics {
    const items = this.getStorageData();
    let words = 0;
    let sentences = 0;
    let staticCount = 0;
    let dynamicCount = 0;
    let totalConf = 0;

    items.forEach((item) => {
      totalConf += item.averageConfidence;
      if (item.mode === 'STATIC') {
        staticCount++;
        words += item.tokens.length || 1;
      } else {
        dynamicCount++;
        sentences++;
      }
    });

    return {
      wordsRecognized: words,
      sentencesTranslated: sentences,
      sessionCount: items.length,
      staticCount,
      dynamicCount,
      avgConfidence: items.length > 0 ? totalConf / items.length : 0.85,
    };
  }

  exportAsJSON(): string {
    const items = this.getAllHistory();
    return JSON.stringify(items, null, 2);
  }

  exportAsCSV(): string {
    const items = this.getAllHistory();
    const headers = ['ID', 'Date', 'Mode', 'Text', 'Tokens', 'Confidence', 'DurationSeconds', 'Source'];
    const rows = items.map((item) => [
      item.id,
      new Date(item.timestamp).toISOString(),
      item.mode,
      `"${item.text.replace(/"/g, '""')}"`,
      `"${item.tokens.join(', ')}"`,
      item.averageConfidence.toFixed(2),
      item.durationSeconds || 0,
      item.source,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

export const historyService = new HistoryService();

