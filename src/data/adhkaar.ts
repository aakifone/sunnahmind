export interface AdhkarCategory {
  id: string;
  title: string;
  description: string;
  items: Array<{
    id: string;
    arabic: string;
    transliteration: string;
    translation: string;
    times?: string;
  }>;
}

export const adhkaar: AdhkarCategory[] = [
  {
    id: "morning",
    title: "Morning Adhkaar",
    description: "Begin the day with remembrance, gratitude, and protection.",
    items: [
      {
        id: "morning-1",
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ",
        transliteration: "Asbahna wa asbahal mulku lillah",
        translation: "We have entered a new morning and with it all dominion is Allah's.",
        times: "1x",
      },
      {
        id: "morning-2",
        arabic: "اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ",
        transliteration: "Allahumma anta rabbi la ilaha illa anta",
        translation: "O Allah, You are my Lord; there is no deity except You.",
        times: "1x",
      },
    ],
  },
  {
    id: "evening",
    title: "Evening Adhkaar",
    description: "Close the day with calm remembrance and reliance on Allah.",
    items: [
      {
        id: "evening-1",
        arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ",
        transliteration: "Amsayna wa amsal mulku lillah",
        translation: "We have entered a new evening and with it all dominion is Allah's.",
        times: "1x",
      },
      {
        id: "evening-2",
        arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا",
        transliteration: "Allahumma bika amsayna wa bika asbahna",
        translation: "O Allah, by You we enter the evening and by You we enter the morning.",
        times: "1x",
      },
    ],
  },
  {
    id: "sleep",
    title: "Sleep Adhkaar",
    description: "Remembrances before sleep to end the day with peace.",
    items: [
      {
        id: "sleep-1",
        arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        transliteration: "Bismika Allahumma amutu wa ahya",
        translation: "In Your name, O Allah, I die and I live.",
        times: "1x",
      },
      {
        id: "sleep-2",
        arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
        transliteration: "Allahumma qini 'adhabaka yawma tab'athu 'ibadak",
        translation: "O Allah, protect me from Your punishment on the Day You resurrect Your servants.",
        times: "3x",
      },
    ],
  },
  {
    id: "stress",
    title: "Stress & Relief",
    description: "Short dhikr for anxiety, tension, and seeking calm.",
    items: [
      {
        id: "stress-1",
        arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
        transliteration: "Hasbunallahu wa ni'mal wakeel",
        translation: "Allah is sufficient for us and the best disposer of affairs.",
        times: "7x",
      },
      {
        id: "stress-2",
        arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        transliteration: "La hawla wa la quwwata illa billah",
        translation: "There is no power nor strength except with Allah.",
        times: "as needed",
      },
    ],
  },
  {
    id: "gratitude",
    title: "Gratitude",
    description: "Adhkaar to anchor thankfulness and contentment.",
    items: [
      {
        id: "gratitude-1",
        arabic: "الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ",
        transliteration: "Alhamdu lillahilladhi bini'matihi tatimmus salihat",
        translation: "All praise is for Allah, by whose favor good deeds are completed.",
        times: "1x",
      },
      {
        id: "gratitude-2",
        arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ",
        transliteration: "Allahumma a'inni ala dhikrika wa shukrika",
        translation: "O Allah, help me to remember You and be grateful to You.",
        times: "1x",
      },
    ],
  },
];
