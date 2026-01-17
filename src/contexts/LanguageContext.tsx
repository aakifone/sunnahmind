import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  defaultLanguage,
  getLanguageByCode,
  languageOptions,
  type LanguageOption,
} from "@/lib/languages";

type LanguageContextValue = {
  language: LanguageOption;
  setLanguage: (code: string) => void;
  options: LanguageOption[];
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageOption>(defaultLanguage);

  useEffect(() => {
    const storedLanguage = localStorage.getItem("preferredLanguage");
    if (storedLanguage) {
      setLanguageState(getLanguageByCode(storedLanguage));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("preferredLanguage", language.code);
  }, [language.code]);

  const setLanguage = (code: string) => {
    setLanguageState(getLanguageByCode(code));
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      options: languageOptions,
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
