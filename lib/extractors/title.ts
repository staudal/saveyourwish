import { MetadataExtractorWithClean, Selector } from "./types";
import { extractFromSelectors } from "./utils";

export const titleExtractor: MetadataExtractorWithClean = {
  extract: (document: Document) => {
    const titleSelectors: Selector[] = [
      { selector: 'meta[property="og:title"]', attr: "content" },
      { selector: 'meta[name="title"]', attr: "content" },
      { selector: 'meta[property="product:name"]', attr: "content" },
      { selector: 'meta[name="twitter:title"]', attr: "content" },
      { selector: '[itemprop="name"]', attr: "content" },
      { selector: ".product-title", attr: "textContent" },
      { selector: ".product-name", attr: "textContent" },
      { selector: "#product-title", attr: "textContent" },
      { selector: "h1", attr: "textContent" },
      { selector: "title", attr: "textContent" },
    ];

    return extractFromSelectors(document, titleSelectors);
  },

  clean: (title: string): string => {
    const separators = [",", " - ", " – ", " — ", " : ", ": ", " | ", "| "];
    const metadataPatterns = [
      /\.(com|net|org|dk|co\.uk|de)(\s|:|$)/i,
      /^[0-9\s,]+$/,
      /^[A-Z\s]+$/,
      /^.*\.(com|net|org|dk|co\.uk|de)\b/i,
      /^[^:]+:[^:]+$/,
      /^[A-Z][A-Z\s]+$/,
      /.+/,
    ];

    let cleanedTitle = title;
    for (const separator of separators) {
      const parts = cleanedTitle.split(separator);
      if (parts.length > 1) {
        const mainPart = parts[0];
        const latterPart = parts.slice(1).join(separator).toLowerCase().trim();

        if (metadataPatterns.some((pattern) => pattern.test(latterPart))) {
          cleanedTitle = mainPart;
        }
      }
    }

    return cleanedTitle.trim().replace(/\s+/g, " ") || title;
  },
};
