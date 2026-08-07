import { translateCatalog } from '@/services/geminiService';
import { TRANSLATION_PRELOAD } from '@/constants/translation-preload';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'ur', label: 'اردو' },
  { code: 'or', label: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'অসমীয়া' },
] as const;

type LanguageContextValue = {
  language: string;
  languageLabel: string;
  isTranslating: boolean;
  translationError: string;
  setLanguage: (code: string) => void;
  registerTexts: (texts: string[]) => void;
  t: (text: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const isTranslatable = (text: string) => /[A-Za-z]/.test(text) && text.trim().length > 1;

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState('en');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState('');
  const pendingRef = useRef(new Set<string>());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestVersionRef = useRef(0);

  const languageLabel = SUPPORTED_LANGUAGES.find((item) => item.code === language)?.label || 'English';

  // The callback intentionally reschedules itself while the translation queue has work.
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const flushPending = useCallback(async () => {
    if (language === 'en' || pendingRef.current.size === 0) return;

    const version = requestVersionRef.current;
    const texts = Array.from(pendingRef.current).slice(0, 100);
    texts.forEach((text) => pendingRef.current.delete(text));
    const catalog = Object.fromEntries(texts.map((text) => [text, text]));

    setIsTranslating(true);
    setTranslationError('');
    try {
      const translated = await translateCatalog(catalog, languageLabel);
      if (version === requestVersionRef.current) {
        setTranslations((current) => ({ ...current, ...translated }));
      }
    } catch (error) {
      console.warn('App translation failed:', error);
      if (version === requestVersionRef.current) {
        const message = error instanceof Error ? error.message : '';
        setTranslationError(
          message.includes('API key not valid')
            ? 'Translation service is not configured with a valid Gemini API key.'
            : 'Translation is temporarily unavailable.'
        );
      }
    } finally {
      if (version === requestVersionRef.current) setIsTranslating(false);
      if (pendingRef.current.size > 0) {
        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          void flushPending();
        }, 100);
      }
    }
  }, [language, languageLabel]);

  const registerTexts = useCallback((texts: string[]) => {
    if (language === 'en') return;
    texts.filter(isTranslatable).forEach((text) => {
      if (!translations[text]) pendingRef.current.add(text);
    });
    if (pendingRef.current.size > 0 && !timerRef.current) {
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        void flushPending();
      }, 75);
    }
  }, [flushPending, language, translations]);

  const setLanguage = useCallback((code: string) => {
    if (!SUPPORTED_LANGUAGES.some((item) => item.code === code)) return;
    requestVersionRef.current += 1;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    pendingRef.current.clear();
    setTranslations({});
    setTranslationError('');
    setLanguageState(code);
  }, []);

  const t = useCallback((text: string) => language === 'en' ? text : translations[text] || text, [language, translations]);

  useEffect(() => {
    if (language !== 'en') registerTexts([...TRANSLATION_PRELOAD]);
  }, [language, registerTexts]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const value = useMemo(() => ({
    language,
    languageLabel,
    isTranslating,
    translationError,
    setLanguage,
    registerTexts,
    t,
  }), [isTranslating, language, languageLabel, registerTexts, setLanguage, t, translationError]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider.');
  return context;
}
