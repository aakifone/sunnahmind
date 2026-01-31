import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type HadithDisplayFormat = "arabic-only" | "english-only" | "both";
export type ThemePreference = "light" | "dark" | "masjid" | "custom";

interface Preferences {
  hadithDisplayFormat: HadithDisplayFormat;
  themePreference: ThemePreference;
  customTheme: {
    background: string;
    card: string;
    accent: string;
    primary: string;
  };
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
  customTheme: {
    background: "#f8f2e9",
    card: "#fffaf2",
    accent: "#c89b3c",
    primary: "#1f2a44",
  },
  fontSize: "medium",
  textToSpeech: false,
  chatHistoryEnabled: true,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    const stored = localStorage.getItem("hadith-preferences");
    if (!stored) return defaultPreferences;
    try {
      const parsed = JSON.parse(stored) as Partial<Preferences>;
      return {
        ...defaultPreferences,
        ...parsed,
        customTheme: {
          ...defaultPreferences.customTheme,
          ...(parsed.customTheme ?? {}),
        },
      };
    } catch {
      return defaultPreferences;
    }
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
