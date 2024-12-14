import { MetadataExtractorWithClean, Selector } from "./types";
import { extractFromSelectors, extractFromJsonLd } from "./utils";
import { MinimalDocument } from "../fetchers/types";
import { TITLE_SELECTORS, TITLE_CLEANING } from "@/constants";

export const titleExtractor: MetadataExtractorWithClean = {
  extract: (document: Document | MinimalDocument): string | undefined => {
    // First try JSON-LD
    const jsonLdTitle = extractFromJsonLd(document, [
      ["name"],
      ["headline"],
      ["product", "name"],
    ]);
    if (jsonLdTitle?.trim()) {
      return titleExtractor.clean(jsonLdTitle);
    }

    // Then try selectors
    const titleSelectors: Selector[] = [
      ...TITLE_SELECTORS.META,
      ...TITLE_SELECTORS.HTML,
    ];

    const rawTitle = extractFromSelectors(document, titleSelectors);
    if (!rawTitle?.trim()) return undefined;

    return titleExtractor.clean(rawTitle);
  },

  clean: (title: string): string => {
    if (!title || title.length > TITLE_CLEANING.MAX_LENGTH) {
      return title?.slice(0, TITLE_CLEANING.MAX_LENGTH) || "";
    }

    let cleanedTitle = title;
    for (const separator of TITLE_CLEANING.SEPARATORS) {
      const parts = cleanedTitle.split(separator);
      if (parts.length > 1) {
        const mainPart = parts[0];
        const latterPart = parts.slice(1).join(separator).toLowerCase().trim();

        if (
          TITLE_CLEANING.METADATA_PATTERNS.some((pattern) =>
            pattern.test(latterPart)
          )
        ) {
          cleanedTitle = mainPart;
        }
      }
    }

    return cleanedTitle.trim().replace(/\s+/g, " ") || title;
  },
};
