import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type HadithDisplayFormat = "arabic-only" | "english-only" | "both";
export type ThemePreference = "light" | "dark" | "masjid";

interface Preferences {
  hadithDisplayFormat: HadithDisplayFormat;
  themePreference: ThemePreference;
  fontSize: "small" | "medium" | "large";
  textToSpeech: boolean;
  chatHistoryEnabled: boolean;
}

interface PreferencesContextType {
  preferences: Preferences;
  updatePreferences: (updates: Partial<Preferences>) => void;
}

const defaultPreferences: Preferences = {
  hadithDisplayFormat: "both",
  themePreference: "light",
  fontSize: "medium",
  textToSpeech: false,
  chatHistoryEnabled: true,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    const stored = localStorage.getItem("hadith-preferences");
    return stored ? JSON.parse(stored) : defaultPreferences;
  });

  useEffect(() => {
    localStorage.setItem("hadith-preferences", JSON.stringify(preferences));
  }, [preferences]);

  const updatePreferences = (updates: Partial<Preferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
};
