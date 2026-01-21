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

interface HadithSectionSummary {
  id: string;
  title?: string;
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

const extractSectionArray = (data: unknown): unknown[] => {
  if (!isRecord(data)) return [];
  if (Array.isArray(data.sections)) return data.sections as unknown[];
  if (Array.isArray(data.section)) return data.section as unknown[];
  if (Array.isArray(data.chapters)) return data.chapters as unknown[];
  if (Array.isArray(data.books)) return data.books as unknown[];
  return [];
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

const normalizeSections = (data: unknown): HadithSectionSummary[] =>
  extractSectionArray(data)
    .map((item) => {
      if (!isRecord(item)) return null;
      const id = getNestedString(item, [
        "section",
        "section_id",
        "id",
        "number",
        "sectionNumber",
        "chapter_id",
        "book_id",
      ]);
      if (!id) return null;
      const title = getNestedString(item, [
        "title",
        "name",
        "chapter",
        "book",
        "section_title",
        "sectionTitle",
      ]);
      return { id, title };
    })
    .filter((item): item is HadithSectionSummary => Boolean(item));

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

const buildKeywords = (query: string): string[] => {
  const stopWords = new Set([
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "you",
    "your",
    "about",
    "from",
    "are",
    "was",
    "were",
    "his",
    "her",
    "their",
    "them",
    "but",
    "not",
    "what",
    "when",
    "how",
    "why",
    "who",
    "which",
    "hadith",
    "quran",
    "sunnah",
  ]);
  return query
    .toLowerCase()
    .split(/\W+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 2 && !stopWords.has(term));
};

const scoreText = (text: string, keywords: string[]): number => {
  let score = 0;
  for (const keyword of keywords) {
    if (!keyword) continue;
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\b`, "gi");
    const matches = text.match(regex);
    if (matches) {
      score += matches.length;
    }
  }
  return score;
};

const scoreHadith = (hadith: HadithSearchResult, keywords: string[]): number => {
  const parts = [hadith.text, hadith.section, hadith.book].filter(Boolean).join(" ");
  if (!parts) return 0;
  return scoreText(parts.toLowerCase(), keywords);
};

const determineTargetCount = (keywordCount: number): number => {
  const base = 3 + Math.min(5, Math.ceil(keywordCount / 2));
  return Math.min(8, Math.max(3, base));
};

export const fetchRelevantHadiths = async (
  query: string,
  editionName: string,
  maxSampleCount = 80,
): Promise<HadithSearchResult[]> => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const keywords = buildKeywords(trimmedQuery);
  if (keywords.length === 0) return [];

  const targetCount = determineTargetCount(keywords.length);
  const results: HadithSearchResult[] = [];
  const scored = new Map<string, { score: number; hadith: HadithSearchResult }>();

  const addCandidates = (candidates: HadithSearchResult[]) => {
    for (const hadith of candidates) {
      const score = scoreHadith(hadith, keywords);
      if (score <= 0) continue;
      const key = `${hadith.editionName}-${hadith.hadithNumber ?? hadith.text ?? ""}`;
      const existing = scored.get(key);
      if (!existing || score > existing.score) {
        scored.set(key, { score, hadith });
      }
    }
  };

  try {
    const editionResult = await getHadithEdition(editionName);
    const sections = normalizeSections(editionResult.data);
    const sectionCandidates = sections
      .map((section) => ({
        section,
        score: section.title ? scoreText(section.title.toLowerCase(), keywords) : 0,
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((item) => item.section);

    const fetchSections = sectionCandidates.length > 0 ? sectionCandidates : sections.slice(0, 3);
    const sectionResults = await Promise.all(
      fetchSections.map((section) => getHadithSection(editionName, section.id)),
    );

    for (const sectionResult of sectionResults) {
      const metadata = extractMetadata(sectionResult.data);
      const hadiths = extractHadithArray(sectionResult.data)
        .map((item) => normalizeHadithItem(item, metadata, editionName, sectionResult.sourceUrl))
        .filter((item): item is HadithSearchResult => Boolean(item));
      addCandidates(hadiths);
    }
  } catch {
    // fall through to hadith number fetch
  }

  const fetchHadithByNumberSafe = async (number: number): Promise<HadithSearchResult[]> => {
    try {
      const hadithResult = await getHadithByNumber(editionName, number);
      const metadata = extractMetadata(hadithResult.data);
      return extractHadithArray(hadithResult.data)
        .map((item) => normalizeHadithItem(item, metadata, editionName, hadithResult.sourceUrl))
        .filter((item): item is HadithSearchResult => Boolean(item));
    } catch {
      return [];
    }
  };

  const batchSize = 6;
  for (let i = 1; i <= maxSampleCount; i += batchSize) {
    const batchNumbers = Array.from({ length: batchSize }, (_, index) => i + index).filter(
      (number) => number <= maxSampleCount,
    );
    const batchResults = await Promise.all(
      batchNumbers.map((number) => fetchHadithByNumberSafe(number)),
    );
    const flattened = batchResults.flat();
    addCandidates(flattened);

    if (scored.size >= targetCount) break;
  }

  const sorted = Array.from(scored.values())
    .sort((a, b) => b.score - a.score)
    .map((item) => item.hadith);

  return sorted.slice(0, targetCount);
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
