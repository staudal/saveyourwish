import { currencyExtractor, priceExtractor } from "@/lib/extractors";

const FETCH_TIMEOUT = 5000;

export const priceFetcher = {
  async fetch(document: Document) {
    try {
      const [price, currency] = await Promise.all([
        Promise.race([
          priceExtractor.extract(document),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), FETCH_TIMEOUT)
          ),
        ]),
        currencyExtractor.extract(document),
      ]);

      return { price, currency };
    } catch (error) {
      console.error("Price fetching failed:", error);
      return { price: undefined, currency: undefined };
    }
  },
};
