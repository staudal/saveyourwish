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
  CURRENCY_CONFIDENCE,
  CURRENCY_SELECTORS,
} from "@/constants";
import { MinimalDocument } from "../fetchers/types";

const PRICE_ELEMENTS_SELECTOR = CURRENCY_SELECTORS.PRICE.join(", ");

const SYMBOL_TO_CURRENCIES = CURRENCIES.reduce((acc, curr) => {
  if (curr.symbol) {
    if (!acc[curr.symbol]) {
      acc[curr.symbol] = [];
    }
    acc[curr.symbol].push(curr.value);
  }
  return acc;
}, {} as Record<string, string[]>);

type FoundCurrencies = Map<
  string,
  {
    confidence: number;
    source: "code" | "symbol" | "format" | "tld";
  }
>;

const normalizeText = (text: string): string => {
  return text
    .replace(/\s+/g, " ")
    .replace(/([A-Za-z])(\d)/g, "$1 $2")
    .trim();
};

const isConversionElement = (element: Element): boolean => {
  return (
    element.classList?.contains("x-price-approx") ||
    element.getAttribute("data-testid")?.includes("approx") ||
    element.classList?.contains("converted-price") ||
    element.classList?.contains("approx") ||
    element.closest("[class*='approx']") !== null ||
    element.closest("[data-testid*='approx']") !== null
  );
};

function localeMatchesLang(locale: string, lang: string): boolean {
  if (locale.startsWith(lang)) return true;
  return locale.includes(lang);
}

function getCurrencyFromHostname(hostname: string): string | undefined {
  const lowerHost = hostname.toLowerCase();
  const parts = lowerHost.split(".").filter((p) => p !== "www");

  // Aggregate all known tlds from CURRENCIES
  const allTlds = CURRENCIES.flatMap((c) =>
    c.tlds.map((t) => ({ tld: t.toLowerCase(), currency: c.value }))
  );

  // Sort TLDs by length (descending) to match longer TLDs first (like co.uk)
  allTlds.sort((a, b) => b.tld.length - a.tld.length);

  // Check each part of the hostname for a match
  // For ca.gymshark.com -> parts = ["ca", "gymshark", "com"]
  // We'll check "ca" first, which should yield CAD if found in allTlds
  for (const part of parts) {
    for (const { tld, currency } of allTlds) {
      if (part === tld) {
        return currency;
      }
    }
  }

  return undefined;
}

function resolveSymbolToCurrency(
  symbol: string,
  tld?: string,
  lang?: string
): string | undefined {
  const candidates = SYMBOL_TO_CURRENCIES[symbol];
  if (!candidates || candidates.length === 0) return undefined;

  if (candidates.length === 1) return candidates[0];

  // Filter by language first, if provided
  if (lang && lang.match(LANGUAGE_CODE_REGEX)) {
    const langFiltered = candidates.filter((currency) => {
      const currObj = CURRENCIES.find((c) => c.value === currency);
      return currObj && localeMatchesLang(currObj.locale.toLowerCase(), lang);
    });

    if (langFiltered.length === 1) return langFiltered[0];
    if (langFiltered.length > 1) return langFiltered[0]; // If multiple match, pick first
  }

  // Then try tld-based currency if given
  if (tld) {
    // Find a currency that includes this tld
    const matchedCurrency = CURRENCIES.find((c) =>
      c.tlds.some((ctld) => ctld.toLowerCase() === tld.toLowerCase())
    );

    // If a currency is found via tld and is among candidates, return it
    if (matchedCurrency && candidates.includes(matchedCurrency.value)) {
      return matchedCurrency.value;
    }
  }

  // Fallback: if still ambiguous, return the first candidate
  return candidates[0];
}

function findClosestLang(element: Element): string | undefined {
  const closestLangElement = element.closest("[lang]");
  if (closestLangElement) {
    const lang = closestLangElement
      .getAttribute("lang")
      ?.toLowerCase()
      .split("-")[0];
    if (lang && lang.match(LANGUAGE_CODE_REGEX)) {
      return lang;
    }
  }
  return undefined;
}

export const currencyExtractor: BaseMetadataExtractor<string> = {
  extract: (document: Document | MinimalDocument): string | undefined => {
    try {
      const jsonLdCurrency = extractFromJsonLd(
        document,
        CURRENCY_SELECTORS.JSONLD_PATHS.map((path) => [...path])
      );
      if (jsonLdCurrency) {
        const normalized = normalizeCurrency(jsonLdCurrency);
        if (normalized) return normalized;
      }

      const metaCurrency = extractFromSelectors(document, [
        ...CURRENCY_SELECTORS.META,
      ]);
      if (metaCurrency) {
        const normalized = normalizeCurrency(metaCurrency);
        if (normalized) return normalized;
      }

      const foundCurrencies: FoundCurrencies = new Map();

      let hostname = "";
      try {
        hostname = new URL(document.URL).hostname;
      } catch {
        // ignore invalid URL
      }

      // Determine currency from the hostname (final TLD or known multi-level TLD)
      const domainCurrency = hostname
        ? getCurrencyFromHostname(hostname)
        : undefined;
      if (domainCurrency) {
        foundCurrencies.set(domainCurrency, {
          confidence: CURRENCY_CONFIDENCE.TLD,
          source: "tld",
        });
      }

      const priceElements = document.querySelectorAll(
        PRICE_ELEMENTS_SELECTOR
      ) as NodeListOf<Element>;
      for (const element of priceElements) {
        if (isConversionElement(element)) continue;

        const priceText = normalizeText(element.textContent || "");
        if (!priceText) continue;

        const elementLang =
          findClosestLang(element) ||
          document.documentElement.lang?.toLowerCase().split("-")[0];

        const currencyFromText = extractCurrencyFromText(priceText);
        if (currencyFromText) {
          foundCurrencies.set(currencyFromText, {
            confidence: CURRENCY_CONFIDENCE.CODE,
            source: "code",
          });
          continue;
        }

        for (const symbol of Object.keys(SYMBOL_TO_CURRENCIES)) {
          if (priceText.includes(symbol)) {
            // Use the final TLD part (if any) only for language mapping
            // We already used getCurrencyFromHostname for domainCurrency
            const tld = hostname.split(".").pop();
            const resolved = resolveSymbolToCurrency(symbol, tld, elementLang);
            if (resolved) {
              const candidateCount = SYMBOL_TO_CURRENCIES[symbol]?.length || 1;
              const confidence =
                candidateCount === 1
                  ? CURRENCY_CONFIDENCE.UNAMBIGUOUS_SYMBOL
                  : CURRENCY_CONFIDENCE.AMBIGUOUS_SYMBOL;

              const existing = foundCurrencies.get(resolved);
              if (!existing || existing.confidence < confidence) {
                foundCurrencies.set(resolved, {
                  confidence,
                  source: "symbol",
                });
              }
            }
          }
        }
      }

      if (foundCurrencies.size > 0) {
        const sorted = Array.from(foundCurrencies.entries()).sort(
          (a, b) => b[1].confidence - a[1].confidence
        );
        return sorted[0][0];
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
