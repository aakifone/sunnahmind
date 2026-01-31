import { createContext, useContext, useMemo, useState } from "react";
import { defaultLanguage, getLanguageByCode, languageOptions, type LanguageOption } from "@/lib/languages";

interface ContentPreferencesContextValue {
  hadithLanguage: LanguageOption;
  quranLanguage: LanguageOption;
  articleLanguage: LanguageOption;
  setHadithLanguage: (code: string) => void;
  setQuranLanguage: (code: string) => void;
  setArticleLanguage: (code: string) => void;
  options: LanguageOption[];
}

const STORAGE_KEY = "sunnahmind-content-languages";

const ContentPreferencesContext = createContext<ContentPreferencesContextValue | undefined>(undefined);

export const ContentPreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
  const parsed = stored ? JSON.parse(stored) : null;

  const [hadithLanguage, setHadithLanguageState] = useState<LanguageOption>(
    parsed?.hadith ? getLanguageByCode(parsed.hadith) : defaultLanguage,
  );
  const [quranLanguage, setQuranLanguageState] = useState<LanguageOption>(
    parsed?.quran ? getLanguageByCode(parsed.quran) : defaultLanguage,
  );
  const [articleLanguage, setArticleLanguageState] = useState<LanguageOption>(
    parsed?.articles ? getLanguageByCode(parsed.articles) : defaultLanguage,
  );

  const persist = (next: { hadith: string; quran: string; articles: string }) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const setHadithLanguage = (code: string) => {
    const next = getLanguageByCode(code);
    setHadithLanguageState(next);
    persist({ hadith: next.code, quran: quranLanguage.code, articles: articleLanguage.code });
  };

  const setQuranLanguage = (code: string) => {
    const next = getLanguageByCode(code);
    setQuranLanguageState(next);
    persist({ hadith: hadithLanguage.code, quran: next.code, articles: articleLanguage.code });
  };

  const setArticleLanguage = (code: string) => {
    const next = getLanguageByCode(code);
    setArticleLanguageState(next);
    persist({ hadith: hadithLanguage.code, quran: quranLanguage.code, articles: next.code });
  };

  const value = useMemo(
    () => ({
      hadithLanguage,
      quranLanguage,
      articleLanguage,
      setHadithLanguage,
      setQuranLanguage,
      setArticleLanguage,
      options: languageOptions,
    }),
    [articleLanguage, hadithLanguage, quranLanguage, setArticleLanguage, setHadithLanguage, setQuranLanguage],
  );

  return (
    <ContentPreferencesContext.Provider value={value}>
      {children}
    </ContentPreferencesContext.Provider>
  );
};

export const useContentPreferences = () => {
  const context = useContext(ContentPreferencesContext);
  if (!context) {
    throw new Error("useContentPreferences must be used within ContentPreferencesProvider");
  }
  return context;
};
