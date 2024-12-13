import { BaseMetadataExtractor } from "./types";
import {
  extractFromSelectors,
  extractFromJsonLd,
  normalizeCurrency,
  extractCurrencyFromText,
  LANGUAGE_CODE_REGEX,
} from "@/lib/utils";
import {
  CURRENCIES,
  TLD_TO_LANGUAGE,
  CURRENCY_CONFIDENCE,
  CURRENCY_SELECTORS,
} from "@/constants";

// Pre-compile selectors for performance
const PRICE_ELEMENTS_SELECTOR = CURRENCY_SELECTORS.PRICE.join(", ");

// Create a map of symbols to arrays of possible currencies
const SYMBOL_TO_CURRENCIES = CURRENCIES.reduce((acc, curr) => {
  if (curr.symbol) {
    if (!acc[curr.symbol]) {
      acc[curr.symbol] = [];
    }
    acc[curr.symbol].push(curr.value);
  }
  return acc;
}, {} as Record<string, string[]>);

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

export const currencyExtractor: BaseMetadataExtractor = {
  extract: (document: Document): string | undefined => {
    try {
      // 1. Check JSON-LD (highest priority)
      const jsonLdCurrency = extractFromJsonLd(
        document,
        CURRENCY_SELECTORS.JSONLD_PATHS.map((path) => [...path])
      );
      if (jsonLdCurrency) {
        const normalized = normalizeCurrency(jsonLdCurrency);
        if (normalized) return normalized;
      }

      // 2. Check meta tags and microdata
      const metaCurrency = extractFromSelectors(document, [
        ...CURRENCY_SELECTORS.META,
      ]);
      if (metaCurrency) {
        const normalized = normalizeCurrency(metaCurrency);
        if (normalized) return normalized;
      }

      // 3. Try currency codes and symbols in price-related elements
      const priceElements = document.querySelectorAll(PRICE_ELEMENTS_SELECTOR);
      const foundCurrencies: FoundCurrencies = new Map();

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
        for (const [symbol, currencies] of Object.entries(
          SYMBOL_TO_CURRENCIES
        )) {
          if (priceText.includes(symbol)) {
            if (currencies.length === 1) {
              // Unambiguous symbol
              foundCurrencies.set(currencies[0], {
                confidence: CURRENCY_CONFIDENCE.UNAMBIGUOUS_SYMBOL,
                source: "symbol",
              });
            } else {
              // For ambiguous symbols, add all possibilities with lower confidence
              currencies.forEach((curr) => {
                foundCurrencies.set(curr, {
                  confidence: CURRENCY_CONFIDENCE.AMBIGUOUS_SYMBOL,
                  source: "symbol",
                });
              });
            }
          }
        }
      }

      // Return the currency with highest confidence
      if (foundCurrencies.size > 0) {
        const [currency] = Array.from(foundCurrencies.entries()).sort(
          (a, b) => {
            const confidenceDiff = b[1].confidence - a[1].confidence;
            // If same confidence, prefer code over symbol
            return confidenceDiff !== 0
              ? confidenceDiff
              : a[1].source === "code"
              ? -1
              : 1;
          }
        )[0];
        return currency;
      }

      return undefined;
    } catch (error) {
      if (error instanceof DOMException) {
        console.error("DOM manipulation error:", error);
      } else {
        console.error("Currency extraction failed:", error);
      }
      return undefined;
    }
  },
};
