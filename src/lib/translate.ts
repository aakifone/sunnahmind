const TRANSLATE_ENDPOINTS = [
  "https://libretranslate.com/translate",
  "https://translate.argosopentech.com/translate",
];

const MYMEMORY_ENDPOINT = "https://api.mymemory.translated.net/get";

const ARABIC_REGEX =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const ARABIC_REGEX_GROUP =
  /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+)/g;

export const containsArabic = (text: string) => ARABIC_REGEX.test(text);

const translatePlainText = async (text: string, target: string) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/translate-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          source: "auto",
          target,
          format: "text",
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as { translatedText?: string };
        if (data.translatedText) {
          return data.translatedText;
        }
      }
    } catch (error) {
      console.warn("Supabase translation request failed:", error);
    }
  }

  try {
    const response = await fetch(
      `${MYMEMORY_ENDPOINT}?q=${encodeURIComponent(text)}&langpair=en|${encodeURIComponent(
        target,
      )}`,
    );
    if (response.ok) {
      const data = (await response.json()) as {
        responseData?: { translatedText?: string };
      };
      const translatedText = data.responseData?.translatedText;
      if (translatedText) {
        return translatedText;
      }
    }
  } catch (error) {
    console.warn("MyMemory translation request failed:", error);
  }

  for (const endpoint of TRANSLATE_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          source: "auto",
          target,
          format: "text",
        }),
      });

      if (!response.ok) {
        continue;
      }

      const data = (await response.json()) as { translatedText?: string };
      if (data.translatedText) {
        return data.translatedText;
      }
    } catch (error) {
      console.warn("Translation request failed:", error);
    }
  }

  return text;
};

export const translateText = async (
  text: string,
  target: string,
): Promise<string> => {
  if (!text.trim()) {
    return text;
  }
  if (target === "en") {
    return text;
  }

  if (containsArabic(text)) {
    const parts = text.split(ARABIC_REGEX_GROUP);
    const translatedParts = await Promise.all(
      parts.map(async (part) => {
        if (!part.trim()) {
          return part;
        }
        if (ARABIC_REGEX.test(part)) {
          return part;
        }
        return translatePlainText(part, target);
      }),
    );
    return translatedParts.join("");
  }

  return translatePlainText(text, target);
};
