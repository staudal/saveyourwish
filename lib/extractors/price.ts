import { BaseMetadataExtractor } from "./types";
import { extractFromSelectors, extractFromJsonLd } from "./utils";
import { PRICE_SELECTORS } from "@/constants";
import { MinimalDocument } from "@/lib/fetchers/types";

const MAX_SAFE_PRICE = 999999999.99;

export const priceExtractor: BaseMetadataExtractor<number> = {
  extract: (document: Document | MinimalDocument): number | undefined => {
    try {
      // 1. Try JSON-LD (highest priority)
      const jsonLdPrice = extractFromJsonLd(
        document,
        PRICE_SELECTORS.JSONLD_PATHS.map((path) => [...path])
      );
      if (jsonLdPrice) {
        const price = cleanPrice(jsonLdPrice);
        if (price) return price;
      }

      // 2. Try meta tags
      const metaPrice = extractFromSelectors(document, [
        ...PRICE_SELECTORS.META,
      ]);
      if (metaPrice) {
        const price = cleanPrice(metaPrice);
        if (price) return price;
      }

      // 3. Try price elements
      const priceElements = document.querySelectorAll("*");
      const candidates: number[] = [];

      for (const element of priceElements) {
        if (
          element.tagName === "SCRIPT" ||
          element.tagName === "STYLE" ||
          element.closest("script") ||
          element.closest("style")
        )
          continue;

        const price = cleanPrice(element.textContent?.trim());
        if (price) candidates.push(price);
      }

      return candidates.length > 0 ? Math.min(...candidates) : undefined;
    } catch {
      return undefined;
    }
  },
};

function cleanPrice(price: string | undefined): number | undefined {
  if (!price) return undefined;

  try {
    // 1. Clean the input
    const cleaned = price
      .replace(/<[^>]*>/g, " ") // Remove HTML tags
      .replace(/[^\d.,\s\-~～]/g, "") // Keep only digits, decimal points, commas, spaces, and range indicators
      .trim();

    // Special handling for space-separated numbers before splitting
    if (
      cleaned.includes(" ") &&
      !cleaned.includes("-") &&
      !cleaned.includes("~") &&
      !cleaned.includes("～")
    ) {
      const spaceNumber = parseNumber(cleaned);
      if (spaceNumber) return spaceNumber;
    }

    // 2. Split on common delimiters and process each potential number
    const numbers = cleaned
      .split(/(?:\s*[-~～]\s*|\s+to\s+|\s+from\s+|\s+)/)
      .map((str) => parseNumber(str))
      .filter(
        (n): n is number => n !== undefined && n > 0 && n <= MAX_SAFE_PRICE
      )
      .sort((a, b) => a - b);

    return numbers[0];
  } catch {
    return undefined;
  }
}

function parseNumber(str: string): number | undefined {
  if (!str || str.startsWith("-")) return undefined;

  // Skip strings that look like dates or phone numbers
  if (str.includes("/") || str.length > 10) return undefined;

  // Try each format, but in a specific order to avoid misinterpretation
  const formats = [
    // First try formats with both group and decimal separators
    (s: string) => {
      if (s.includes(".") && s.includes(",")) {
        // European format (1.234,56)
        const lastDot = s.lastIndexOf(".");
        const lastComma = s.lastIndexOf(",");
        if (lastDot < lastComma) {
          return Number(s.replace(/\./g, "").replace(",", "."));
        }
        // US format (1,234.56)
        return Number(s.replace(/,/g, ""));
      }
      return NaN;
    },
    // Then try space with comma (1 234,56)
    (s: string) => {
      if (s.includes(" ") && s.includes(",")) {
        return Number(s.replace(/\s/g, "").replace(",", "."));
      }
      return NaN;
    },
    // Then try space with dot (1 234.56)
    (s: string) => {
      if (s.includes(" ") && s.includes(".")) {
        return Number(s.replace(/\s/g, ""));
      }
      return NaN;
    },
    // Then try space only (1 234)
    (s: string) => {
      if (s.includes(" ") && !s.includes(",") && !s.includes(".")) {
        // Verify spaces are used as group separators (every 3 digits)
        const parts = s.split(" ");
        if (parts.every((part) => /^\d{1,3}$/.test(part))) {
          return Number(s.replace(/\s/g, ""));
        }
      }
      return NaN;
    },
    // Then try single separator cases
    (s: string) => {
      // Only decimal point (123.45)
      if (!s.includes(",") && s.includes(".")) {
        return Number(s);
      }
      // Only comma, treat as group separator (1,234)
      if (s.includes(",") && !s.includes(".")) {
        return Number(s.replace(/,/g, ""));
      }
      // No separators (1234)
      if (!s.includes(",") && !s.includes(".") && !s.includes(" ")) {
        return Number(s);
      }
      return NaN;
    },
  ];

  for (const format of formats) {
    try {
      const num = format(str);
      if (isFinite(num) && num > 0) {
        return Math.round(num * 100) / 100;
      }
    } catch {}
  }

  return undefined;
}
