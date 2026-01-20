import { defaultHadithEdition } from "@/services/contentDefaults";
import { buildSunnahLink } from "@/services/linkHelpers";
import { getHadithByNumber, getStoredHadithEdition } from "@/services/hadithApi";
import type { HadithCitationData } from "@/types/citations";

const HADITH_SAMPLE_NUMBERS = Array.from({ length: 12 }, (_, index) => index + 1);
const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "have",
  "from",
  "about",
  "your",
  "what",
  "which",
  "when",
  "where",
  "who",
  "why",
  "how",
  "islam",
  "allah",
  "hadith",
  "quran",
]);

const extractKeywords = (query: string) => {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .map((word) => word.trim())
        .filter((word) => word.length > 2 && !STOP_WORDS.has(word)),
    ),
  );
};

const matchesKeywords = (text: string | undefined, keywords: string[]) => {
  if (!text || keywords.length === 0) {
    return false;
  }

  const lower = text.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword));
};

export const fetchRelevantHadith = async (
  query: string,
  editionName: string = getStoredHadithEdition() || defaultHadithEdition,
): Promise<HadithCitationData[]> => {
  const keywords = extractKeywords(query);
  const fetches = await Promise.all(
    HADITH_SAMPLE_NUMBERS.map(async (hadithNo) => {
      try {
        const entry = await getHadithByNumber(editionName, hadithNo);
        return entry
          ? {
              entry,
              hadithNo,
            }
          : null;
      } catch {
        return null;
      }
    }),
  );

  const matches = fetches
    .filter(
      (
        item,
      ): item is { entry: NonNullable<Awaited<ReturnType<typeof getHadithByNumber>>>; hadithNo: number } =>
        Boolean(item),
    )
    .map(({ entry, hadithNo }) => {
      const endpoint = `editions/${editionName}/${hadithNo}`;
      const textMatches = matchesKeywords(entry.text, keywords) || matchesKeywords(entry.arabicText, keywords);

      return {
        entry,
        hadithNo,
        endpoint,
        matches: textMatches,
      };
    })
    .filter((item) => item.matches);

  const fallback = fetches
    .filter(
      (
        item,
      ): item is { entry: NonNullable<Awaited<ReturnType<typeof getHadithByNumber>>>; hadithNo: number } =>
        Boolean(item),
    )
    .slice(0, 3)
    .map(({ entry, hadithNo }) => ({
      entry,
      hadithNo,
      endpoint: `editions/${editionName}/${hadithNo}`,
    }));

  const selected = matches.length > 0 ? matches.slice(0, 3) : fallback;

  return selected.map(({ entry, hadithNo, endpoint }) => ({
    editionName,
    hadithNumber: entry.hadithNumber || String(hadithNo),
    section: entry.section,
    book: entry.book,
    text: entry.text,
    arabicText: entry.arabicText,
    endpoint,
    source: "fawazahmed0 hadith-api",
    sunnahLink: buildSunnahLink(editionName, entry.hadithNumber || String(hadithNo)),
  }));
};
