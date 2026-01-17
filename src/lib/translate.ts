const TRANSLATE_ENDPOINTS = [
  "https://libretranslate.com/translate",
  "https://translate.argosopentech.com/translate",
];

const ARABIC_REGEX =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

export const containsArabic = (text: string) => ARABIC_REGEX.test(text);

export const translateText = async (
  text: string,
  target: string,
): Promise<string> => {
  if (!text.trim()) {
    return text;
  }
  if (containsArabic(text)) {
    return text;
  }
  if (target === "en") {
    return text;
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
