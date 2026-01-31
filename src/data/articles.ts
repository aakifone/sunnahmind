export interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  language: string;
  content: string;
}

export const articles: Article[] = [
  {
    id: "tazkiyah-daily-heart",
    title: "Guarding the Heart Each Day",
    summary: "A calm daily routine for spiritual focus, gratitude, and ihsan.",
    category: "Tazkiyah",
    tags: ["heart", "gratitude", "daily"],
    language: "English",
    content:
      "Begin each day by renewing your niyyah and seeking Allah's help. Keep a short dhikr practice after Fajr, and protect the heart by lowering the gaze, guarding the tongue, and choosing gentle speech. Return to istighfar often, especially after moments of distraction. Reflect in the evening: What did I learn, and where can I seek forgiveness? These steps are small, but consistency nurtures spiritual steadiness.",
  },
  {
    id: "sunnah-in-actions",
    title: "Living the Sunnah in Simple Actions",
    summary: "Timeless habits of the Prophet ﷺ that anchor daily life.",
    category: "Sunnah",
    tags: ["habits", "prophet", "daily"],
    language: "English",
    content:
      "The Prophet ﷺ modeled care in speech, humility in service, and mercy in every interaction. Revive the Sunnah by greeting with salam, eating mindfully, and keeping gentle manners. Let each action be a form of worship, done with sincerity and excellence. The smallest Sunnah becomes a lantern when practiced regularly.",
  },
  {
    id: "quran-reflection",
    title: "How to Reflect on a Single Ayah",
    summary: "A practical method to ponder Quran verses with depth and calm.",
    category: "Quran",
    tags: ["reflection", "ayah", "learning"],
    language: "English",
    content:
      "Choose one ayah. Read it slowly in Arabic, then in translation. Ask: What does this reveal about Allah? What does it invite me to do today? Write one intention and one small action. Repeat the ayah in dhikr and revisit it at night. Depth is better than volume when building a living relationship with the Quran.",
  },
];
