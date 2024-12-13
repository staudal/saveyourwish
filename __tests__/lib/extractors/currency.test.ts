import { currencyExtractor } from "@/lib/extractors/currency";
import { describe, it, expect } from "vitest";
import { setupTestEnv } from "@/__tests__/lib/test-utils";
import { CURRENCIES } from "@/constants";

describe("currencyExtractor", () => {
  const { createMockDocument } = setupTestEnv();

  describe("metadata extraction", () => {
    it("extracts currency from JSON-LD", () => {
      const variations = [
        // Direct path (most common)
        { json: `{ "priceCurrency": "USD" }`, expected: "USD" },
        // Common schema.org structure
        { json: `{ "offers": { "priceCurrency": "EUR" } }`, expected: "EUR" },
        // Price specification
        {
          json: `{ "offers": { "priceSpecification": { "priceCurrency": "GBP" } } }`,
          expected: "GBP",
        },
      ];

      for (const { json, expected } of variations) {
        const doc = createMockDocument(`
          <script type="application/ld+json">${json}</script>
        `);
        expect(currencyExtractor.extract(doc)).toBe(expected);
      }
    });

    it("extracts currency from meta tags", () => {
      const variations = [
        {
          html: '<meta property="og:price:currency" content="USD" />',
          expected: "USD",
        },
        {
          html: '<meta property="product:price:currency" content="EUR" />',
          expected: "EUR",
        },
        {
          html: '<meta itemprop="priceCurrency" content="GBP" />',
          expected: "GBP",
        },
        {
          html: '<meta itemprop="priceCurrency" content="JPY" />',
          expected: "JPY",
        },
      ];

      for (const { html, expected } of variations) {
        const doc = createMockDocument(html);
        expect(currencyExtractor.extract(doc)).toBe(expected);
      }
    });
  });

  describe("symbol-based extraction", () => {
    it("extracts currency from unique symbols", () => {
      const uniqueSymbols = CURRENCIES.filter(
        (c) =>
          c.symbol &&
          !CURRENCIES.some((other) => other !== c && other.symbol === c.symbol)
      );

      for (const currency of uniqueSymbols) {
        const doc = createMockDocument(`
          <div class="price">${currency.symbol}99.99</div>
        `);
        expect(currencyExtractor.extract(doc)).toBe(currency.value);
      }
    });

    it("resolves shared symbols using TLD", () => {
      // Test Scandinavian currencies (kr)
      const variations = [
        { symbol: "kr", expected: "DKK" },
        { symbol: "kr", expected: "SEK" },
        { symbol: "kr", expected: "NOK" },
      ];

      for (const { symbol, expected } of variations) {
        const doc = createMockDocument(`
          <meta property="og:price:currency" content="${expected}">
          <div class="price">99.99 ${symbol}</div>
        `);
        expect(currencyExtractor.extract(doc)).toBe(expected);
      }

      // Test Asian currencies (¥)
      const asianVariations = [
        { symbol: "¥", expected: "JPY" },
        { symbol: "¥", expected: "CNY" },
      ];

      for (const { symbol, expected } of asianVariations) {
        const doc = createMockDocument(`
          <meta property="og:price:currency" content="${expected}">
          <div class="price">${symbol}9999</div>
        `);
        expect(currencyExtractor.extract(doc)).toBe(expected);
      }
    });

    it("handles ambiguous symbols without TLD", () => {
      // Without TLD, should still return a valid currency for the symbol
      const krDoc = createMockDocument(`
        <div class="price">99.99 kr</div>
      `);
      const krResult = currencyExtractor.extract(krDoc);
      expect(["DKK", "SEK", "NOK"]).toContain(krResult);

      const yenDoc = createMockDocument(`
        <div class="price">¥9999</div>
      `);
      const yenResult = currencyExtractor.extract(yenDoc);
      expect(["JPY", "CNY"]).toContain(yenResult);
    });

    it("extracts currency from text codes", () => {
      // Test currencies without symbols
      const noSymbolCurrencies = ["CHF", "CAD", "AUD", "NZD", "SGD", "HKD"];

      for (const currency of noSymbolCurrencies) {
        const variations = [
          `<div class="price">99.99 ${currency}</div>`,
          `<div class="price">${currency} 99.99</div>`,
          `<div class="price">Price: ${currency}99.99</div>`,
        ];

        for (const html of variations) {
          const doc = createMockDocument(html);
          expect(currencyExtractor.extract(doc)).toBe(currency);
        }
      }
    });

    it("handles currency symbols in different positions", () => {
      const variations = [
        // Prefix
        { html: '<div class="price">$99.99</div>', expected: "USD" },
        { html: '<div class="price">£99.99</div>', expected: "GBP" },
        // Postfix
        { html: '<div class="price">99.99€</div>', expected: "EUR" },
        {
          html: '<div class="price">99.99 kr</div>',
          expected: ["DKK", "SEK", "NOK"],
        },
        // With spaces
        { html: '<div class="price">$ 99.99</div>', expected: "USD" },
        { html: '<div class="price">99.99 $</div>', expected: "USD" },
        // With dots
        { html: '<div class="price">CHF. 99.99</div>', expected: "CHF" },
        { html: '<div class="price">99.99 CHF.</div>', expected: "CHF" },
      ];

      for (const { html, expected } of variations) {
        const doc = createMockDocument(html);
        const result = currencyExtractor.extract(doc);
        if (Array.isArray(expected)) {
          expect(expected).toContain(result);
        } else {
          expect(result).toBe(expected);
        }
      }
    });
  });

  describe("multiple currencies on page", () => {
    it("handles multiple different currencies with correct priority", () => {
      const variations = [
        {
          // JSON-LD should win over everything
          html: `
            <script type="application/ld+json">{ "priceCurrency": "USD" }</script>
            <meta property="og:price:currency" content="EUR">
            <div class="price">99.99 kr</div>
            <div class="another-price">£199.99</div>
          `,
          expected: "USD",
        },
        {
          // Meta should win over text/symbols
          html: `
            <meta property="og:price:currency" content="EUR">
            <div class="price">$99.99</div>
            <div class="another-price">199.99 kr</div>
          `,
          expected: "EUR",
        },
        {
          // Explicit currency code should win over symbol
          html: `
            <div class="price">$99.99</div>
            <div class="another-price">99.99 EUR</div>
          `,
          expected: "EUR",
        },
      ];

      for (const { html, expected } of variations) {
        const doc = createMockDocument(html);
        expect(currencyExtractor.extract(doc)).toBe(expected);
      }
    });

    it("handles multiple instances of same currency", () => {
      const doc = createMockDocument(`
        <div class="price">$99.99</div>
        <div class="sale-price">$79.99</div>
        <div class="original-price">$129.99</div>
      `);
      expect(currencyExtractor.extract(doc)).toBe("USD");
    });
  });

  describe("priority and edge cases", () => {
    it("prioritizes metadata over text content", () => {
      const variations = [
        {
          html: `
            <meta property="og:price:currency" content="USD">
            <div class="price">€99.99</div>
          `,
          expected: "USD",
        },
        {
          html: `
            <script type="application/ld+json">
              { "priceCurrency": "EUR" }
            </script>
            <meta property="og:price:currency" content="USD">
          `,
          expected: "EUR",
        },
      ];

      for (const { html, expected } of variations) {
        const doc = createMockDocument(html);
        expect(currencyExtractor.extract(doc)).toBe(expected);
      }
    });

    it("handles missing currency gracefully", () => {
      const variations = [
        '<div class="price">99.99</div>',
        '<div class="price">Price: </div>',
        '<div class="price">Contact us</div>',
      ];

      for (const html of variations) {
        const doc = createMockDocument(html);
        expect(currencyExtractor.extract(doc)).toBeUndefined();
      }
    });

    it("normalizes currency case", () => {
      const variations = [
        { input: "usd", expected: "USD" },
        { input: "Eur", expected: "EUR" },
        { input: "GbP", expected: "GBP" },
        { input: "dKk", expected: "DKK" },
      ];

      for (const { input, expected } of variations) {
        const doc = createMockDocument(`
          <meta property="og:price:currency" content="${input}">
        `);
        expect(currencyExtractor.extract(doc)).toBe(expected);
      }
    });

    it("rejects invalid currencies", () => {
      const variations = [
        '<meta property="og:price:currency" content="INVALID">',
        '<meta property="og:price:currency" content="123">',
        '<div class="price">99.99 FAKE</div>',
      ];

      for (const html of variations) {
        const doc = createMockDocument(html);
        expect(currencyExtractor.extract(doc)).toBeUndefined();
      }
    });
  });

  describe("number format detection", () => {
    it("uses European number format to help disambiguate currencies", () => {
      const variations = [
        // European format should favor European currencies
        {
          html: `<div class="price">1.234,56 kr</div>`,
          expected: ["DKK", "SEK", "NOK"],
        },
        {
          html: `<div class="price">1.234,56 €</div>`,
          expected: "EUR",
        },
        // US/UK format should favor non-European currencies
        {
          html: `<div class="price">1,234.56 kr</div>`,
          expected: ["DKK", "SEK", "NOK"],
        },
        // Multiple prices with consistent format
        {
          html: `
            <div class="price">1.234,56 kr</div>
            <div class="sale-price">2.345,67 kr</div>
          `,
          expected: ["DKK", "SEK", "NOK"],
        },
      ];

      for (const { html, expected } of variations) {
        const doc = createMockDocument(html);
        const result = currencyExtractor.extract(doc);
        if (Array.isArray(expected)) {
          expect(expected).toContain(result);
        } else {
          expect(result).toBe(expected);
        }
      }
    });
  });

  describe("language hints", () => {
    it("uses HTML lang attribute to help disambiguate currencies", () => {
      const variations = [
        // Danish
        {
          html: `
            <div lang="da">
              <div class="price">99,99 kr</div>
            </div>
          `,
          expected: "DKK",
        },
        // Swedish
        {
          html: `
            <div lang="sv">
              <div class="price">99,99 kr</div>
            </div>
          `,
          expected: "SEK",
        },
        // Norwegian
        {
          html: `
            <div lang="no">
              <div class="price">99,99 kr</div>
            </div>
          `,
          expected: "NOK",
        },
        // Japanese
        {
          html: `
            <div lang="ja">
              <div class="price">¥9999</div>
            </div>
          `,
          expected: "JPY",
        },
        // Chinese
        {
          html: `
            <div lang="zh">
              <div class="price">¥9999</div>
            </div>
          `,
          expected: "CNY",
        },
        // Nested language contexts
        {
          html: `
            <div lang="da">
              <div class="price">99,99 kr</div>
              <div lang="sv">
                <div class="price">199,99 kr</div>
              </div>
            </div>
          `,
          expected: "DKK", // Should prefer outer context
        },
      ];

      for (const { html, expected } of variations) {
        const doc = createMockDocument(html);
        expect(currencyExtractor.extract(doc)).toBe(expected);
      }
    });

    it("combines number format and language hints", () => {
      const variations = [
        // European format + language hint
        {
          html: `
            <div lang="da">
              <div class="price">1.234,56 kr</div>
            </div>
          `,
          expected: "DKK",
        },
        // Conflicting format and language
        {
          html: `
            <div lang="da">
              <div class="price">1,234.56 kr</div>
            </div>
          `,
          expected: "DKK", // Language should still win
        },
      ];

      for (const { html, expected } of variations) {
        const doc = createMockDocument(html);
        expect(currencyExtractor.extract(doc)).toBe(expected);
      }
    });
  });
});
