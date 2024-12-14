export const PRICE_SELECTORS = {
  JSONLD_PATHS: [["offers", "price"], ["offers", "lowPrice"], ["price"]],
  META: [
    'meta[property="og:price:amount"]',
    'meta[property="product:price:amount"]',
    'meta[name="twitter:data1"]',
  ],
} as const;
