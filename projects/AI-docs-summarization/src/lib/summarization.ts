import type { SummaryConfig } from '../types/schemas';
import { chunkByWords, computeWordFrequency, removeStopWords, selectKeywords, tokenizeSentences, tokenizeWords } from './text';

const LENGTH_PRESETS: Record<SummaryConfig['length'], number> = {
  short: 0.12,
  medium: 0.2,
  detailed: 0.35,
  custom: 0.18
};

const MIN_SENTENCES = 3;

export interface SummaryPayload {
  summary: string;
  highlights: string[];
  keywords: string[];
  engine: 'extractive' | 'abstractive' | 'abstractive-fallback';
}

export async function generateSummary(text: string, config: SummaryConfig): Promise<SummaryPayload> {
  if (config.mode === 'extractive') {
    return runExtractiveSummary(text, config);
  }

  try {
    return await runAbstractiveSummary(text, config);
  } catch (error) {
    console.warn('Abstractive model unavailable, falling back to extractive summary.', error);
    const fallback = await runExtractiveSummary(text, config);
    return { ...fallback, engine: 'abstractive-fallback' };
  }
}

function sentenceScores(text: string) {
  const sentences = tokenizeSentences(text);
  const words = removeStopWords(tokenizeWords(text));
  const frequencies = computeWordFrequency(words);

  return sentences.map((sentence, index) => {
    const sentenceWords = removeStopWords(tokenizeWords(sentence));
    if (sentenceWords.length === 0) {
      return { index, score: 0, sentence };
    }
    const score = sentenceWords.reduce((acc, word) => acc + (frequencies.get(word) ?? 0), 0) / sentenceWords.length;
    return { index, score, sentence };
  });
}

function selectSentences(text: string, ratio: number) {
  const scored = sentenceScores(text);
  const target = Math.max(
    MIN_SENTENCES,
    Math.round(scored.length * Math.min(Math.max(ratio, 0.05), 0.6))
  );

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, target)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.sentence.trim());
}

async function runExtractiveSummary(text: string, config: SummaryConfig): Promise<SummaryPayload> {
  const ratio = config.length === 'custom' ? config.summaryPercentage : LENGTH_PRESETS[config.length];
  const sentences = selectSentences(text, ratio);
  const highlights = sentences.slice(0, 3);
  return {
    summary: sentences.join(' '),
    highlights,
    keywords: selectKeywords(text),
    engine: 'extractive'
  };
}

let summarizerPromise: Promise<any> | null = null;

async function getAbstractivePipeline() {
  if (!summarizerPromise) {
    summarizerPromise = import('@xenova/transformers').then(async ({ pipeline, env }) => {
      env.allowRemoteModels = true;
      env.useBrowserCache = true;
      return pipeline('summarization', 'Xenova/distilbart-cnn-12-6');
    });
  }
  return summarizerPromise;
}

async function runAbstractiveSummary(text: string, config: SummaryConfig): Promise<SummaryPayload> {
  const ratio = config.length === 'custom' ? config.summaryPercentage : LENGTH_PRESETS[config.length];
  const summarizer = await getAbstractivePipeline();
  const chunks = chunkByWords(text, 800);
  const outputs: string[] = [];

  for (const chunk of chunks) {
    const maxNewTokens = Math.max(120, Math.round(ratio * 900));
    const minLength = Math.max(48, Math.round(maxNewTokens * 0.4));
    const response = await summarizer(chunk, {
      min_length: minLength,
      max_new_tokens: maxNewTokens,
      truncation: true
    });
    const [result] = Array.isArray(response) ? response : [response];
    outputs.push(result?.summary_text?.trim() ?? '');
  }

  const summary = outputs.join(' ').trim();
  const highlights = selectSentences(text, 0.1).slice(0, 3);

  return {
    summary,
    highlights,
    keywords: selectKeywords(summary || text),
    engine: 'abstractive'
  };
}
