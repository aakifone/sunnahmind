export interface LearningUnit {
  id: string;
  title: string;
  description: string;
  topics: string[];
  duration: string;
}

export interface IlmPath {
  id: string;
  title: string;
  summary: string;
  units: LearningUnit[];
}

export const ilmPaths: IlmPath[] = [
  {
    id: "foundations",
    title: "Foundations of Worship",
    summary:
      "A structured pathway to understand daily worship, intention, and spiritual presence.",
    units: [
      {
        id: "niyyah",
        title: "Niyyah and Daily Renewal",
        description: "How intention shapes every act of worship.",
        topics: ["sincerity", "renewal", "dua"],
        duration: "20 min",
      },
      {
        id: "salah",
        title: "Khushu in Salah",
        description: "Cultivate focus and humility in prayer.",
        topics: ["prayer", "mindfulness", "adab"],
        duration: "30 min",
      },
      {
        id: "tazkiyah",
        title: "Tazkiyah of the Heart",
        description: "Practical steps for purification and repentance.",
        topics: ["repentance", "gratitude", "patience"],
        duration: "25 min",
      },
    ],
  },
  {
    id: "prophetic-character",
    title: "Prophetic Character",
    summary:
      "Themes of mercy, truthfulness, and service grounded in the Sunnah.",
    units: [
      {
        id: "mercy",
        title: "Mercy in Relationships",
        description: "How the Prophet ﷺ modeled compassion.",
        topics: ["family", "neighbors", "service"],
        duration: "15 min",
      },
      {
        id: "trust",
        title: "Amanah and Trust",
        description: "Living with integrity in daily responsibilities.",
        topics: ["trust", "ethics", "consistency"],
        duration: "18 min",
      },
    ],
  },
];
