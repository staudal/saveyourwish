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
  { value: "SEK", label: "Swedish Krona", symbol: "kr" },
] as const;

export type Currency = (typeof CURRENCIES)[number]["value"];

export const CURRENCY_VALUES = ["USD", "EUR", "DKK", "SEK"] as const;

// Example conversion rates (you should use a real exchange rate API in production)
const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  DKK: 6.95,
  SEK: 9.5,
};

export function convertToUSD(amount: number, fromCurrency: Currency): number {
  if (fromCurrency === "USD") return amount;
  const rate = EXCHANGE_RATES[fromCurrency];
  if (!rate) return amount; // fallback
  return amount / rate;
}

export function calculateAveragePrice(
  wishes: { price: number | null; currency: Currency }[]
): number | null {
  const validWishes = wishes.filter((wish) => wish.price !== null);
  if (validWishes.length === 0) return null;

  const totalInUSD = validWishes.reduce((sum, wish) => {
    return sum + convertToUSD(wish.price!, wish.currency);
  }, 0);

  return totalInUSD / validWishes.length;
}
