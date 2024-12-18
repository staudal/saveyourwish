import { Currency, CURRENCIES, EXCHANGE_RATES } from "@/constants";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MinimalDocument } from "./fetchers/types";

// Currency validation and normalization
const isValidCurrency = (currency: string): boolean =>
  CURRENCIES.some((c) => c.value === currency.toUpperCase());

export const normalizeCurrency = (currency: string): string | undefined => {
  const normalized = currency.toUpperCase();
  return isValidCurrency(normalized) ? normalized : undefined;
};

export const extractCurrencyFromText = (text: string): string | undefined => {
  const cleanText = text.replace(/<[^>]*>/g, "").trim();
  if (!cleanText) return undefined;

  // First check for prefixed currency codes (e.g., "US $")
  const prefixMatch = cleanText.match(/^(US|AU|CA|NZ)\s*\$/i);
  if (prefixMatch) {
    return `${prefixMatch[1].toUpperCase()}D`; // US$ -> USD, AU$ -> AUD, etc.
  }

  // Then check for regular currency codes
  const words = cleanText.toUpperCase().split(/\s+/);
  for (const word of words) {
    const cleaned = word.replace(/[^A-Z]/g, "");
    if (isValidCurrency(cleaned)) {
      return cleaned;
    }
  }
  return undefined;
};

// Currency conversion utilities
export function convertToUSD(amount: number, fromCurrency: Currency): number {
  if (fromCurrency === "USD") return amount;
  const rate = EXCHANGE_RATES[fromCurrency];
  if (!rate) return amount; // fallback
  return amount / rate;
}

function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amount;
  const amountInUSD = convertToUSD(amount, fromCurrency);
  if (toCurrency === "USD") return amountInUSD;
  return amountInUSD * EXCHANGE_RATES[toCurrency];
}

function getMostCommonCurrency(
  wishes: { price: number | null; currency: Currency }[]
): Currency {
  const validWishes = wishes.filter((wish) => wish.price !== null);
  if (validWishes.length === 0) return "USD";

  const currencyCounts = validWishes.reduce((acc, wish) => {
    acc[wish.currency] = (acc[wish.currency] || 0) + 1;
    return acc;
  }, {} as Record<Currency, number>);

  return Object.entries(currencyCounts).reduce((a, b) =>
    currencyCounts[a[0] as Currency] > b[1] ? a : b
  )[0] as Currency;
}

export function calculateAveragePrice(
  wishes: { price: number | null; currency: Currency }[]
): { amount: number; currency: Currency } | null {
  const validWishes = wishes.filter((wish) => wish.price !== null);
  if (validWishes.length === 0) return null;

  const targetCurrency = getMostCommonCurrency(validWishes);
  const total = validWishes.reduce((sum, wish) => {
    const convertedAmount = convertCurrency(
      wish.price!,
      wish.currency,
      targetCurrency
    );
    return sum + convertedAmount;
  }, 0);

  return {
    amount: total / validWishes.length,
    currency: targetCurrency,
  };
}

export function calculatePriceRange(
  wishes: { price: number | null; currency: Currency }[]
): { min: number; max: number; currency: Currency } | null {
  const validWishes = wishes.filter((wish) => wish.price !== null);
  if (validWishes.length === 0) return null;

  const targetCurrency = getMostCommonCurrency(validWishes);
  const convertedPrices = validWishes.map((wish) =>
    convertCurrency(wish.price!, wish.currency, targetCurrency)
  );

  return {
    min: Math.min(...convertedPrices),
    max: Math.max(...convertedPrices),
    currency: targetCurrency,
  };
}

// Common regex patterns
export const LANGUAGE_CODE_REGEX = /^[a-z]{2}(?:-[a-z]{2})?$/i;

// DOM utilities
export function extractFromJsonLd(
  document: Document | MinimalDocument,
  paths: (string | number)[][]
): string | undefined {
  try {
    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent || "");
        for (const path of paths) {
          let value = data;
          for (const key of path) {
            value = value?.[key];
          }
          if (typeof value === "string") return value;
        }
      } catch {
        continue;
      }
    }
  } catch (error) {
    console.error("JSON-LD extraction failed:", error);
  }
  return undefined;
}

export function extractFromSelectors(
  document: Document | MinimalDocument,
  selectors: { selector: string; attr: string }[]
): string | undefined {
  for (const { selector, attr } of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const value =
        attr === "textContent"
          ? element.textContent
          : element.getAttribute(attr);
      if (value) return value;
    }
  }
  return undefined;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
