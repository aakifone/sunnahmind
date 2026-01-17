import { useCallback, useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { containsArabic, translateText } from "@/lib/translate";

const CACHE_KEY = "translationCache";

type TranslationCache = Record<string, string>;

const loadCache = (): TranslationCache => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw) as TranslationCache;
  } catch (error) {
    console.warn("Failed to load translation cache:", error);
    return {};
  }
};

const persistCache = (cache: TranslationCache) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn("Failed to save translation cache:", error);
  }
};

export const useTranslate = () => {
  const { language } = useLanguage();
  const [cache, setCache] = useState<TranslationCache>({});

  useEffect(() => {
    setCache(loadCache());
  }, []);

  const updateCache = useCallback((key: string, value: string) => {
    setCache((prev) => {
      const next = { ...prev, [key]: value };
      persistCache(next);
      return next;
    });
  }, []);

  const translate = useCallback(
    (text: string) => {
      if (!text) {
        return text;
      }
      if (containsArabic(text)) {
        return text;
      }
      if (language.translateCode === "en") {
        return text;
      }

      const key = `${language.translateCode}:${text}`;
      if (cache[key]) {
        return cache[key];
      }

      void translateText(text, language.translateCode).then((translated) => {
        updateCache(key, translated);
      });

      return text;
    },
    [cache, language.translateCode, updateCache],
  );

  const value = useMemo(
    () => ({
      t: translate,
      language,
    }),
    [translate, language],
  );

  return value;
};
