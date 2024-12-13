export const WISHLIST_CATEGORIES = [
  "None",
  "Christmas",
  "Birthday",
  "Wedding",
] as const;

export type DialogState = "url" | "configure";

// Currency-related types and constants
type CurrencyInfo = {
  readonly value: string;
  readonly label: string;
  readonly symbol: string;
  readonly tlds: readonly string[];
};

export const CURRENCIES: readonly CurrencyInfo[] = [
  { value: "USD", label: "US Dollar", symbol: "$", tlds: ["us"] },
  { value: "EUR", label: "Euro", symbol: "€", tlds: ["eu"] },
  { value: "DKK", label: "Danish Krone", symbol: "kr", tlds: ["dk"] },
  { value: "SEK", label: "Swedish Krona", symbol: "kr", tlds: ["se"] },
  { value: "NOK", label: "Norwegian Krone", symbol: "kr", tlds: ["no"] },
  { value: "GBP", label: "British Pound", symbol: "£", tlds: ["uk", "co.uk"] },
  { value: "JPY", label: "Japanese Yen", symbol: "¥", tlds: ["jp"] },
  { value: "CHF", label: "Swiss Franc", symbol: "CHF", tlds: ["ch"] },
  { value: "CAD", label: "Canadian Dollar", symbol: "CAD", tlds: ["ca"] },
  { value: "AUD", label: "Australian Dollar", symbol: "AUD", tlds: ["au"] },
  { value: "NZD", label: "New Zealand Dollar", symbol: "NZD", tlds: ["nz"] },
  { value: "CNY", label: "Chinese Yuan", symbol: "¥", tlds: ["cn"] },
  { value: "HKD", label: "Hong Kong Dollar", symbol: "HKD", tlds: ["hk"] },
  { value: "SGD", label: "Singapore Dollar", symbol: "SGD", tlds: ["sg"] },
] as const;

export type Currency = (typeof CURRENCIES)[number]["value"];

// Currency extraction confidence scores
export const CURRENCY_CONFIDENCE = {
  LANGUAGE: 2.5,
  CODE: 2.0,
  UNAMBIGUOUS_SYMBOL: 1.0,
  AMBIGUOUS_SYMBOL: 0.5,
} as const;

// Currency extraction selectors
export const CURRENCY_SELECTORS = {
  PRICE: [
    ".price",
    ".product-price",
    ".special-price",
    "[class*='price']",
    "[itemprop='price']",
    ".price-tag",
    ".amount",
    ".value",
    ".price-value",
  ],
  META: [
    { selector: 'meta[property="og:price:currency"]', attr: "content" },
    { selector: 'meta[property="product:price:currency"]', attr: "content" },
    { selector: '[itemprop="priceCurrency"]', attr: "content" },
    { selector: 'meta[itemprop="priceCurrency"]', attr: "content" },
  ],
  JSONLD_PATHS: [
    ["priceCurrency"],
    ["offers", "priceCurrency"],
    ["offers", "priceSpecification", "priceCurrency"],
  ],
} as const;

// Map TLDs to ISO language codes
export const TLD_TO_LANGUAGE: Record<string, string> = {
  dk: "da", // Danish
  se: "sv", // Swedish
  no: "no", // Norwegian
  jp: "ja", // Japanese
  cn: "zh", // Chinese
} as const;

// Exchange rates and currency conversion
export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  DKK: 6.95,
  SEK: 9.5,
  NOK: 9.5,
  GBP: 0.82,
};
