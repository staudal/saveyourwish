export const PRICE_SELECTORS = {
  JSONLD_PATHS: [["offers", "price"], ["offers", "lowPrice"], ["price"]],
  META: [
    'meta[property="og:price:amount"]',
    'meta[property="product:price:amount"]',
    'meta[name="twitter:data1"]',
  ],
} as const;

export const BOT_DETECTION_PATTERNS = [
  "bot detected",
  "bot protection",
  "ddos protection",
  "security check",
  "access denied",
  "please verify you are a human",
  "please prove you are human",
  "automated access",
  "browser verification",
  "browser check",
  "cloudflare",
  "challenge-form",
  "challenge page",
  "blocked",
  "verify your identity",
] as const;
