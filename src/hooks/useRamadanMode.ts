import { useCallback, useMemo, useState } from "react";

const STORAGE_KEY = "sunnahmind-ramadan-mode";

const getIslamicMonth = () => {
  try {
    const formatter = new Intl.DateTimeFormat("en-TN-u-ca-islamic", {
      month: "numeric",
    });
    const month = formatter.format(new Date());
    const parsed = Number.parseInt(month, 10);
    return Number.isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
};

export const useRamadanMode = () => {
  const islamicMonth = getIslamicMonth();
  const inRamadanSeason = islamicMonth === 9;

  const [override, setOverride] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? stored === "true" : inRamadanSeason;
  });

  const isRamadanMode = useMemo(() => {
    if (typeof window === "undefined") return inRamadanSeason;
    return override;
  }, [inRamadanSeason, override]);

  const toggleRamadanMode = useCallback(() => {
    setOverride((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      }
      return next;
    });
  }, []);

  return {
    isRamadanMode,
    inRamadanSeason,
    toggleRamadanMode,
  };
};

export default useRamadanMode;
