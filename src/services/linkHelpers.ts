const SUNNAH_COLLECTION_MAP: Record<string, string> = {
  "eng-bukhari": "bukhari",
  "eng-muslim": "muslim",
  "eng-abudawud": "abudawud",
  "eng-tirmidhi": "tirmidhi",
  "eng-nasai": "nasai",
  "eng-ibnmajah": "ibnmajah",
};

export const buildSunnahLink = (editionName: string, hadithNo: string | number) => {
  if (!hadithNo) {
    return "";
  }

  const slug = SUNNAH_COLLECTION_MAP[editionName] ?? editionName.replace(/^eng-/, "");
  return `https://sunnah.com/${slug}:${hadithNo}`;
};

export const buildQuranLink = (chapterNo: number, verseNo: number) => {
  return `https://quran.com/${chapterNo}/${verseNo}`;
};
