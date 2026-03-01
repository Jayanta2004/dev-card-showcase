import { STOP_WORDS } from './stopwords';

export function normalizeWhitespace(input: string) {
  return input.replace(/\s+/g, ' ').trim();
}

export function sanitizeText(input: string) {
  return normalizeWhitespace(input.replace(/[\u0000-\u001F\u007F]/g, ' '));
}

export function tokenizeSentences(text: string) {
  const cleaned = text.replace(/([.?!])([^”'"\]\)\s])/g, '$1 $2');
  return cleaned
    .split(/(?<=[.?!])\s+(?=[A-Z0-9])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function tokenizeWords(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

export function removeStopWords(words: string[]) {
  return words.filter((word) => !STOP_WORDS.has(word));
}

export function computeWordFrequency(words: string[]) {
  const freq = new Map<string, number>();
  words.forEach((word) => {
    const count = freq.get(word) ?? 0;
    freq.set(word, count + 1);
  });
  return freq;
}

export function selectKeywords(text: string, count = 12) {
  const words = removeStopWords(tokenizeWords(text));
  const freq = computeWordFrequency(words);
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word);
}

export function estimateReadingTime(words: number) {
  const minutes = words / 200;
  return Number(minutes.toFixed(1));
}

export function documentStats(text: string) {
  const sentences = tokenizeSentences(text).length;
  const words = tokenizeWords(text).length;
  const characters = text.length;
  return {
    sentences,
    words,
    characters,
    readingMinutes: estimateReadingTime(words)
  };
}

export function chunkByWords(text: string, chunkSize = 650) {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  return chunks;
}
