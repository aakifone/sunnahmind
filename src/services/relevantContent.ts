import { defaultHadithEdition, defaultQuranArabicEdition, defaultQuranEdition } from "@/services/contentDefaults";
import { buildQuranLink, buildSunnahLink } from "@/services/linkHelpers";
import { getHadithByNumber, getStoredHadithEdition } from "@/services/hadithApi";
import { getQuranVerse, getStoredQuranEdition } from "@/services/quranApi";
import type { HadithCitationData, QuranCitationData } from "@/types/citations";

const HADITH_SAMPLE_NUMBERS = Array.from({ length: 12 }, (_, index) => index + 1);
const QURAN_SAMPLE_VERSES = [
  { surah: 1, ayah: 1 },
  { surah: 1, ayah: 2 },
  { surah: 1, ayah: 3 },
  { surah: 2, ayah: 21 },
  { surah: 2, ayah: 255 },
  { surah: 2, ayah: 286 },
  { surah: 3, ayah: 26 },
  { surah: 3, ayah: 134 },
  { surah: 18, ayah: 10 },
  { surah: 39, ayah: 9 },
  { surah: 49, ayah: 13 },
  { surah: 112, ayah: 1 },
];

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

  return matches.slice(0, 3).map(({ entry, hadithNo, endpoint }) => ({
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

export const fetchRelevantVerses = async (
  query: string,
  editionName: string = getStoredQuranEdition() || defaultQuranEdition,
): Promise<QuranCitationData[]> => {
  const keywords = extractKeywords(query);

  const verseFetches = await Promise.all(
    QURAN_SAMPLE_VERSES.map(async ({ surah, ayah }) => {
      try {
        const [translation, arabic] = await Promise.all([
          getQuranVerse(editionName, surah, ayah),
          getQuranVerse(defaultQuranArabicEdition, surah, ayah),
        ]);

        return {
          surah,
          ayah,
          translation: translation?.text,
          arabicText: arabic?.text,
        };
      } catch {
        return null;
      }
    }),
  );

  const matches = verseFetches
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .filter((item) =>
      matchesKeywords(item.translation, keywords) || matchesKeywords(item.arabicText, keywords),
    );

  return matches.slice(0, 3).map((item) => ({
    surahNumber: item.surah,
    ayahNumber: item.ayah,
    arabicText: item.arabicText,
    translation: item.translation,
    editionName,
    endpoint: `editions/${editionName}/${item.surah}/${item.ayah}`,
    source: "fawazahmed0 quran-api",
    url: buildQuranLink(item.surah, item.ayah),
  }));
};
