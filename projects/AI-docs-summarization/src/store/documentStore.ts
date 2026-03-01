import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DocumentState, SummaryResult } from '../types/schemas';
import { documentStats, sanitizeText } from '../lib/text';

interface DocumentActions {
  updateDocument: (payload: { text: string; title?: string }) => void;
  setStatus: (status: DocumentState['status']) => void;
  setSummary: (summary: SummaryResult) => void;
  pushHistory: (summary: SummaryResult) => void;
  setError: (message: string | undefined) => void;
  resetSummary: () => void;
}

type DocumentStore = DocumentState & DocumentActions;

const baseStats = { words: 0, sentences: 0, characters: 0, readingMinutes: 0 };

const initialState: DocumentState = {
  title: 'Untitled document',
  rawText: '',
  cleanedText: '',
  status: 'idle',
  stats: baseStats,
  summary: undefined,
  history: [],
  error: undefined
};

const MAX_HISTORY = 12;

export const useDocumentStore = create<DocumentStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      updateDocument: ({ text, title }) => {
        const cleaned = sanitizeText(text);
        const stats = documentStats(cleaned);
        set({
          rawText: text,
          cleanedText: cleaned,
          stats,
          title: title ?? inferTitle(cleaned),
          status: 'idle',
          summary: undefined,
          error: undefined
        });
      },
      setStatus: (status) => set({ status }),
      setSummary: (summary) => set({ summary, status: 'ready', error: undefined }),
      pushHistory: (summary) => {
        const { history } = get();
        const nextHistory = [summary, ...history].slice(0, MAX_HISTORY);
        set({ history: nextHistory });
      },
      setError: (message) => set({ error: message }),
      resetSummary: () => set({ summary: undefined, status: 'idle', error: undefined })
    }),
    {
      name: 'day148-summaries',
      partialize: (state) => ({ history: state.history })
    }
  )
);

function inferTitle(text: string) {
  if (!text) return 'Untitled document';
  const firstSentence = text.split(/[.!?]/)[0];
  return firstSentence?.trim().slice(0, 80) || 'Untitled document';
}
