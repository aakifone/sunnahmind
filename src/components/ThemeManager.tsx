import { useEffect } from "react";
import { usePreferences } from "@/contexts/PreferencesContext";

const ThemeManager = () => {
  const { preferences } = usePreferences();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.removeAttribute("data-theme");

    if (preferences.themePreference === "dark") {
      root.classList.add("dark");
      return;
    }

    root.setAttribute("data-theme", preferences.themePreference);

    if (preferences.themePreference === "custom") {
      const { background, card, accent, primary } = preferences.customTheme;
      root.style.setProperty("--background", hexToHsl(background));
      root.style.setProperty("--card", hexToHsl(card));
      root.style.setProperty("--accent", hexToHsl(accent));
      root.style.setProperty("--primary", hexToHsl(primary));
    } else {
      root.style.removeProperty("--background");
      root.style.removeProperty("--card");
      root.style.removeProperty("--accent");
      root.style.removeProperty("--primary");
    }
  }, [preferences]);

  return null;
};

const hexToHsl = (hex: string) => {
  const sanitized = hex.replace("#", "");
  const bigint = Number.parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }

  const hsl = `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  return hsl;
};

export default ThemeManager;
