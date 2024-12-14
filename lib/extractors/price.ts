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
      const priceElements = document.querySelectorAll(
        PRICE_SELECTORS.PRICE.join(", ")
      );
      const candidates: number[] = [];

      for (const element of priceElements) {
        // Skip hidden elements and scripts
        if (
          element.tagName === "SCRIPT" ||
          element.tagName === "STYLE" ||
          element.closest("script") ||
          element.closest("style") ||
          element.closest("[style*='display:none']") ||
          element.closest("[style*='visibility:hidden']") ||
          element.closest("[aria-hidden='true']")
        )
          continue;

        const priceText = element.textContent?.trim();
        if (!priceText) continue;

        // Skip if the text is too long (likely not a price)
        if (priceText.length > 50) continue;

        const price = cleanPrice(priceText);
        if (price && price > 0.1 && price < MAX_SAFE_PRICE) {
          // Filter out tiny numbers
          candidates.push(price);
        }
      }

      // If no prices found with specific selectors, try a broader but more strict search
      if (candidates.length === 0) {
        // Look for text that matches common price patterns
        const priceRegex = /(?:\d[\d\s.,]*\d|\d)\s*[€$£¥]/;
        document.querySelectorAll("*").forEach((element) => {
          if (
            element.tagName === "SCRIPT" ||
            element.tagName === "STYLE" ||
            element.closest("script") ||
            element.closest("style") ||
            element.closest("[style*='display:none']") ||
            element.closest("[style*='visibility:hidden']")
          )
            return;

          const text = element.textContent?.trim();
          if (text && text.length < 50 && priceRegex.test(text)) {
            const price = cleanPrice(text);
            if (price && price > 0.1 && price < MAX_SAFE_PRICE) {
              candidates.push(price);
            }
          }
        });
      }

      // Return the most frequently occurring price
      const priceCounts = candidates.reduce((acc, price) => {
        acc[price] = (acc[price] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      const [mostCommonPrice] = Object.entries(priceCounts).sort(
        ([, a], [, b]) => b - a
      )[0];

      return Number(mostCommonPrice);
    } catch (error) {
      console.error("Price extraction error:", error);
      return undefined;
    }
  },
};

function cleanPrice(price: string | undefined): number | undefined {
  if (!price) return undefined;

  try {
    // 1. Clean the input but preserve negative signs
    const cleaned = price
      .replace(/<[^>]*>/g, " ") // Remove HTML tags
      .replace(/[^\d.,\s\-~～]/g, "") // Keep only digits, decimal points, commas, spaces, and range indicators
      .trim();

    // Reject if it looks like a phone number or date
    if (isPhoneNumberOrDate(cleaned)) return undefined;

    // Check if the cleaned string starts with a negative sign
    if (cleaned.trim().startsWith("-")) return undefined;

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
        (n): n is number =>
          n !== undefined &&
          n > 0 &&
          n <= MAX_SAFE_PRICE &&
          !isPhoneNumberOrDate(String(n))
      )
      .sort((a, b) => a - b);

    return numbers[0];
  } catch {
    return undefined;
  }
}

function isPhoneNumberOrDate(str: string): boolean {
  // Remove all non-digits
  const digitsOnly = str.replace(/\D/g, "");

  // Check for common phone number patterns
  if (/^1?\d{10}$/.test(digitsOnly)) return true; // US/CA phone numbers
  if (/^\d{8}$/.test(digitsOnly)) return true; // Common 8-digit phone numbers

  // Check for date patterns
  if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}$/.test(str)) return true; // MM/DD/YY or DD/MM/YY
  if (/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(str)) return true; // YYYY-MM-DD

  // Only check for concatenated dates if the string has no separators
  if (!str.includes(".") && !str.includes(",") && !str.includes(" ")) {
    if (/^\d{6,8}$/.test(digitsOnly)) return true; // Concatenated dates like MMDDYY or YYYYMMDD
  }

  return false;
}

function parseNumber(str: string): number | undefined {
  if (!str) return undefined;

  try {
    // Handle European format with comma as decimal separator
    if (str.includes(",") && !str.includes(".")) {
      // Replace comma with dot for proper number parsing
      const normalized = str.replace(/\s/g, "").replace(",", ".");
      const num = Number(normalized);
      return isValidPrice(num) ? num : undefined;
    }

    // First try formats with both group and decimal separators
    if (str.includes(".") && str.includes(",")) {
      const lastDot = str.lastIndexOf(".");
      const lastComma = str.lastIndexOf(",");
      if (lastDot < lastComma) {
        // European format (1.234,56)
        const num = Number(str.replace(/\./g, "").replace(",", "."));
        return isValidPrice(num) ? num : undefined;
      }
      // US format (1,234.56)
      const num = Number(str.replace(/,/g, ""));
      return isValidPrice(num) ? num : undefined;
    }

    // Try space with comma (1 234,56)
    if (str.includes(" ") && str.includes(",")) {
      const num = Number(str.replace(/\s/g, "").replace(",", "."));
      return isValidPrice(num) ? num : undefined;
    }

    // Try space with dot (1 234.56)
    if (str.includes(" ") && str.includes(".")) {
      const num = Number(str.replace(/\s/g, ""));
      return isValidPrice(num) ? num : undefined;
    }

    // Try simple number formats
    if (!str.includes(",") && str.includes(".")) {
      const num = Number(str);
      return isValidPrice(num) ? num : undefined;
    }

    // Handle plain numbers
    const num = Number(str.replace(/\s/g, ""));
    return isValidPrice(num) ? num : undefined;
  } catch {
    return undefined;
  }
}

function isValidPrice(num: number): boolean {
  return isFinite(num) && num > 0 && num <= MAX_SAFE_PRICE;
}
