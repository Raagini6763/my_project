type RefineResult = {
  needsRefinement: boolean;
  refinedText: string;
};

type TranslateResult = {
  translations: Record<string, string>;
};

const WORKER_URL = process.env.EXPO_PUBLIC_GEMINI_WORKER_URL
  || 'https://gemini-worker.awaaz.workers.dev';

const callWorker = async <T>(payload: Record<string, unknown>): Promise<T> => {
  const response = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'The language service is unavailable.');
  return data as T;
};

export const refineStoryText = async (text: string): Promise<RefineResult> => {
  const original = text?.trim() || '';
  if (!original) return { needsRefinement: false, refinedText: original };
  const result = await callWorker<Partial<RefineResult>>({ operation: 'refine', text: original });
  return {
    needsRefinement: result.needsRefinement === true,
    refinedText: typeof result.refinedText === 'string' && result.refinedText.trim()
      ? result.refinedText.trim()
      : original,
  };
};

export const translateCatalog = async (
  catalog: Record<string, string>,
  targetLanguage: string
): Promise<Record<string, string>> => {
  if (!targetLanguage || targetLanguage === 'English') return catalog;
  const result = await callWorker<Partial<TranslateResult>>({ operation: 'translate', catalog, targetLanguage });
  return result.translations && typeof result.translations === 'object'
    ? { ...catalog, ...result.translations }
    : catalog;
};
