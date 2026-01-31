import { useEffect } from "react";
import { usePreferences } from "@/contexts/PreferencesContext";

const applyCustomTheme = (theme: {
  background: string;
  card: string;
  accent: string;
  primary: string;
}) => {
  const root = document.documentElement;
  root.style.setProperty("--background", theme.background);
  root.style.setProperty("--card", theme.card);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--ring", theme.accent);
};

const applyMasjidTheme = () => {
  const root = document.documentElement;
  root.style.setProperty("--background", "140 30% 95%");
  root.style.setProperty("--card", "140 30% 98%");
  root.style.setProperty("--accent", "145 45% 45%");
  root.style.setProperty("--primary", "145 35% 22%");
  root.style.setProperty("--ring", "145 45% 45%");
};

const clearInlineTheme = () => {
  const root = document.documentElement;
  ["--background", "--card", "--accent", "--primary", "--ring"].forEach((variable) =>
    root.style.removeProperty(variable),
  );
};

const ThemeController = () => {
  const { preferences } = usePreferences();

  useEffect(() => {
    const root = document.documentElement;
    if (preferences.themePreference === "dark") {
      root.classList.add("dark");
      clearInlineTheme();
      return;
    }

    root.classList.remove("dark");

    if (preferences.themePreference === "masjid") {
      applyMasjidTheme();
    } else if (preferences.themePreference === "custom") {
      applyCustomTheme(preferences.customTheme);
    } else {
      clearInlineTheme();
    }
  }, [preferences]);

  return null;
};

export default ThemeController;
