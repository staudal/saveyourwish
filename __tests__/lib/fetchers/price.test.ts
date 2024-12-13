import { priceFetcher } from "@/lib/fetchers/price";
import { describe, it, expect, vi } from "vitest";
import { setupTestEnv } from "@/__tests__/lib/test-utils";
import { priceExtractor } from "@/lib/extractors/price";

describe("priceFetcher", () => {
  const { createMockDocument } = setupTestEnv();

  describe("fetch", () => {
    it("combines price and currency from JSON-LD", async () => {
      const doc = createMockDocument(`
        <script type="application/ld+json">
          { 
            "offers": { 
              "price": "99.99",
              "priceCurrency": "USD"
            }
          }
        </script>
      `);
      expect(await priceFetcher.fetch(doc)).toEqual({
        price: 99.99,
        currency: "USD",
      });
    });

    it("combines price and currency from different sources", async () => {
      const doc = createMockDocument(`
        <meta property="product:price:amount" content="99.99" />
        <meta property="product:price:currency" content="EUR" />
      `);
      expect(await priceFetcher.fetch(doc)).toEqual({
        price: 99.99,
        currency: "EUR",
      });
    });

    it("handles missing price or currency", async () => {
      const doc = createMockDocument(`
        <meta property="product:price:amount" content="99.99" />
      `);
      expect(await priceFetcher.fetch(doc)).toEqual({
        price: 99.99,
        currency: undefined,
      });
    });

    it("handles invalid inputs", async () => {
      const doc = createMockDocument(`<div>Invalid</div>`);
      expect(await priceFetcher.fetch(doc)).toEqual({
        price: undefined,
        currency: undefined,
      });
    });
  });

  it("handles network timeouts", async () => {
    const doc = createMockDocument(`
      <meta property="og:price:amount" content="99.99">
    `);

    // Mock a slow extraction that rejects
    vi.spyOn(priceExtractor, "extract").mockRejectedValue(new Error("Timeout"));

    const result = await priceFetcher.fetch(doc);
    expect(result).toEqual({
      price: undefined,
      currency: undefined,
    });
  });

  it("handles extraction errors", async () => {
    const doc = createMockDocument(`<div>Invalid</div>`);

    vi.spyOn(priceExtractor, "extract").mockImplementation(() => {
      throw new Error("Extraction failed");
    });

    const result = await priceFetcher.fetch(doc);
    expect(result).toEqual({
      price: undefined,
      currency: undefined,
    });
  });
});
