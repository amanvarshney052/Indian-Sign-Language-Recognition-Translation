import { RecognitionMode } from './translation';

export interface VocabularyItem {
  id: string;
  name: string;
  type: 'static' | 'dynamic';
  category: string;
  description: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  handDominance?: 'one-hand' | 'two-hand';
  sampleUsage?: string;
  videoAvailable: boolean;
}

export type VocabularySortOption = 'alpha-asc' | 'alpha-desc' | 'category' | 'type';

