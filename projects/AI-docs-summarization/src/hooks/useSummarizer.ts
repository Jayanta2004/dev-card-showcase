import { toast } from 'sonner';
import { nanoid } from 'nanoid';
import { generateSummary } from '../lib/summarization';
import { useDocumentStore } from '../store/documentStore';
import type { SummaryConfig, SummaryResult } from '../types/schemas';

export function useSummarizer() {
  const cleanedText = useDocumentStore((state) => state.cleanedText);
  const stats = useDocumentStore((state) => state.stats);
  const title = useDocumentStore((state) => state.title);
  const setStatus = useDocumentStore((state) => state.setStatus);
  const setSummary = useDocumentStore((state) => state.setSummary);
  const pushHistory = useDocumentStore((state) => state.pushHistory);
  const setError = useDocumentStore((state) => state.setError);

  const MIN_WORDS = 800;

  const runSummarization = async (config: SummaryConfig) => {
    if (!cleanedText || stats.words < MIN_WORDS) {
      toast.error('Please provide at least 800 words for a high-quality summary.');
      return;
    }

    setStatus('processing');
    setError(undefined);
    const startedAt = performance.now();

    try {
      const payload = await generateSummary(cleanedText, config);
      const formattedSummary = stylizeSummary(payload.summary, config.tone);
      const summaryWordCount = formattedSummary.split(/\s+/).filter(Boolean).length || 1;
      const compression = stats.words > 0 ? 1 - summaryWordCount / stats.words : 0;
      const readingMinutesSaved = Math.max(stats.readingMinutes - summaryWordCount / 200, 0);

      const result: SummaryResult = {
        id: nanoid(8),
        summary: formattedSummary,
        highlights: config.highlight ? payload.highlights : [],
        keywords: payload.keywords,
        engine: payload.engine,
        createdAt: new Date().toISOString(),
        sourceTitle: title,
        config,
        stats: {
          originalWords: stats.words,
          summaryWords: summaryWordCount,
          compression: Number(compression.toFixed(2)),
          readingMinutesSaved: Number(readingMinutesSaved.toFixed(1)),
          processingMs: Math.round(performance.now() - startedAt)
        }
      };

      setSummary(result);
      pushHistory(result);
      toast.success('Summary ready');
    } catch (error) {
      console.error(error);
      setStatus('idle');
      setError(error instanceof Error ? error.message : 'Unable to generate summary');
      toast.error('Summarization failed');
    }
  };

  return { runSummarization };
}

function stylizeSummary(summary: string, tone: SummaryConfig['tone']) {
  const sentences = summary.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter(Boolean);

  if (tone === 'bullet') {
    return sentences.map((sentence) => `• ${sentence}`).join('\n');
  }

  if (tone === 'executive') {
    return sentences
      .map((sentence, index) => `Insight ${index + 1}: ${sentence}`)
      .join('\n\n');
  }

  return summary;
}
