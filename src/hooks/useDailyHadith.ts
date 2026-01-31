import { useCallback, useEffect, useState } from "react";
import { fetchRelevantHadith } from "@/services/hadithApi";
import { defaultHadithEdition } from "@/services/contentDefaults";
import type { HadithSearchResult } from "@/services/hadithApi";

const DAILY_KEY = "sunnahmind-daily-hadith";

interface DailyHadithRecord {
  date: string;
  edition: string;
  hadith?: HadithSearchResult;
}

const getTodayKey = () => new Date().toISOString().slice(0, 10);

export const useDailyHadith = (editionName = defaultHadithEdition) => {
  const [dailyHadith, setDailyHadith] = useState<HadithSearchResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const loadFromCache = useCallback(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(DAILY_KEY);
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored) as DailyHadithRecord;
      if (parsed.date === getTodayKey() && parsed.edition === editionName) {
        return parsed.hadith ?? null;
      }
      return null;
    } catch {
      return null;
    }
  }, [editionName]);

  const refreshDailyHadith = useCallback(async () => {
    setStatus("loading");
    try {
      const results = await fetchRelevantHadith(
        "patience gratitude mercy",
        editionName,
        80,
        1,
      );
      const hadith = results[0] ?? null;
      setDailyHadith(hadith);
      if (typeof window !== "undefined") {
        const record: DailyHadithRecord = {
          date: getTodayKey(),
          edition: editionName,
          hadith: hadith ?? undefined,
        };
        window.localStorage.setItem(DAILY_KEY, JSON.stringify(record));
      }
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }, [editionName]);

  useEffect(() => {
    const cached = loadFromCache();
    if (cached) {
      setDailyHadith(cached);
      return;
    }
    void refreshDailyHadith();
  }, [loadFromCache, refreshDailyHadith]);

  return { dailyHadith, status, refreshDailyHadith };
};

export default useDailyHadith;
