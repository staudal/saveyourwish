import { currencyExtractor } from "@/lib/extractors/currency";
import { describe, it, expect } from "vitest";
import { setupTestEnv } from "@/__tests__/lib/test-utils";

describe("currencyExtractor", () => {
  const { createMockDocument } = setupTestEnv();

  describe("JSON-LD extraction", () => {
    it("extracts currency from direct priceCurrency path", () => {
      const doc = createMockDocument(`
        <script type="application/ld+json">
          { "priceCurrency": "usd" }
        </script>
      `);
      expect(currencyExtractor.extract(doc)).toBe("USD");
    });

    it("extracts currency from offers.priceCurrency path", () => {
      const doc = createMockDocument(`
        <script type="application/ld+json">
          { "offers": { "priceCurrency": "eur" } }
        </script>
      `);
      expect(currencyExtractor.extract(doc)).toBe("EUR");
    });

    it("extracts currency from array of offers", () => {
      const doc = createMockDocument(`
        <script type="application/ld+json">
          { "offers": [{ "priceCurrency": "dkk" }] }
        </script>
      `);
      expect(currencyExtractor.extract(doc)).toBe("DKK");
    });

    it("extracts currency from priceSpecification", () => {
      const doc = createMockDocument(`
        <script type="application/ld+json">
          { "offers": [{ "priceSpecification": { "priceCurrency": "gbp" } }] }
        </script>
      `);
      expect(currencyExtractor.extract(doc)).toBe("GBP");
    });
  });

  describe("Meta tag extraction", () => {
    it("extracts currency from og:price:currency", () => {
      const doc = createMockDocument(`
        <meta property="og:price:currency" content="EUR" />
      `);
      expect(currencyExtractor.extract(doc)).toBe("EUR");
    });

    it("extracts currency from product:price:currency", () => {
      const doc = createMockDocument(`
        <meta property="product:price:currency" content="USD" />
      `);
      expect(currencyExtractor.extract(doc)).toBe("USD");
    });

    it("extracts currency from itemprop priceCurrency", () => {
      const doc = createMockDocument(`
        <meta itemprop="priceCurrency" content="NOK" />
      `);
      expect(currencyExtractor.extract(doc)).toBe("NOK");
    });

    it("extracts currency from data-currency attribute", () => {
      const doc = createMockDocument(`
        <div data-currency content="SEK"></div>
      `);
      expect(currencyExtractor.extract(doc)).toBe("SEK");
    });
  });

  describe("Symbol detection", () => {
    it("detects USD from $ symbol", () => {
      const doc = createMockDocument(`
        <div class="price">$99.99</div>
      `);
      expect(currencyExtractor.extract(doc)).toBe("USD");
    });

    it("detects EUR from € symbol", () => {
      const doc = createMockDocument(`
        <div class="price">€99.99</div>
      `);
      expect(currencyExtractor.extract(doc)).toBe("EUR");
    });

    it("detects GBP from £ symbol", () => {
      const doc = createMockDocument(`
        <div class="price">£99.99</div>
      `);
      expect(currencyExtractor.extract(doc)).toBe("GBP");
    });

    it("detects DKK from DKK symbol", () => {
      const doc = createMockDocument(`
        <div class="product-price special-price">DKK 99.99</div>
      `);
      expect(currencyExtractor.extract(doc)).toBe("DKK");
    });

    it("detects NOK from NOK symbol", () => {
      const doc = createMockDocument(`
        <div class="product-price special-price">NOK 99.99</div>
      `);
      expect(currencyExtractor.extract(doc)).toBe("NOK");
    });

    it("detects SEK from SEK symbol", () => {
      const doc = createMockDocument(`
        <div class="product-price special-price">SEK 99.99</div>
      `);
      expect(currencyExtractor.extract(doc)).toBe("SEK");
    });
  });

  describe("Edge cases", () => {
    it("returns undefined when no currency is found", () => {
      const doc = createMockDocument(`
        <div>No currency information here</div>
      `);
      expect(currencyExtractor.extract(doc)).toBeUndefined();
    });

    it("handles multiple currency symbols and prioritizes metadata", () => {
      const doc = createMockDocument(`
        <meta property="og:price:currency" content="USD" />
        <div class="price">€99.99</div>
      `);
      expect(currencyExtractor.extract(doc)).toBe("USD");
    });

    it("handles malformed JSON-LD", () => {
      const doc = createMockDocument(`
        <script type="application/ld+json">
          { invalid json
        </script>
      `);
      expect(currencyExtractor.extract(doc)).toBeUndefined();
    });

    it("handles empty content in meta tags", () => {
      const doc = createMockDocument(`
        <meta property="og:price:currency" content="" />
      `);
      expect(currencyExtractor.extract(doc)).toBeUndefined();
    });

    it("handles case-insensitive currency codes", () => {
      const doc = createMockDocument(`
        <div class="price">dkk 99.99</div>
      `);
      expect(currencyExtractor.extract(doc)).toBe("DKK");
    });

    it("prioritizes JSON-LD over meta tags and symbols", () => {
      const doc = createMockDocument(`
        <script type="application/ld+json">
          { "priceCurrency": "USD" }
        </script>
        <meta property="og:price:currency" content="EUR" />
        <div class="price">£99.99</div>
      `);
      expect(currencyExtractor.extract(doc)).toBe("USD");
    });

    it("handles multiple price elements and returns first valid currency", () => {
      const doc = createMockDocument(`
        <div class="price">Invalid price</div>
        <div class="product-price">€99.99</div>
        <div class="special-price">$199.99</div>
      `);
      expect(currencyExtractor.extract(doc)).toBe("EUR");
    });

    it("handles missing currency", () => {
      const doc = createMockDocument(`<div>No currency here</div>`);
      expect(currencyExtractor.extract(doc)).toBeUndefined();
    });

    it("handles invalid currency codes", () => {
      const doc = createMockDocument(`
        <meta property="product:price:currency" content="INVALID" />
      `);
      expect(currencyExtractor.extract(doc)).toBeUndefined();
    });
  });
});
