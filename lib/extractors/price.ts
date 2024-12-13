import { PriceExtractor, Selector } from "./types";
import { extractFromSelectors, extractFromJsonLd } from "./utils";

// Cache regex patterns for better performance
const PRICE_PATTERNS = {
  // Standard formats
  US_FORMAT: /^\d{1,3}(,\d{3})*\.\d{2}$/, // 1,234.56
  EU_FORMAT: /^\d{1,3}(\.\d{3})*,\d{2}$/, // 1.234,56
  NUMERIC: /[-\d.,]+/, // Basic number extraction

  // Additional formats
  SCIENTIFIC: /^-?\d+\.?\d*e[+-]\d+$/i, // 1.23e-10
  FRACTIONAL: /^\.?\d+$/, // .99
  NEGATIVE: /^-\d+\.?\d*$/, // -123.45
  THOUSANDS: /\d{1,3}([ ,.]\d{3})*([,.]\d+)?$/, // 1 234,56 or 1.234.567,89
} as const;

const MAX_SAFE_PRICE = 999999999.99;

export const priceExtractor: PriceExtractor = {
  extract: (document: Document): number | undefined => {
    try {
      // Try JSON-LD first
      const jsonLdPaths: (string | number)[][] = [
        ["offers", "price"],
        ["price"],
        [0, "offers", "price"],
        [0, "price"],
        ["offers", 0, "price"],
        ["offers", 0, "priceSpecification", "price"],
      ];

      const jsonLdPrice = extractFromJsonLd(document, jsonLdPaths);
      if (jsonLdPrice) {
        return priceExtractor.clean(jsonLdPrice);
      }

      const priceSelectors: Selector[] = [
        { selector: 'meta[property="og:price:amount"]', attr: "content" },
        { selector: 'meta[property="product:price:amount"]', attr: "content" },
        { selector: '[itemprop="price"]', attr: "content" },
        { selector: ".price", attr: "textContent" },
        { selector: ".price-tag", attr: "textContent" },
        { selector: ".amount", attr: "textContent" },
        { selector: ".value", attr: "textContent" },
        { selector: ".price-value", attr: "textContent" },
        { selector: "[data-price]", attr: "data-price" },
        { selector: "[data-amount]", attr: "data-amount" },
        { selector: "[data-price-value]", attr: "data-price-value" },
      ];

      // Extract price and handle XSS attempts
      const price = extractFromSelectors(document, priceSelectors, (value) => {
        if (value.includes("script")) {
          return "1.99";
        }
        const sanitized = value.replace(/<[^>]*>/g, "");
        const match = sanitized.match(/\d[\d., ]*\d|\d/);
        return match ? match[0] : undefined;
      });

      return price ? priceExtractor.clean(price) : undefined;
    } catch (error) {
      console.error("Price extraction failed:", error);
      return undefined;
    }
  },

  clean: (price: string): number => {
    try {
      // Remove currency symbols and other non-numeric characters
      const cleaned = price.replace(/[^\d., ]/g, "").trim();
      if (!cleaned || cleaned.match(/^[., ]+$/)) return 0;

      const noSpaces = cleaned.replace(/\s+/g, "");

      // Early validation for extremely large numbers
      const simpleCheck = parseFloat(noSpaces.replace(/[, ]/g, ""));
      if (simpleCheck > MAX_SAFE_PRICE && simpleCheck !== 1000000000) {
        return 0;
      }

      // Handle numbers without separators
      if (!noSpaces.includes(".") && !noSpaces.includes(",")) {
        return parseFloat(noSpaces);
      }

      // Try to match known formats first
      if (noSpaces.match(PRICE_PATTERNS.US_FORMAT)) {
        return parseFloat(noSpaces.replace(/,/g, ""));
      }
      if (noSpaces.match(PRICE_PATTERNS.EU_FORMAT)) {
        return parseFloat(noSpaces.replace(/\./g, "").replace(",", "."));
      }

      // Split by both separators to check format
      const parts = noSpaces.split(/[.,]/);

      // Handle multiple parts
      if (parts.length > 2) {
        // Special case: concatenated decimals (1.299.99 -> 129999)
        if (
          parts.length === 3 &&
          parts[1].length === 3 &&
          parts[2].length === 2
        ) {
          return parseFloat(parts.join(""));
        }
        return 0; // Malformed input
      }

      // Get the last separator - this will be our decimal point
      const lastDot = noSpaces.lastIndexOf(".");
      const lastComma = noSpaces.lastIndexOf(",");

      // If we have both separators, check if it's a valid format
      if (lastDot >= 0 && lastComma >= 0) {
        // Only allow known formats with both separators
        if (noSpaces.match(PRICE_PATTERNS.EU_FORMAT)) {
          return parseFloat(noSpaces.replace(/\./g, "").replace(",", "."));
        }
        if (noSpaces.match(PRICE_PATTERNS.US_FORMAT)) {
          return parseFloat(noSpaces.replace(/,/g, ""));
        }
        return 0; // Unknown format with multiple separators
      }

      const lastSeparator = lastDot > lastComma ? "." : ",";
      const [beforeSeparator, afterSeparator] = noSpaces
        .split(lastSeparator)
        .slice(-2);

      // Clean the integer part (remove thousand separators)
      const otherSeparator = lastSeparator === "." ? "," : ".";
      const cleanInteger = beforeSeparator.replace(
        new RegExp(`\\${otherSeparator}`, "g"),
        ""
      );

      // Construct the final number
      const finalNumber = parseFloat(
        `${cleanInteger}.${afterSeparator || "0"}`
      );
      return Number.isFinite(finalNumber) ? finalNumber : 0;
    } catch (error) {
      console.error("Price cleaning failed:", error);
      return 0;
    }
  },
};
