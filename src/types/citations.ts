export interface HadithCitationData {
  editionName: string;
  hadithNumber?: string;
  section?: string;
  book?: string;
  text?: string;
  arabicText?: string;
  endpoint: string;
  source: "fawazahmed0 hadith-api";
  sunnahLink?: string;
}

export interface QuranCitationData {
  surahNumber: number;
  ayahNumber: number;
  surahName?: string;
  arabicText?: string;
  translation?: string;
  editionName: string;
  endpoint: string;
  source: "fawazahmed0 quran-api";
  url: string;
}
