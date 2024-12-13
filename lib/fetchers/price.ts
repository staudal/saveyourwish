import { priceExtractor } from "../extractors/price";
import { currencyExtractor } from "../extractors/currency";
import { JSDOM } from "jsdom";

const FETCH_TIMEOUT = 5000;

export const priceFetcher = {
  async fetch(input: string | Document) {
    try {
      const document =
        typeof input === "string"
          ? await fetch(input)
              .then((res) => res.text())
              .then((html) => new JSDOM(html).window.document)
          : input;

      const [price, currency] = await Promise.all([
        Promise.race([
          priceExtractor.extract(document),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), FETCH_TIMEOUT)
          ),
        ]),
        currencyExtractor.extract(document),
      ]);

      return { success: true, data: { price, currency } };
    } catch (error) {
      console.error("Price fetching failed:", error);
      return { success: false, error: "Failed to fetch price" };
    }
  },
};
