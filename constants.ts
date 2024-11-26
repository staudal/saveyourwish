export const WISHLIST_CATEGORIES = [
  "None",
  "Christmas",
  "Birthday",
  "Wedding",
] as const;

export const CURRENCIES = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "DKK", label: "Danish Krone", symbol: "kr" },
] as const;

export type Currency = (typeof CURRENCIES)[number]["value"];

export const CURRENCY_VALUES = ["USD", "EUR", "DKK"] as const;
