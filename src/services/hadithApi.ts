import { fetchJsonWithFallback, FetchResult } from "@/services/fawazFetch";

const PRIMARY_BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/";
const FALLBACK_BASE = "https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/";
const EDITION_CACHE_KEY = "hadith-editions-cache";

export interface HadithEditionSummary {
  name: string;
  collection?: string;
  language?: string;
}

export interface HadithSearchResult {
  editionName: string;
  hadithNumber?: string;
  text?: string;
  arabic?: string;
  section?: string;
  book?: string;
  sourceUrl: string;
  sunnahUrl?: string;
}

const buildUrls = (path: string): string[] => [
  `${PRIMARY_BASE}${path}.min.json`,
  `${PRIMARY_BASE}${path}.json`,
  `${FALLBACK_BASE}${path}.min.json`,
  `${FALLBACK_BASE}${path}.json`,
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getString = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
};

const getNestedString = (record: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    if (key in record) {
      const value = record[key];
      const asString = getString(value);
      if (asString) return asString;
    }
  }
  return undefined;
};

const extractHadithArray = (data: unknown): unknown[] => {
  if (Array.isArray(data)) {
    return data;
  }

  if (isRecord(data)) {
    if (Array.isArray(data.hadiths)) {
      return data.hadiths as unknown[];
    }
    if (Array.isArray(data.hadith)) {
      return data.hadith as unknown[];
    }
    if (isRecord(data.hadith)) {
      return [data.hadith];
    }
    if (Array.isArray(data.items)) {
      return data.items as unknown[];
    }
  }

  return [];
};

const extractMetadata = (data: unknown): Record<string, unknown> => {
  if (!isRecord(data)) return {};

  if (isRecord(data.metadata)) return data.metadata;
  if (isRecord(data.info)) return data.info;
  return {};
};

const normalizeHadithItem = (
  item: unknown,
  metadata: Record<string, unknown>,
  editionName: string,
  sourceUrl: string,
): HadithSearchResult | null => {
  if (!isRecord(item)) return null;

  const text = getNestedString(item, ["text", "english", "translation", "hadith", "body"]);
  const arabic = getNestedString(item, ["arabic", "arabicText", "arabic_text", "arabictext"]);
  const hadithNumber = getNestedString(item, [
    "hadithnumber",
    "hadithNumber",
    "number",
    "hadith_no",
    "hadithNo",
  ]);
  const section = getNestedString(item, ["section", "section_title", "sectionTitle"])
    ?? getNestedString(metadata, ["section", "section_title", "sectionTitle"]);
  const book = getNestedString(item, ["book", "book_title", "bookTitle", "chapter", "chapter_title"])
    ?? getNestedString(metadata, ["book", "book_title", "bookTitle", "chapter", "chapter_title"]);

  return {
    editionName,
    hadithNumber,
    text,
    arabic,
    section,
    book,
    sourceUrl,
    sunnahUrl: buildSunnahLink(editionName, hadithNumber ?? ""),
  };
};

const normalizeEditions = (data: unknown): HadithEditionSummary[] => {
  const editionItems: unknown[] = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.editions)
      ? (data.editions as unknown[])
      : [];

  return editionItems
    .map((item) => {
      if (!isRecord(item)) return null;
      const name = getNestedString(item, ["name", "slug", "id", "edition"]);
      if (!name) return null;

      return {
        name,
        collection: getNestedString(item, ["collection", "title", "english", "arabic"]),
        language: getNestedString(item, ["language", "lang"]),
      };
    })
    .filter((item): item is HadithEditionSummary => Boolean(item));
};

export const listHadithEditions = async (): Promise<HadithEditionSummary[]> => {
  if (typeof window !== "undefined") {
    const cached = window.localStorage.getItem(EDITION_CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as HadithEditionSummary[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        window.localStorage.removeItem(EDITION_CACHE_KEY);
      }
    }
  }

  const result = await fetchJsonWithFallback<unknown>(buildUrls("editions"));
  const editions = normalizeEditions(result.data);

  if (typeof window !== "undefined" && editions.length > 0) {
    window.localStorage.setItem(EDITION_CACHE_KEY, JSON.stringify(editions));
  }

  return editions;
};

export const getHadithEdition = async (editionName: string): Promise<FetchResult<unknown>> =>
  fetchJsonWithFallback<unknown>(buildUrls(`editions/${editionName}`));

export const getHadithByNumber = async (
  editionName: string,
  hadithNo: number | string,
): Promise<FetchResult<unknown>> =>
  fetchJsonWithFallback<unknown>(buildUrls(`editions/${editionName}/${hadithNo}`));

export const getHadithSection = async (
  editionName: string,
  sectionNo: number | string,
): Promise<FetchResult<unknown>> =>
  fetchJsonWithFallback<unknown>(buildUrls(`editions/${editionName}/sections/${sectionNo}`));

export const getHadithApiInfo = async (): Promise<FetchResult<unknown>> =>
  fetchJsonWithFallback<unknown>(buildUrls("info"));

export const fetchRelevantHadith = async (
  query: string,
  editionName: string,
  maxSampleCount = 200,
  maxResults = 12,
): Promise<HadithSearchResult[]> => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const keywords = trimmedQuery
    .toLowerCase()
    .split(/\W+/)
    .map((term) => term.trim())
    .filter(Boolean);

  const matchesQuery = (text?: string) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    return keywords.some((term) => lower.includes(term));
  };

  const results: HadithSearchResult[] = [];

  try {
    const sectionResult = await getHadithSection(editionName, 1);
    const metadata = extractMetadata(sectionResult.data);
    const hadiths = extractHadithArray(sectionResult.data)
      .map((item) => normalizeHadithItem(item, metadata, editionName, sectionResult.sourceUrl))
      .filter((item): item is HadithSearchResult => Boolean(item));

    for (const hadith of hadiths) {
      if (matchesQuery(hadith.text)) {
        results.push(hadith);
        if (results.length >= maxResults) return results;
      }
    }

    if (results.length > 0) {
      return results;
    }
  } catch {
    // fall through to hadith number fetch
  }

  for (let i = 1; i <= maxSampleCount && results.length < maxResults; i += 1) {
    try {
      const hadithResult = await getHadithByNumber(editionName, i);
      const metadata = extractMetadata(hadithResult.data);
      const hadiths = extractHadithArray(hadithResult.data)
        .map((item) => normalizeHadithItem(item, metadata, editionName, hadithResult.sourceUrl))
        .filter((item): item is HadithSearchResult => Boolean(item));

      for (const hadith of hadiths) {
        if (matchesQuery(hadith.text)) {
          results.push(hadith);
          if (results.length >= maxResults) return results;
        }
      }
    } catch {
      // ignore and continue
    }
  }

  return results;
};

const SUNNAH_SLUGS: Record<string, string> = {
  "eng-bukhari": "bukhari",
  "eng-muslim": "muslim",
  "eng-abudawud": "abudawud",
  "eng-tirmidhi": "tirmidhi",
  "eng-nasai": "nasai",
  "eng-ibnmajah": "ibnmajah",
};

export const buildSunnahLink = (editionName: string, hadithNo: string | number): string | null => {
  const fallbackSlug = editionName.startsWith("eng-")
    ? editionName.replace("eng-", "")
    : undefined;
  const slug = SUNNAH_SLUGS[editionName] ?? fallbackSlug;
  const number = getString(hadithNo);
  if (!slug || !number) return null;
  return `https://sunnah.com/${slug}:${number}`;
};
