import { priceExtractor } from "@/lib/extractors/price";
import { describe, it, expect } from "vitest";
import { setupTestEnv } from "@/__tests__/lib/test-utils";

describe("priceExtractor", () => {
  const { createMockDocument } = setupTestEnv();

  describe("extract", () => {
    it("extracts price from JSON-LD", () => {
      const doc = createMockDocument(`
        <script type="application/ld+json">
          { "price": "99.99" }
        </script>
      `);
      expect(priceExtractor.extract(doc)).toBe(99.99);
    });

    it("extracts price from meta tags", () => {
      const doc = createMockDocument(`
        <meta property="product:price:amount" content="99.99" />
      `);
      expect(priceExtractor.extract(doc)).toBe(99.99);
    });

    it("extracts price from HTML elements", () => {
      const doc = createMockDocument(`
        <div class="price">$99.99</div>
      `);
      expect(priceExtractor.extract(doc)).toBe(99.99);
    });

    it("handles missing price", () => {
      const doc = createMockDocument(`<div>No price here</div>`);
      expect(priceExtractor.extract(doc)).toBeUndefined();
    });

    it("handles empty price elements", () => {
      const doc = createMockDocument(`
        <meta property="product:price:amount" content="" />
      `);
      expect(priceExtractor.extract(doc)).toBeUndefined();
    });

    it("handles multiple prices by selecting first valid one", () => {
      const doc = createMockDocument(`
        <meta property="product:price:amount" content="" />
        <meta property="og:price:amount" content="99.99" />
        <div class="price">199.99</div>
      `);
      expect(priceExtractor.extract(doc)).toBe(99.99);
    });

    it("handles malformed JSON-LD", () => {
      const doc = createMockDocument(`
        <script type="application/ld+json">
          { invalid json }
        </script>
      `);
      expect(priceExtractor.extract(doc)).toBeUndefined();
    });

    it("handles invalid HTML", () => {
      const doc = createMockDocument(`
        <div class="price">>>>>>1.99<<<<<<</div>
        <meta property="og:price:amount" content="<script>alert(1)</script>">
      `);
      expect(priceExtractor.extract(doc)).toBe(1.99);
    });

    it("handles missing elements", () => {
      const doc = createMockDocument(`
        <div class="not-price">99.99</div>
        <meta property="not:price:amount" content="99.99">
      `);
      expect(priceExtractor.extract(doc)).toBeUndefined();
    });
  });

  describe("clean", () => {
    it("handles US format", () => {
      expect(priceExtractor.clean("1,234.56")).toBe(1234.56);
      expect(priceExtractor.clean("$1,234.56")).toBe(1234.56);
    });

    it("handles EU format", () => {
      expect(priceExtractor.clean("1.234,56")).toBe(1234.56);
      expect(priceExtractor.clean("€1.234,56")).toBe(1234.56);
    });

    it("handles simple formats", () => {
      expect(priceExtractor.clean("1299.99")).toBe(1299.99);
      expect(priceExtractor.clean("1299,99")).toBe(1299.99);
    });

    it("handles spaces", () => {
      expect(priceExtractor.clean("1 299.99")).toBe(1299.99);
      expect(priceExtractor.clean("1 299,99")).toBe(1299.99);
    });

    it("handles invalid inputs", () => {
      expect(priceExtractor.clean("abc")).toBe(0);
      expect(priceExtractor.clean("")).toBe(0);
      expect(priceExtractor.clean("..")).toBe(0);
    });

    it("handles fractional prices", () => {
      expect(priceExtractor.clean("0.99")).toBe(0.99);
      expect(priceExtractor.clean(".99")).toBe(0.99);
    });

    it("handles extremely large numbers", () => {
      expect(priceExtractor.clean("1000000.00")).toBe(1000000.0);
      expect(priceExtractor.clean("999999999.99")).toBe(999999999.99);
    });

    it("handles multiple decimal points", () => {
      expect(priceExtractor.clean("1.299.99")).toBe(129999);
      expect(priceExtractor.clean("1,299,99")).toBe(129999);
    });

    it("handles extremely large numbers", () => {
      expect(priceExtractor.clean("999999999999.99")).toBe(0);
      expect(priceExtractor.clean("1000000000.00")).toBe(1000000000.0);
    });

    it("handles extremely small numbers", () => {
      expect(priceExtractor.clean("0.0000001")).toBe(0.0000001);
    });

    it("handles international number formats", () => {
      expect(priceExtractor.clean("1 234,56")).toBe(1234.56);
      expect(priceExtractor.clean("1.234.567,89")).toBe(1234567.89);
    });

    it("handles mixed format inputs", () => {
      expect(priceExtractor.clean("$1,234.56 USD")).toBe(1234.56);
      expect(priceExtractor.clean("EUR 1.234,56")).toBe(1234.56);
      expect(priceExtractor.clean("1 234.56 kr")).toBe(1234.56);
    });

    it("handles malformed inputs", () => {
      expect(priceExtractor.clean("1,234.56.78")).toBe(0);
      expect(priceExtractor.clean("1.23.45,67")).toBe(0);
      expect(priceExtractor.clean("price: 123")).toBe(123);
    });
  });
});
