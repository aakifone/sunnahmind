export interface IlmTopic {
  id: string;
  title: string;
  summary: string;
  themes: string[];
  hadithCollections: string[];
  quranFocus: string[];
}

export const ilmTopics: IlmTopic[] = [
  {
    id: "aqidah-foundations",
    title: "Foundations of Aqidah",
    summary: "Core beliefs about Allah, His names, and the unseen with clarity and balance.",
    themes: ["Tawhid", "Prophethood", "Hereafter"],
    hadithCollections: ["Riyad as-Salihin", "Sahih Muslim"],
    quranFocus: ["Surah Al-Ikhlas", "Surah Al-Baqarah 255"],
  },
  {
    id: "prophetic-character",
    title: "Prophetic Character",
    summary: "Study the manners, mercy, and leadership of the Prophet ﷺ.",
    themes: ["Mercy", "Patience", "Trustworthiness"],
    hadithCollections: ["Shama'il Muhammadiyah", "Sahih Bukhari"],
    quranFocus: ["Surah Al-Ahzab 21"],
  },
  {
    id: "family-life",
    title: "Family & Community",
    summary: "Guidance on kindness, rights, and community care.",
    themes: ["Parents", "Marriage", "Neighbors"],
    hadithCollections: ["Sunan Abu Dawud", "Sunan Ibn Majah"],
    quranFocus: ["Surah An-Nisa"],
  },
];
