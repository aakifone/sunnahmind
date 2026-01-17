export type LanguageOption = {
  code: string;
  label: string;
  translateCode: string;
};

export const languageOptions: LanguageOption[] = [
  { code: "af", label: "Afrikaans", translateCode: "af" },
  { code: "ar", label: "Arabic", translateCode: "ar" },
  { code: "bn", label: "Bengali", translateCode: "bn" },
  { code: "nl", label: "Dutch", translateCode: "nl" },
  { code: "en", label: "English", translateCode: "en" },
  { code: "fil", label: "Filipino (Tagalog)", translateCode: "tl" },
  { code: "fr", label: "French", translateCode: "fr" },
  { code: "de", label: "German", translateCode: "de" },
  { code: "gu", label: "Gujarati", translateCode: "gu" },
  { code: "hi", label: "Hindi", translateCode: "hi" },
  { code: "id", label: "Indonesian", translateCode: "id" },
  { code: "it", label: "Italian", translateCode: "it" },
  { code: "ja", label: "Japanese", translateCode: "ja" },
  { code: "kn", label: "Kannada", translateCode: "kn" },
  { code: "ko", label: "Korean", translateCode: "ko" },
  { code: "ml", label: "Malayalam", translateCode: "ml" },
  { code: "zh", label: "Mandarin Chinese", translateCode: "zh" },
  { code: "fa", label: "Persian (Farsi)", translateCode: "fa" },
  { code: "pt", label: "Portuguese", translateCode: "pt" },
  { code: "pa", label: "Punjabi", translateCode: "pa" },
  { code: "ru", label: "Russian", translateCode: "ru" },
  { code: "es", label: "Spanish", translateCode: "es" },
  { code: "sw", label: "Swahili", translateCode: "sw" },
  { code: "ta", label: "Tamil", translateCode: "ta" },
  { code: "th", label: "Thai", translateCode: "th" },
  { code: "tr", label: "Turkish", translateCode: "tr" },
  { code: "ur", label: "Urdu", translateCode: "ur" },
  { code: "vi", label: "Vietnamese", translateCode: "vi" },
];

export const defaultLanguage =
  languageOptions.find((language) => language.code === "en") ??
  languageOptions[0];

export const getLanguageByCode = (code: string) =>
  languageOptions.find((language) => language.code === code) ?? defaultLanguage;
