export type OfflineCategory = "hadith" | "quran" | "articles" | "adhkar" | "wallpapers";

const buildKey = (category: OfflineCategory) => `sunnahmind-offline-${category}`;

export const getOfflineItems = <T>(category: OfflineCategory): T[] => {
  if (typeof window === "undefined") return [];
  const stored = window.localStorage.getItem(buildKey(category));
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveOfflineItem = <T>(category: OfflineCategory, item: T, maxItems = 100) => {
  if (typeof window === "undefined") return;
  const existing = getOfflineItems<T>(category);
  const next = [item, ...existing].slice(0, maxItems);
  window.localStorage.setItem(buildKey(category), JSON.stringify(next));
};
