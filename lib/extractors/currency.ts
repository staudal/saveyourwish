import { BaseMetadataExtractor, Selector } from "./types";
import { extractFromSelectors, extractFromJsonLd } from "./utils";
import { CURRENCIES } from "@/constants";

const VALID_CURRENCIES = Object.freeze(new Set(CURRENCIES.map((c) => c.value)));
const CURRENCY_SYMBOL_MAP = Object.freeze(
  Object.fromEntries(
    CURRENCIES.filter((c) => c.symbol).map((c) => [c.symbol, c.value])
  )
);

const isValidCurrency = (currency: string): boolean =>
  VALID_CURRENCIES.has(currency.toUpperCase());

const normalizeCurrency = (currency: string): string | undefined => {
  const normalized = currency.toUpperCase();
  return isValidCurrency(normalized) ? normalized : undefined;
};

export const currencyExtractor: BaseMetadataExtractor = {
  extract: (document: Document): string | undefined => {
    try {
      // Use utility functions in extraction logic
      const jsonLdPaths: (string | number)[][] = [
        ["priceCurrency"],
        ["offers", "priceCurrency"],
        [0, "priceCurrency"],
        ["offers", 0, "priceCurrency"],
        ["offers", 0, "priceSpecification", "priceCurrency"],
      ];

      const jsonLdCurrency = extractFromJsonLd(document, jsonLdPaths);
      if (jsonLdCurrency) return normalizeCurrency(jsonLdCurrency);

      const currencySelectors: Selector[] = [
        { selector: 'meta[property="og:price:currency"]', attr: "content" },
        {
          selector: 'meta[property="product:price:currency"]',
          attr: "content",
        },
        { selector: '[itemprop="priceCurrency"]', attr: "content" },
        { selector: "[data-currency]", attr: "content" },
      ];

      const metaCurrency = extractFromSelectors(document, currencySelectors);
      if (metaCurrency) {
        return normalizeCurrency(metaCurrency);
      }

      // Try currency symbols as last resort
      const priceElements = document.querySelectorAll(
        ".price, .product-price, .special-price, [class*='price']"
      );

      for (const element of priceElements) {
        const priceText = element.textContent;
        if (!priceText) continue;

        // Check symbols first
        for (const [symbol, currency] of Object.entries(CURRENCY_SYMBOL_MAP)) {
          if (priceText.includes(symbol)) {
            return currency;
          }
        }

        // Then check currency codes
        for (const currency of CURRENCIES) {
          if (priceText.toUpperCase().includes(currency.value)) {
            return currency.value;
          }
        }
      }

      return undefined;
    } catch (error) {
      console.error("Currency extraction failed:", error);
      return undefined;
    }
  },
};
