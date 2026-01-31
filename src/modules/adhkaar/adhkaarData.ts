export interface AdhkarEntry {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference?: string;
}

export interface AdhkarCategory {
  id: string;
  title: string;
  description: string;
  entries: AdhkarEntry[];
}

export const adhkaarCategories: AdhkarCategory[] = [
  {
    id: "morning",
    title: "Morning Remembrance",
    description: "Begin the day with protection and gratitude.",
    entries: [
      {
        id: "morning-1",
        title: "Seeking protection",
        arabic: "أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        transliteration: "A‘ūdhu bi-kalimātillāhi at-tāmmāti min sharri mā khalaq.",
        translation:
          "I seek refuge in the perfect words of Allah from the evil of what He has created.",
        reference: "Muslim 2708",
      },
      {
        id: "morning-2",
        title: "Morning gratitude",
        arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا",
        transliteration: "Allāhumma bika aṣbaḥnā wa bika amsaynā.",
        translation: "O Allah, by You we enter the morning and by You we enter the evening.",
        reference: "Tirmidhi 3391",
      },
    ],
  },
  {
    id: "evening",
    title: "Evening Remembrance",
    description: "Close the day with peace and reliance upon Allah.",
    entries: [
      {
        id: "evening-1",
        title: "Evening trust",
        arabic: "حَسْبِيَ اللهُ لَا إِلَهَ إِلَّا هُوَ",
        transliteration: "Ḥasbiyallāhu lā ilāha illā Huwa.",
        translation: "Allah is sufficient for me; there is no deity except Him.",
        reference: "Quran 9:129",
      },
      {
        id: "evening-2",
        title: "Evening refuge",
        arabic: "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ",
        transliteration: "Allāhumma innī amsaytu ush-hiduka wa ush-hidu ḥamalata ‘arshik.",
        translation:
          "O Allah, as evening comes I testify to You and the bearers of Your Throne...",
        reference: "Abu Dawud 5075",
      },
    ],
  },
  {
    id: "sleep",
    title: "Before Sleep",
    description: "End the night with calm remembrance.",
    entries: [
      {
        id: "sleep-1",
        title: "Light of the night",
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        transliteration: "Bismika Allāhumma amūtu wa aḥyā.",
        translation: "In Your name, O Allah, I die and I live.",
        reference: "Bukhari 6324",
      },
    ],
  },
  {
    id: "gratitude",
    title: "Gratitude & Relief",
    description: "For stress, gratitude, and emotional steadiness.",
    entries: [
      {
        id: "gratitude-1",
        title: "Relief of the heart",
        arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
        transliteration: "Lā ilāha illā Anta subḥānaka innī kuntu minaẓ-ẓālimīn.",
        translation: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
        reference: "Quran 21:87",
      },
    ],
  },
];
