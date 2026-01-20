import { buildFawazUrls, fetchJsonWithFallback, getCachedEditions, setCachedEditions } from "@/services/fawazFetch";
import { defaultQuranEdition } from "@/services/contentDefaults";

const QURAN_PRIMARY_BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1";
const QURAN_FALLBACK_BASE = "https://raw.githubusercontent.com/fawazahmed0/quran-api/1";
const QURAN_EDITIONS_CACHE_KEY = "sunnahmind-quran-editions";
const QURAN_SELECTED_EDITION_KEY = "sunnahmind-quran-edition";

export interface QuranEdition {
  name: string;
  language?: string;
  englishName?: string;
  author?: string;
}

export interface QuranVerse {
  text?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeEdition = (edition: unknown): QuranEdition | null => {
  if (!isRecord(edition)) {
    return null;
  }

  const name = typeof edition.name === "string"
    ? edition.name
    : typeof edition.edition === "string"
      ? edition.edition
      : null;

  if (!name) {
    return null;
  }

  return {
    name,
    language: typeof edition.language === "string" ? edition.language : undefined,
    englishName: typeof edition.englishName === "string" ? edition.englishName : undefined,
    author: typeof edition.author === "string" ? edition.author : undefined,
  };
};

const extractVerseText = (data: unknown): QuranVerse | null => {
  if (!data) {
    return null;
  }

  if (typeof data === "string") {
    return { text: data };
  }

  if (Array.isArray(data)) {
    const first = data.map((item) => extractVerseText(item)).find(Boolean);
    return first ?? null;
  }

  if (!isRecord(data)) {
    return null;
  }

  if (typeof data.text === "string") {
    return { text: data.text };
  }

  if (typeof data.verse === "string") {
    return { text: data.verse };
  }

  if (typeof data.translation === "string") {
    return { text: data.translation };
  }

  if (isRecord(data.verse) && typeof data.verse.text === "string") {
    return { text: data.verse.text };
  }

  if (isRecord(data.ayah) && typeof data.ayah.text === "string") {
    return { text: data.ayah.text };
  }

  return null;
};

const extractChapterVerses = (data: unknown): QuranVerse[] => {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data.map((item) => extractVerseText(item)).filter((item): item is QuranVerse => Boolean(item));
  }

  if (!isRecord(data)) {
    return [];
  }

  if (Array.isArray(data.verses)) {
    return data.verses
      .map((item: unknown) => extractVerseText(item))
      .filter((item): item is QuranVerse => Boolean(item));
  }

  if (Array.isArray(data.ayahs)) {
    return data.ayahs
      .map((item: unknown) => extractVerseText(item))
      .filter((item): item is QuranVerse => Boolean(item));
  }

  if (isRecord(data.chapter) && Array.isArray(data.chapter.verses)) {
    return data.chapter.verses
      .map((item: unknown) => extractVerseText(item))
      .filter((item): item is QuranVerse => Boolean(item));
  }

  return [];
};

export const listQuranEditions = async (): Promise<QuranEdition[]> => {
  const cached = getCachedEditions<QuranEdition>(QURAN_EDITIONS_CACHE_KEY);
  if (cached && cached.length > 0) {
    return cached;
  }

  const urls = buildFawazUrls(QURAN_PRIMARY_BASE, QURAN_FALLBACK_BASE, "editions");
  const data = await fetchJsonWithFallback(urls);

  const editions = Array.isArray(data)
    ? data.map(normalizeEdition).filter((edition): edition is QuranEdition => Boolean(edition))
    : [];

  if (editions.length > 0) {
    setCachedEditions(QURAN_EDITIONS_CACHE_KEY, editions);
  }

  return editions;
};

export const getStoredQuranEdition = () => {
  if (typeof window === "undefined") {
    return defaultQuranEdition;
  }

  return window.localStorage.getItem(QURAN_SELECTED_EDITION_KEY) || defaultQuranEdition;
};

export const setStoredQuranEdition = (editionName: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(QURAN_SELECTED_EDITION_KEY, editionName);
};

export const getQuranChapter = async (editionName: string, chapterNo: number | string) => {
  const urls = buildFawazUrls(
    QURAN_PRIMARY_BASE,
    QURAN_FALLBACK_BASE,
    `editions/${editionName}/${chapterNo}`,
  );

  const data = await fetchJsonWithFallback(urls);
  return extractChapterVerses(data);
};

export const getQuranVerse = async (
  editionName: string,
  chapterNo: number | string,
  verseNo: number | string,
) => {
  const urls = buildFawazUrls(
    QURAN_PRIMARY_BASE,
    QURAN_FALLBACK_BASE,
    `editions/${editionName}/${chapterNo}/${verseNo}`,
  );

  const data = await fetchJsonWithFallback(urls);
  return extractVerseText(data);
};
