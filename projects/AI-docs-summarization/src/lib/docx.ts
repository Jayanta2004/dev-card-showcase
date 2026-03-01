import { sanitizeText } from './text';

export async function extractDocxText(file: File) {
  const mammothModule: any = await import('mammoth/mammoth.browser');
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammothModule.extractRawText({ arrayBuffer });
  return sanitizeText(value);
}
