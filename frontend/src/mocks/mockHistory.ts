import { TranslationHistoryItem } from '../types/translation';

export const INITIAL_DEMO_HISTORY: TranslationHistoryItem[] = [
  {
    id: 'demo-hist-1',
    timestamp: Date.now() - 1000 * 60 * 18, // 18 mins ago
    text: 'THANK YOU SO MUCH FOR YOUR HELP',
    tokens: ['THANK', 'YOU', 'HELP'],
    mode: 'STATIC',
    averageConfidence: 0.93,
    durationSeconds: 42,
    source: 'demo',
  },
  {
    id: 'demo-hist-2',
    timestamp: Date.now() - 1000 * 60 * 55, // 55 mins ago
    text: 'how can i help you',
    tokens: ['how can i help you'],
    mode: 'DYNAMIC',
    averageConfidence: 0.89,
    durationSeconds: 28,
    source: 'demo',
  },
  {
    id: 'demo-hist-3',
    timestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    text: 'I NEED WATER PLEASE',
    tokens: ['I_ME_MINE_MY', 'NEED', 'WATER', 'PLEASE'],
    mode: 'STATIC',
    averageConfidence: 0.91,
    durationSeconds: 65,
    source: 'demo',
  },
  {
    id: 'demo-hist-4',
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    text: 'nice to meet you',
    tokens: ['nice to meet you'],
    mode: 'DYNAMIC',
    averageConfidence: 0.95,
    durationSeconds: 34,
    source: 'demo',
  },
  {
    id: 'demo-hist-5',
    timestamp: Date.now() - 1000 * 60 * 60 * 30, // yesterday
    text: 'GOOD MORNING FRIEND',
    tokens: ['GOOD', 'FRIEND'],
    mode: 'STATIC',
    averageConfidence: 0.88,
    durationSeconds: 39,
    source: 'demo',
  },
];

