// Currency-related types and constants
type CurrencyInfo = {
  readonly value: string;
  readonly label: string;
  readonly symbol: string;
  readonly tlds: readonly string[];
  readonly locale: string; // Primary locale for this currency
};

export const CURRENCIES: readonly CurrencyInfo[] = [
  {
    value: "USD",
    label: "US Dollar",
    symbol: "$",
    tlds: ["us"],
    locale: "en-US",
  },
  {
    value: "EUR",
    label: "Euro",
    symbol: "€",
    tlds: [
      "eu",
      "de",
      "fr",
      "it",
      "es",
      "nl",
      "pt",
      "fi",
      "ie",
      "at",
      "be",
      "gr",
    ],
    locale: "de-DE",
  },
  {
    value: "DKK",
    label: "Danish Krone",
    symbol: "kr",
    tlds: ["dk"],
    locale: "da-DK",
  },
  {
    value: "SEK",
    label: "Swedish Krona",
    symbol: "kr",
    tlds: ["se"],
    locale: "sv-SE",
  },
  {
    value: "NOK",
    label: "Norwegian Krone",
    symbol: "kr",
    tlds: ["no"],
    locale: "nb-NO",
  },
  {
    value: "GBP",
    label: "British Pound",
    symbol: "£",
    tlds: ["uk", "co.uk"],
    locale: "en-GB",
  },
  {
    value: "JPY",
    label: "Japanese Yen",
    symbol: "¥",
    tlds: ["jp"],
    locale: "ja-JP",
  },
  {
    value: "CHF",
    label: "Swiss Franc",
    symbol: "CHF",
    tlds: ["ch"],
    locale: "de-CH",
  },
  {
    value: "CAD",
    label: "Canadian Dollar",
    symbol: "CAD",
    tlds: ["ca"],
    locale: "en-CA",
  },
  {
    value: "AUD",
    label: "Australian Dollar",
    symbol: "AUD",
    tlds: ["au"],
    locale: "en-AU",
  },
  {
    value: "NZD",
    label: "New Zealand Dollar",
    symbol: "NZD",
    tlds: ["nz"],
    locale: "en-NZ",
  },
  {
    value: "CNY",
    label: "Chinese Yuan",
    symbol: "¥",
    tlds: ["cn"],
    locale: "zh-CN",
  },
  {
    value: "HKD",
    label: "Hong Kong Dollar",
    symbol: "HKD",
    tlds: ["hk"],
    locale: "zh-HK",
  },
  {
    value: "SGD",
    label: "Singapore Dollar",
    symbol: "SGD",
    tlds: ["sg"],
    locale: "en-SG",
  },
] as const;

export type Currency = (typeof CURRENCIES)[number]["value"];

// Currency extraction confidence scores
export const CURRENCY_CONFIDENCE = {
  JSONLD: 3.0,
  META: 2.5,
  TLD: 2.0,
  LANGUAGE: 1.5,
  CODE: 1.3,
  UNAMBIGUOUS_SYMBOL: 1.2,
  FORMAT: 1.1,
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

// Exchange rates and currency conversion
export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  DKK: 6.95,
  SEK: 9.5,
  NOK: 9.5,
  GBP: 0.82,
  CAD: 1.35,
};

export const PRICE_SELECTORS = {
  JSONLD_PATHS: [
    ["offers", "price"],
    ["offers", 0, "price"],
    ["offers", "lowPrice"],
    ["product", "offers", "price"],
  ],
  META: [
    { selector: 'meta[property="og:price:amount"]', attr: "content" },
    { selector: 'meta[property="product:price:amount"]', attr: "content" },
    { selector: 'meta[itemprop="price"]', attr: "content" },
  ],
  PRICE: [
    ".price",
    "[itemprop='price']",
    ".product-price",
    ".offer-price",
    ".sales-price",
    ".current-price",
    "#priceblock_ourprice",
    "#priceblock_dealprice",
    ".a-price .a-offscreen",
    "#price_inside_buybox",
    "[data-price-type='finalPrice']",
    "[data-price-amount]",
    ".product-info-price .price",
    ".product-price-value",
    "[class*='price']", // Added to handle dynamic classes
  ],
};

export const IMAGE_LIMITS = {
  MAX_IMAGES: 8,
} as const;

export const TITLE_SELECTORS = {
  META: [
    { selector: 'meta[property="og:title"]', attr: "content" },
    { selector: 'meta[name="title"]', attr: "content" },
    { selector: 'meta[property="product:name"]', attr: "content" },
    { selector: 'meta[name="twitter:title"]', attr: "content" },
  ],
  HTML: [
    { selector: '[itemprop="name"]', attr: "textContent" },
    { selector: ".product-title", attr: "textContent" },
    { selector: ".product-name", attr: "textContent" },
    { selector: "#product-title", attr: "textContent" },
    { selector: "h1", attr: "textContent" },
    { selector: "title", attr: "textContent" },
  ],
} as const;

export const TITLE_CLEANING = {
  SEPARATORS: [",", " - ", " – ", " — ", " : ", ": ", " | ", "| "],
  METADATA_PATTERNS: [
    /\.(com|net|org|dk|co\.uk|de)(\s|:|$)/i,
    /^[0-9\s,]+$/,
    /^[A-Z\s]+$/,
    /^.*\.(com|net|org|dk|co\.uk|de)\b/i,
    /^[^:]+:[^:]+$/,
    /^[A-Z][A-Z\s]+$/,
    /.+/,
  ],
  MAX_LENGTH: 200,
} as const;

export const IMAGE_SELECTORS = {
  META: [
    { selector: 'meta[property="og:image"]', attr: "content" },
    { selector: 'meta[property="og:image:url"]', attr: "content" },
    { selector: 'meta[property="og:image:secure_url"]', attr: "content" },
    { selector: 'meta[name="twitter:image"]', attr: "content" },
    { selector: 'meta[name="twitter:image:src"]', attr: "content" },
    { selector: 'meta[property="product:image"]', attr: "content" },
    { selector: '[itemprop="image"]', attr: "content" },
  ],
  HTML: [
    { selector: '[itemprop="image"]', attr: "src" },
    { selector: "#product-image", attr: "src" },
    { selector: ".product-image img", attr: "src" },
    { selector: ".product-image-main img", attr: "src" },
    { selector: "[data-main-image]", attr: "src" },
    { selector: ".product-gallery img", attr: "src" },
    { selector: ".product-images img", attr: "src" },
    { selector: '[data-gallery-role="gallery-placeholder"] img', attr: "src" },
    { selector: "#imageBlock img", attr: "src" },
    { selector: ".imgTagWrapper img", attr: "src" },
  ],
  JSONLD_PATHS: [["image"], ["offers", "image"]],
} as const;

export const IMAGE_URL_NORMALIZATION = {
  FORCE_HTTPS: true,
  PROTOCOL_PREFIX: "https:",
} as const;

export const IMAGE_SCORING = {
  MIN_WIDTH: 200,
  MIN_HEIGHT: 200,
  PREFERRED_WIDTH: 800,
  PREFERRED_HEIGHT: 800,
  SCORES: {
    META: 100,
    PRODUCT: 80,
    GALLERY: 60,
    GENERIC: 40,
    SIZE_BONUS: 20, // Bonus for images meeting preferred dimensions
    SIZE_PENALTY: -30, // Penalty for images below minimum dimensions
  },
} as const;
