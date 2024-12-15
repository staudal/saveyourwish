import { BaseMetadataExtractor } from "./types";
import { extractFromSelectors, extractFromJsonLd } from "./utils";
import { PRICE_SELECTORS } from "@/constants";
import { MinimalDocument } from "@/lib/fetchers/types";

const MAX_SAFE_PRICE = 999999999.99;

export const priceExtractor: BaseMetadataExtractor<number> = {
  extract: (document: Document | MinimalDocument): number | undefined => {
    try {
      // 1. Try JSON-LD first
      const jsonLdPrice = extractFromJsonLd(
        document,
        PRICE_SELECTORS.JSONLD_PATHS.map((path) => [...path])
      );
      if (jsonLdPrice) {
        const price = cleanPrice(jsonLdPrice);
        if (price) return price;
      }

      // 2. Try meta tags
      const metaPrice = extractFromSelectors(
        document,
        PRICE_SELECTORS.META as Array<{
          selector: string;
          attr:
            | "data-price"
            | "content"
            | "textContent"
            | "src"
            | "data-amount"
            | "data-price-value";
        }>
      );
      if (metaPrice) {
        const price = cleanPrice(metaPrice);
        if (price) return price;
      }

      // 3. Try known price selectors
      const priceSelector = PRICE_SELECTORS.PRICE.join(", ");
      const priceElements = document.querySelectorAll(priceSelector);

      for (const element of priceElements) {
        // Try attributes like data-price-amount or content first
        const attrPrice = extractNumberFromAttributes(element as Element);
        if (attrPrice !== undefined) {
          return attrPrice;
        }

        // If no attribute, parse textContent
        const text = element.textContent?.trim();
        if (text) {
          const parsedPrice = cleanPrice(text);
          if (parsedPrice) {
            // Return immediately the first recognized price
            return parsedPrice;
          }
        }
      }

      // 4. Fallback: If no known price selectors matched, search entire doc
      // (only do this if necessary)
      const allElements = document.querySelectorAll("*");
      const fallbackCandidates: number[] = [];
      for (const element of allElements) {
        if (
          element.tagName === "SCRIPT" ||
          element.tagName === "STYLE" ||
          element.closest("script") ||
          element.closest("style")
        )
          continue;

        const text = element.textContent?.trim();
        if (!text) continue;
        const price = cleanPrice(text);
        if (price) {
          fallbackCandidates.push(price);
        }
      }

      if (fallbackCandidates.length > 0) {
        // If we got multiple candidates from fallback, pick the most frequent as before
        // This is a fallback scenario anyway.
        const priceFrequency = new Map<number, number>();
        fallbackCandidates.forEach((p) => {
          priceFrequency.set(p, (priceFrequency.get(p) || 0) + 1);
        });

        // Sort by frequency descending, then by value ascending to break ties
        const sorted = [...priceFrequency.entries()].sort((a, b) => {
          if (b[1] === a[1]) return a[0] - b[0];
          return b[1] - a[1];
        });

        return sorted[0][0];
      }

      return undefined;
    } catch {
      return undefined;
    }
  },
};

function extractNumberFromAttributes(element: Element): number | undefined {
  const attrNames = ["data-price-amount", "data-price", "content"];
  for (const attr of attrNames) {
    const val = element.getAttribute(attr);
    if (val) {
      const price = cleanPrice(val);
      if (price) return price;
    }
  }
  return undefined;
}

function cleanPrice(price: string | undefined): number | undefined {
  if (!price) return undefined;

  try {
    // Normalize non-breaking spaces
    price = price.replace(/\u00A0/g, " ");

    // Remove HTML tags
    price = price.replace(/<[^>]*>/g, " ");

    // Keep only digits, decimal points, commas, spaces, and range indicators
    // Remove currency letters and other alphabets
    price = price.replace(/[^\d.,\s\-~～]/g, "").trim();

    // If we have a space-separated single number with no range symbols, try directly
    if (
      price.includes(" ") &&
      !price.includes("-") &&
      !price.includes("~") &&
      !price.includes("～")
    ) {
      const directNumber = parseNumber(price);
      if (directNumber) return directNumber;
    }

    // Split on ranges or words that indicate ranges
    const segments = price
      .split(/(?:\s*[-~～]\s*|\s+to\s+|\s+from\s+|\s+)/)
      .map((str) => parseNumber(str))
      .filter(
        (n): n is number => n !== undefined && n > 0 && n <= MAX_SAFE_PRICE
      )
      .sort((a, b) => a - b);

    return segments[0];
  } catch {
    return undefined;
  }
}

function parseNumber(str: string): number | undefined {
  if (!str || str.startsWith("-")) return undefined;
  if (str.includes("/") || str.length > 10) return undefined; // Avoid dates or long nonsense

  const formats = [
    (s: string) => {
      // Mixed separators (European vs US)
      if (s.includes(".") && s.includes(",")) {
        const lastDot = s.lastIndexOf(".");
        const lastComma = s.lastIndexOf(",");
        if (lastDot < lastComma) {
          // European format (1.234,56)
          return Number(s.replace(/\./g, "").replace(",", "."));
        }
        // US format (1,234.56)
        return Number(s.replace(/,/g, ""));
      }
      return NaN;
    },
    (s: string) => {
      // Space with comma decimal (1 234,56)
      if (s.includes(" ") && s.includes(",")) {
        return Number(s.replace(/\s/g, "").replace(",", "."));
      }
      return NaN;
    },
    (s: string) => {
      // Space with dot decimal (1 234.56)
      if (s.includes(" ") && s.includes(".")) {
        return Number(s.replace(/\s/g, ""));
      }
      return NaN;
    },
    (s: string) => {
      // Space as thousand separator (1 234)
      if (s.includes(" ") && !s.includes(",") && !s.includes(".")) {
        const parts = s.split(" ");
        if (parts.every((part) => /^\d{1,3}$/.test(part))) {
          return Number(s.replace(/\s/g, ""));
        }
      }
      return NaN;
    },
    (s: string) => {
      // Simple formats
      if (!s.includes(",") && s.includes(".")) {
        return Number(s); // 123.45
      }
      if (s.includes(",") && !s.includes(".")) {
        // Check if comma is decimal (e.g., 123,45)
        const parts = s.split(",");
        if (parts[1]?.length === 2) {
          return Number(s.replace(",", "."));
        }
        // Otherwise treat comma as thousand separator
        return Number(s.replace(/,/g, ""));
      }
      if (!s.includes(",") && !s.includes(".") && !s.includes(" ")) {
        // Plain integer
        return Number(s);
      }
      return NaN;
    },
  ];

  for (const format of formats) {
    const num = format(str);
    if (isFinite(num) && num > 0) {
      return Math.round(num * 100) / 100;
    }
  }
  return undefined;
}
