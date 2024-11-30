import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Language } from "@/lib/translations";

type LanguageStore = {
  language: Language;
  setLanguage: (language: Language) => void;
};

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: "en" as Language,
      setLanguage: (language: Language) => set({ language }),
    }),
    {
      name: "language-storage",
    }
  )
);
