import { useEffect, useState } from "react";

type ContentLanguageState = {
  hadith: string;
  quran: string;
  articles: string;
};

const STORAGE_KEY = "sunnahmind-content-languages";

const defaultState: ContentLanguageState = {
  hadith: "en",
  quran: "en",
  articles: "en",
};

export const useContentLanguages = () => {
  const [languages, setLanguages] = useState<ContentLanguageState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as ContentLanguageState) : defaultState;
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(languages));
  }, [languages]);

  const updateLanguage = (key: keyof ContentLanguageState, value: string) => {
    setLanguages((prev) => ({ ...prev, [key]: value }));
  };

  return {
    languages,
    updateLanguage,
  };
};
