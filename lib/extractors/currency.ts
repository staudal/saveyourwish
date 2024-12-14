import { BaseMetadataExtractor } from "./types";
import {
  extractFromSelectors,
  extractFromJsonLd,
  extractCurrencyFromText,
  LANGUAGE_CODE_REGEX,
} from "@/lib/utils";
import {
  CURRENCIES,
  TLD_TO_LANGUAGE,
  CURRENCY_CONFIDENCE,
  CURRENCY_SELECTORS,
} from "@/constants";
import { MinimalDocument } from "../fetchers/types";

// Pre-compile selectors for performance
const PRICE_ELEMENTS_SELECTOR = CURRENCY_SELECTORS.PRICE.join(", ");

// Create language to currency mapping from TLDs
const LANG_TO_CURRENCY = CURRENCIES.reduce((acc, curr) => {
  curr.tlds.forEach((tld) => {
    const baseTld = tld.split(".").pop() || tld;
    const langCode = TLD_TO_LANGUAGE[baseTld];
    if (langCode) {
      acc[langCode] = curr.value;
    }
  });
  return acc;
}, {} as Record<string, string>);

type FoundCurrencies = Map<
  string,
  {
    confidence: number;
    source: "code" | "symbol";
  }
>;

// Add near the top with other utility functions
function getTldFromUrl(url: string): string | undefined {
  try {
    const hostname = new URL(url).hostname;
    return hostname.split(".").slice(-1)[0];
  } catch {
    return undefined;
  }
}

export const currencyExtractor: BaseMetadataExtractor<string> = {
  extract: (document: Document | MinimalDocument): string | undefined => {
    try {
      // 1. Check JSON-LD (highest priority)
      const jsonLdCurrency = extractFromJsonLd(
        document,
        CURRENCY_SELECTORS.JSONLD_PATHS.map((path) => [...path])
      );
      console.log("JSON-LD currency:", jsonLdCurrency);

      // 2. Check meta tags and microdata
      const metaCurrency = extractFromSelectors(document, [
        ...CURRENCY_SELECTORS.META,
      ]);
      console.log("Meta currency:", metaCurrency);

      // 3. Initialize foundCurrencies map before using it
      const foundCurrencies: FoundCurrencies = new Map();

      // Add TLD-based detection
      const tld = getTldFromUrl(document.URL);
      console.log("TLD:", tld);

      // Log document language
      console.log("Document language:", document.documentElement.lang);

      // Add TLD-based detection after metadata checks but before symbol detection
      if (tld) {
        // Find currency matching TLD
        const currencyFromTld = CURRENCIES.find((curr) =>
          curr.tlds.some((t) => t.endsWith(tld))
        )?.value;

        if (currencyFromTld) {
          foundCurrencies.set(currencyFromTld, {
            confidence: CURRENCY_CONFIDENCE.TLD,
            source: "code",
          });
        }
      }

      // 4. Try currency codes and symbols in price-related elements
      const priceElements = document.querySelectorAll(PRICE_ELEMENTS_SELECTOR);

      // First check for language hints at document level
      const documentLang = document.documentElement.lang
        ?.toLowerCase()
        ?.split("-")[0];
      if (
        documentLang?.match(LANGUAGE_CODE_REGEX) &&
        LANG_TO_CURRENCY[documentLang]
      ) {
        foundCurrencies.set(LANG_TO_CURRENCY[documentLang], {
          confidence: CURRENCY_CONFIDENCE.LANGUAGE,
          source: "code",
        });
      }

      // Then check for language hints in the DOM, starting from the top
      const langElements = document.querySelectorAll("[lang]");
      langElements.forEach((el) => {
        const lang = el.getAttribute("lang")?.toLowerCase()?.split("-")[0];
        if (lang?.match(LANGUAGE_CODE_REGEX) && LANG_TO_CURRENCY[lang]) {
          // Check if this element contains any price elements
          const priceElementsInLang = el.querySelectorAll(
            PRICE_ELEMENTS_SELECTOR
          );
          if (priceElementsInLang.length > 0) {
            foundCurrencies.set(LANG_TO_CURRENCY[lang], {
              confidence: CURRENCY_CONFIDENCE.LANGUAGE,
              source: "code",
            });
          }
        }
      });

      // Finally check individual price elements
      for (const element of priceElements) {
        const priceText = element.textContent?.trim();
        if (!priceText) continue;

        // Check for currency codes first (higher confidence)
        const currencyFromText = extractCurrencyFromText(priceText);
        if (currencyFromText) {
          foundCurrencies.set(currencyFromText, {
            confidence: CURRENCY_CONFIDENCE.CODE,
            source: "code",
          });
          continue;
        }

        // Then check for symbols (lower confidence)
        const symbolCurrency = extractCurrencyFromText(priceText);
        if (symbolCurrency) {
          foundCurrencies.set(symbolCurrency, {
            confidence: CURRENCY_CONFIDENCE.UNAMBIGUOUS_SYMBOL,
            source: "symbol",
          });
        }
      }

      // Before returning, log what we found
      console.log(
        "Found currencies:",
        Array.from(foundCurrencies.entries()).map(([curr, info]) => ({
          currency: curr,
          confidence: info.confidence,
          source: info.source,
        }))
      );

      // Return the currency with highest confidence
      if (foundCurrencies.size > 0) {
        const [currency] = Array.from(foundCurrencies.entries()).sort(
          (a, b) => {
            const confidenceDiff = b[1].confidence - a[1].confidence;
            return confidenceDiff !== 0
              ? confidenceDiff
              : a[1].source === "code"
              ? -1
              : 1;
          }
        )[0];
        console.log("Selected currency:", currency);
        return currency;
      }

      return undefined;
    } catch (error) {
      console.error("Currency extraction error:", error);
      return undefined;
    }
  },
};
