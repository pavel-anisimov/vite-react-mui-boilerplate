export const SUPPORTED_LANGS = ["en", "ru", "pl"] as const;

export const DEFAULT_LANGUAGE = "US" as const;

export type SupportedLang = typeof SUPPORTED_LANGS[number];

export const LANG_TO_FLAG = new Map<SupportedLang, string>([
  ["en", "US"],
  ["ru", "RU"],
  ["pl", "PL"],
]);

export const LANG_LABELS: Record<SupportedLang, string> = {
  en: "English",
  ru: "Русский",
  pl: "Polski",
};

