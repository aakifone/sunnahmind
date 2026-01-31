export interface ArticleTranslation {
  language: string;
  title: string;
  summary: string;
  body: string[];
}

export interface Article {
  id: string;
  category: string;
  tags: string[];
  updatedAt: string;
  translations: ArticleTranslation[];
}

export const articles: Article[] = [
  {
    id: "intention",
    category: "Purification of the Heart",
    tags: ["niyyah", "daily-practice", "character"],
    updatedAt: "2025-01-10",
    translations: [
      {
        language: "en",
        title: "Intentions That Shape Daily Worship",
        summary:
          "A practical reflection on keeping niyyah sincere in everyday worship and service.",
        body: [
          "Every act of worship begins with intention. The Prophet ﷺ taught that deeds are judged by intentions, reminding us that what we carry in the heart shapes the value of our actions.",
          "Sincere intention is not a single moment—it is renewed. A quiet pause before prayer, charity, or study turns routine into worship.",
          "Try asking: Who am I doing this for? When the answer is Allah, the smallest deed becomes weighty.",
          "Keep a gentle routine: before you begin, whisper a short dua asking for sincerity. This simple habit keeps the heart awake and grounded.",
        ],
      },
      {
        language: "ar",
        title: "النية التي تهذب العبادة اليومية",
        summary:
          "تأمل عملي في تجديد النية والإخلاص في العبادة والخدمة اليومية.",
        body: [
          "كل عبادة تبدأ بنية. وقد علّمنا النبي ﷺ أن الأعمال بالنيات، لتبقى القلوب يقظة في كل ما نعمل.",
          "الإخلاص ليس لحظة عابرة، بل يتجدد مع كل فعل. وقفة قصيرة قبل الصلاة أو الصدقة تحوّل العادة إلى عبادة.",
          "اسأل نفسك: لمن أفعل هذا؟ فإذا كان لله تعالى، صار العمل الصغير عظيماً.",
          "حافظ على عادة لطيفة: قبل البدء، ادعُ بدعاء يسير للإخلاص، فيثبت القلب ويطمئن.",
        ],
      },
    ],
  },
  {
    id: "sabr",
    category: "Character",
    tags: ["sabr", "trials", "hope"],
    updatedAt: "2025-01-12",
    translations: [
      {
        language: "en",
        title: "Sabr in the Middle of a Busy Day",
        summary:
          "How to practice patience with yourself and others in small daily moments.",
        body: [
          "Patience is not only for hardship. It is also for traffic, unfinished tasks, and quiet disappointments.",
          "Sabr begins by slowing down. When a response is delayed, a gentle breath can keep the tongue from harm.",
          "Remember that Allah sees the struggle even when no one else does. Reward is tied to endurance.",
          "Pick one moment today to respond with calm. That is sabr in action.",
        ],
      },
      {
        language: "ur",
        title: "مصروف دن میں صبر",
        summary:
          "روزمرہ کے چھوٹے لمحوں میں صبر کی مشق کرنے کی عملی رہنمائی۔",
        body: [
          "صبر صرف بڑی آزمائشوں کے لیے نہیں، بلکہ روزمرہ کے کاموں میں بھی ضروری ہے۔",
          "سکون کے ساتھ سانس لینا زبان اور دل کو بے صبری سے بچاتا ہے۔",
          "اللہ تعالیٰ ہر جدوجہد کو دیکھتا ہے، اجر صبر کے ساتھ جڑا ہے۔",
          "آج ایک لمحہ چنیں اور نرمی سے ردِعمل دیں، یہی صبر ہے۔",
        ],
      },
    ],
  },
  {
    id: "dhikr",
    category: "Daily Remembrance",
    tags: ["dhikr", "morning", "evening"],
    updatedAt: "2025-01-08",
    translations: [
      {
        language: "en",
        title: "Anchoring the Day with Dhikr",
        summary:
          "A calm routine for morning and evening remembrance that brings stability.",
        body: [
          "Dhikr is a gentle anchor. Morning remembrance sets a peaceful rhythm, while evening dhikr softens the heart.",
          "Begin with the simplest phrases: SubhanAllah, Alhamdulillah, Allahu Akbar. Consistency matters more than quantity.",
          "Make dhikr part of a routine: after Fajr or before sleep. Small cycles, repeated daily, keep the soul grounded.",
          "When the heart feels heavy, dhikr becomes light. Let it be a steady companion.",
        ],
      },
      {
        language: "tr",
        title: "Zikrin Günlük Huzuru",
        summary:
          "Sabah ve akşam zikirleriyle günü dengeleyen sakin bir rutin.",
        body: [
          "Zikir kalbe huzur verir. Sabah zikirleri güne düzen, akşam zikirleri ise sükûnet getirir.",
          "En basit cümlelerle başlayın: Sübhanallah, Elhamdülillah, Allahu Ekber. Az ama sürekli olması önemlidir.",
          "Zikri bir alışkanlık hâline getirin: sabah namazından sonra veya uyumadan önce.",
          "Kalp ağırlaştığında zikir hafifletir. Zikriniz size eşlik etsin.",
        ],
      },
    ],
  },
];
