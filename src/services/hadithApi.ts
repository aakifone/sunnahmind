import { buildFawazUrls, fetchJsonWithFallback, getCachedEditions, setCachedEditions } from "@/services/fawazFetch";
import { defaultHadithEdition } from "@/services/contentDefaults";

const HADITH_PRIMARY_BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1";
const HADITH_FALLBACK_BASE = "https://raw.githubusercontent.com/fawazahmed0/hadith-api/1";
const HADITH_EDITIONS_CACHE_KEY = "sunnahmind-hadith-editions";
const HADITH_SELECTED_EDITION_KEY = "sunnahmind-hadith-edition";

export interface HadithEdition {
  name: string;
  language?: string;
  author?: string;
  englishName?: string;
}

export interface HadithEntry {
  hadithNumber?: string;
  text?: string;
  arabicText?: string;
  section?: string;
  book?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const normalizeEdition = (edition: unknown): HadithEdition | null => {
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
    author: typeof edition.author === "string" ? edition.author : undefined,
    englishName: typeof edition.englishName === "string" ? edition.englishName : undefined,
  };
};

const extractHadithEntries = (data: unknown): HadithEntry[] => {
  if (!data) {
    return [];
  }

  if (Array.isArray(data)) {
    return data.flatMap((item) => extractHadithEntries(item));
  }

  if (!isRecord(data)) {
    return [];
  }

  if (Array.isArray(data.hadiths)) {
    return data.hadiths.flatMap((item) => extractHadithEntries(item));
  }

  if (Array.isArray(data.hadith)) {
    return data.hadith.flatMap((item) => extractHadithEntries(item));
  }

  const hadithNumberValue =
    typeof data.hadithNumber === "string" || typeof data.hadithNumber === "number"
      ? String(data.hadithNumber)
      : typeof data.hadithnumber === "string" || typeof data.hadithnumber === "number"
        ? String(data.hadithnumber)
        : typeof data.number === "string" || typeof data.number === "number"
          ? String(data.number)
          : undefined;

  const text = typeof data.text === "string"
    ? data.text
    : typeof data.hadith === "string"
      ? data.hadith
      : typeof data.translation === "string"
        ? data.translation
        : undefined;

  const arabicText = typeof data.arabic === "string"
    ? data.arabic
    : typeof data.arabicText === "string"
      ? data.arabicText
      : undefined;

  const section = typeof data.section === "string"
    ? data.section
    : typeof data.sectionTitle === "string"
      ? data.sectionTitle
      : typeof data.chapter === "string"
        ? data.chapter
        : undefined;

  const book = typeof data.book === "string"
    ? data.book
    : typeof data.bookTitle === "string"
      ? data.bookTitle
      : undefined;

  if (!hadithNumberValue && !text && !arabicText) {
    return [];
  }

  return [
    {
      hadithNumber: hadithNumberValue,
      text,
      arabicText,
      section,
      book,
    },
  ];
};

export const listHadithEditions = async (): Promise<HadithEdition[]> => {
  const cached = getCachedEditions<HadithEdition>(HADITH_EDITIONS_CACHE_KEY);
  if (cached && cached.length > 0) {
    return cached;
  }

  const urls = buildFawazUrls(HADITH_PRIMARY_BASE, HADITH_FALLBACK_BASE, "editions");
  const data = await fetchJsonWithFallback(urls);

  const editions = Array.isArray(data)
    ? data.map(normalizeEdition).filter((edition): edition is HadithEdition => Boolean(edition))
    : [];

  if (editions.length > 0) {
    setCachedEditions(HADITH_EDITIONS_CACHE_KEY, editions);
  }

  return editions;
};

export const getStoredHadithEdition = () => {
  if (typeof window === "undefined") {
    return defaultHadithEdition;
  }

  return window.localStorage.getItem(HADITH_SELECTED_EDITION_KEY) || defaultHadithEdition;
};

export const setStoredHadithEdition = (editionName: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(HADITH_SELECTED_EDITION_KEY, editionName);
};

export const getHadithEdition = async (editionName: string) => {
  const urls = buildFawazUrls(
    HADITH_PRIMARY_BASE,
    HADITH_FALLBACK_BASE,
    `editions/${editionName}`,
  );

  const data = await fetchJsonWithFallback(urls);
  return extractHadithEntries(data);
};

export const getHadithByNumber = async (editionName: string, hadithNo: number | string) => {
  const urls = buildFawazUrls(
    HADITH_PRIMARY_BASE,
    HADITH_FALLBACK_BASE,
    `editions/${editionName}/${hadithNo}`,
  );

  const data = await fetchJsonWithFallback(urls);
  return extractHadithEntries(data)[0] ?? null;
};

export const getHadithSection = async (editionName: string, sectionNo: number | string) => {
  const urls = buildFawazUrls(
    HADITH_PRIMARY_BASE,
    HADITH_FALLBACK_BASE,
    `editions/${editionName}/sections/${sectionNo}`,
  );

  const data = await fetchJsonWithFallback(urls);
  return extractHadithEntries(data);
};
