import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LANGUAGES, translations } from '../i18n/translations';

const STORAGE_KEY = 'pharmabot_lang';

const LanguageContext = createContext(null);

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function interpolate(text, vars = {}) {
  if (!text || !vars) return text;
  return String(text).replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

function getInitialLanguage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'am' || saved === 'en') return saved;

  const tgLang = window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
  if (tgLang === 'am' || tgLang?.startsWith('am')) return 'am';

  return 'en';
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === 'am' ? 'am' : 'en';
  }, [lang]);

  const setLang = useCallback((next) => {
    if (next === 'en' || next === 'am') {
      setLangState(next);
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((current) => (current === 'en' ? 'am' : 'en'));
  }, []);

  const t = useCallback(
    (key, vars) => {
      const value = getNestedValue(translations[lang], key) ?? getNestedValue(translations.en, key) ?? key;
      return interpolate(value, vars);
    },
    [lang]
  );

  const tCategory = useCallback(
    (slug) => {
      if (!slug) return '';
      const key = `categories.${slug}`;
      const translated = getNestedValue(translations[lang], key);
      if (translated) return translated;
      return String(slug)
        .replace(/-/g, ' ')
        .replace(/\band\b/gi, '&')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    },
    [lang]
  );

  const tStatus = useCallback(
    (status) => t(`status.${status}`) || status,
    [t]
  );

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang,
      t,
      tCategory,
      tStatus,
      languages: LANGUAGES,
    }),
    [lang, setLang, toggleLang, t, tCategory, tStatus]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
