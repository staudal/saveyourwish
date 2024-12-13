export const WISHLIST_CATEGORIES = [
  "None",
  "Christmas",
  "Birthday",
  "Wedding",
] as const;

export type DialogState = "url" | "configure";

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

// Example conversion rates (you should use a real exchange rate API in production)
const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  DKK: 6.95,
  SEK: 9.5,
  NOK: 9.5,
  GBP: 0.82,
};

export function convertToUSD(amount: number, fromCurrency: Currency): number {
  if (fromCurrency === "USD") return amount;
  const rate = EXCHANGE_RATES[fromCurrency];
  if (!rate) return amount; // fallback
  return amount / rate;
}

function getMostCommonCurrency(
  wishes: { price: number | null; currency: Currency }[]
): Currency {
  const validWishes = wishes.filter((wish) => wish.price !== null);
  if (validWishes.length === 0) return "USD"; // default fallback

  // Count occurrences of each currency
  const currencyCounts = validWishes.reduce((acc, wish) => {
    acc[wish.currency] = (acc[wish.currency] || 0) + 1;
    return acc;
  }, {} as Record<Currency, number>);

  // Find the currency with the highest count
  return Object.entries(currencyCounts).reduce((a, b) =>
    currencyCounts[a[0] as Currency] > b[1] ? a : b
  )[0] as Currency;
}

function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amount;

  // First convert to USD
  const amountInUSD = convertToUSD(amount, fromCurrency);

  // Then convert from USD to target currency
  if (toCurrency === "USD") return amountInUSD;
  return amountInUSD * EXCHANGE_RATES[toCurrency];
}

export function calculateAveragePrice(
  wishes: { price: number | null; currency: Currency }[]
): { amount: number; currency: Currency } | null {
  const validWishes = wishes.filter((wish) => wish.price !== null);
  if (validWishes.length === 0) return null;

  // Determine the most common currency
  const targetCurrency = getMostCommonCurrency(validWishes);

  // Convert all prices to the target currency and calculate average
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
