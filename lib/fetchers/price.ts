import { DocumentInput, FetchResponse, PriceData } from "./types";
import { getDocument } from "./utils";
import { priceExtractor } from "../extractors/price";
import { currencyExtractor } from "../extractors/currency";

const FETCH_TIMEOUT = 5000;

export const priceFetcher = {
  async fetch(
    input: string | DocumentInput
  ): Promise<FetchResponse<PriceData>> {
    try {
      // URL validation
      if (typeof input === "string") {
        if (!input.startsWith("http")) {
          return { success: false, error: "Invalid URL format" };
        }
      }

      // Get document
      const document =
        typeof input === "string" ? await getDocument(input) : input;

      // Extract price and currency with timeout
      const [price, currency] = await Promise.all([
        Promise.race<number | undefined>([
          priceExtractor.extract(document),
          new Promise<number>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), FETCH_TIMEOUT)
          ),
        ]),
        currencyExtractor.extract(document),
      ]);

      if (!price || !currency) {
        return { success: false, error: "Failed to extract price or currency" };
      }

      return { success: true, data: { price, currency } };
    } catch (error) {
      console.error("Error fetching price:", error);
      return {
        success: false,
        error:
          error instanceof Error && error.message === "Timeout"
            ? "Price extraction timed out"
            : typeof input === "string"
            ? "Failed to fetch price"
            : "Failed to extract price",
      };
    }
  },
};
