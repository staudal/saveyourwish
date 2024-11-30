"use client";

import { useLanguageStore } from "@/lib/stores/language-store";
import { translations, type TranslationType } from "@/lib/translations";

export function useTranslations(): TranslationType {
  const { language } = useLanguageStore();
  return translations[language];
}
