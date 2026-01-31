import type { Citation } from "@/types/citations";
import type { QuranCitationData } from "@/components/QuranCitation";

const HADITH_CACHE_KEY = "sunnahmind-offline-hadith";
const QURAN_CACHE_KEY = "sunnahmind-offline-quran";

const readCache = <T,>(key: string): T[] => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T[]) : [];
  } catch {
    return [];
  }
};

const writeCache = <T,>(key: string, items: T[]) => {
  localStorage.setItem(key, JSON.stringify(items));
};

export const cacheHadith = (citations: Citation[]) => {
  if (citations.length === 0) return;
  const existing = readCache<Citation>(HADITH_CACHE_KEY);
  const merged = [
    ...citations,
    ...existing.filter(
      (item) =>
        !citations.some(
          (incoming) =>
            incoming.hadithNumber === item.hadithNumber &&
            incoming.collection === item.collection,
        ),
    ),
  ].slice(0, 50);
  writeCache(HADITH_CACHE_KEY, merged);
};

export const cacheQuran = (citations: QuranCitationData[]) => {
  if (citations.length === 0) return;
  const existing = readCache<QuranCitationData>(QURAN_CACHE_KEY);
  const merged = [
    ...citations,
    ...existing.filter(
      (item) =>
        !citations.some(
          (incoming) =>
            incoming.surahNumber === item.surahNumber &&
            incoming.ayahNumber === item.ayahNumber,
        ),
    ),
  ].slice(0, 50);
  writeCache(QURAN_CACHE_KEY, merged);
};

export const getCachedHadith = () => readCache<Citation>(HADITH_CACHE_KEY);
export const getCachedQuran = () => readCache<QuranCitationData>(QURAN_CACHE_KEY);
