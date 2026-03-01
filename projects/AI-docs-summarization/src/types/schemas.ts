export type SummaryLength = 'short' | 'medium' | 'detailed' | 'custom';
export type SummaryMode = 'extractive' | 'abstractive';

export interface SummaryConfig {
  length: SummaryLength;
  summaryPercentage: number; // between 0.05 and 0.6
  mode: SummaryMode;
  language: string;
  highlight: boolean;
  tone: 'neutral' | 'executive' | 'bullet';
}

export interface SummaryResult {
  id: string;
  summary: string;
  highlights: string[];
  keywords: string[];
  engine: 'extractive' | 'abstractive' | 'abstractive-fallback';
  createdAt: string;
  stats: {
    originalWords: number;
    summaryWords: number;
    compression: number;
    readingMinutesSaved: number;
    processingMs: number;
  };
  config: SummaryConfig;
  sourceTitle: string;
}

export interface DocumentState {
  title: string;
  rawText: string;
  cleanedText: string;
  status: 'idle' | 'processing' | 'ready';
  stats: {
    words: number;
    sentences: number;
    characters: number;
    readingMinutes: number;
  };
  summary?: SummaryResult;
  history: SummaryResult[];
  error?: string;
}
