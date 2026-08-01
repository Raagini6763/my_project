const getApiKey = () => {
  const key = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
  return key.trim();
};

const buildGeminiUrl = () => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
};

const normalizeGeminiText = (text: string) => {
  if (!text) return '';
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();
};

const parseJsonFromText = (text: string) => {
  const normalized = normalizeGeminiText(text);
  const match = normalized.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch (error) {
    return null;
  }
};

export const refineStoryText = async (text: string) => {
  if (!text?.trim()) {
    return { needsRefinement: false, refinedText: text };
  }

  const url = buildGeminiUrl();
  if (!url) {
    return { needsRefinement: false, refinedText: text };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Review the following community story. If it already reads clearly and respectfully, return exactly: NO_CHANGE. Otherwise return a polished version with improved grammar and clarity.\n\nStory:\n${text}`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = normalizeGeminiText(resultText);

    if (!cleaned || cleaned.toUpperCase().includes('NO_CHANGE')) {
      return { needsRefinement: false, refinedText: text };
    }

    return { needsRefinement: true, refinedText: cleaned };
  } catch (error) {
    console.warn('Gemini refinement failed:', error);
    return { needsRefinement: false, refinedText: text };
  }
};

export const translateCatalog = async (catalog: Record<string, string>, targetLanguage: string) => {
  if (!targetLanguage || targetLanguage === 'English') {
    return catalog;
  }

  const url = buildGeminiUrl();
  if (!url) {
    return catalog;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Translate the following JSON object values into ${targetLanguage}. Return only valid JSON with the same keys and translated values.\n\n${JSON.stringify(catalog)}`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsed = parseJsonFromText(resultText);
    if (parsed && typeof parsed === 'object') {
      return { ...catalog, ...parsed };
    }
  } catch (error) {
    console.warn('Gemini translation failed:', error);
  }

  return catalog;
};
