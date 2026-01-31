import { useEffect, useMemo, useState } from "react";

const RAMADAN_STORAGE_KEY = "sunnahmind-ramadan-mode";

const detectRamadan = () => {
  try {
    const formatter = new Intl.DateTimeFormat("en-u-ca-islamic", {
      month: "numeric",
    });
    const parts = formatter.formatToParts(new Date());
    const month = parts.find((part) => part.type === "month")?.value;
    return Number(month) === 9;
  } catch {
    return false;
  }
};

export const useRamadanMode = () => {
  const autoRamadan = useMemo(() => detectRamadan(), []);
  const [isRamadanMode, setIsRamadanMode] = useState(() => {
    const stored = localStorage.getItem(RAMADAN_STORAGE_KEY);
    if (stored === null) {
      return autoRamadan;
    }
    return stored === "true";
  });

  useEffect(() => {
    localStorage.setItem(RAMADAN_STORAGE_KEY, String(isRamadanMode));
  }, [isRamadanMode]);

  return {
    isRamadanMode,
    setIsRamadanMode,
    autoRamadan,
  };
};
