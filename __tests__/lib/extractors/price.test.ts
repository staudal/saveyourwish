import { priceExtractor } from "@/lib/extractors/price";
import { describe, expect, test } from "vitest";
import { setupTestEnv } from "@/__tests__/lib/test-utils";

describe("priceExtractor", () => {
  const { createMockDocument } = setupTestEnv();

  describe("extract", () => {
    describe("data sources", () => {
      test("extracts price from JSON-LD", () => {
        const html = `
          <script type="application/ld+json">
            {
              "offers": {
                "price": "99.99"
              }
            }
          </script>
        `;
        const doc = createMockDocument(html);
        expect(priceExtractor.extract(doc)).toBe(99.99);
      });

      test("extracts price from meta tags", () => {
        const html = `<meta property="og:price:amount" content="89.99" />`;
        const doc = createMockDocument(html);
        expect(priceExtractor.extract(doc)).toBe(89.99);
      });

      test("extracts price from HTML elements", () => {
        const html = `<div class="price">79.99</div>`;
        const doc = createMockDocument(html);
        expect(priceExtractor.extract(doc)).toBe(79.99);
      });
    });

    describe("number formats", () => {
      const cases = [
        // Common formats
        { desc: "simple number", html: "99.99", expected: 99.99 },
        {
          desc: "with currency symbol before",
          html: "$99.99",
          expected: 99.99,
        },
        { desc: "with currency symbol after", html: "99.99€", expected: 99.99 },
        { desc: "with currency code", html: "USD 99.99", expected: 99.99 },
        {
          desc: "with thousands separator",
          html: "1,234.56",
          expected: 1234.56,
        },
        { desc: "European format", html: "1.234,56", expected: 1234.56 },
        { desc: "no decimals", html: "1234", expected: 1234 },
        {
          desc: "with space group separator",
          html: "1 234,56",
          expected: 1234.56,
        },
      ];

      test.each(cases)("handles $desc", ({ html, expected }) => {
        const doc = createMockDocument(`<div>${html}</div>`);
        expect(priceExtractor.extract(doc)).toBe(expected);
      });
    });

    describe("edge cases", () => {
      test("handles price ranges by taking lowest", () => {
        const cases = [
          `<div>99.99 - 149.99</div>`,
          `<div>From 99.99 to 149.99</div>`,
          `<div>99.99-149.99</div>`,
          `<div>99.99～149.99</div>`, // Japanese range
        ];

        for (const html of cases) {
          const doc = createMockDocument(html);
          expect(priceExtractor.extract(doc)).toBe(99.99);
        }
      });

      test("handles multiple prices by taking lowest valid price", () => {
        const html = `
          <div>
            <div>Original: $149.99</div>
            <div>Sale: $99.99</div>
            <div>Members: $89.99</div>
          </div>
        `;
        const doc = createMockDocument(html);
        expect(priceExtractor.extract(doc)).toBe(89.99);
      });
    });

    describe("invalid inputs", () => {
      const invalidCases = [
        { desc: "empty string", html: "" },
        { desc: "negative price", html: "-123.45" },
        { desc: "zero price", html: "0.00" },
        { desc: "text only", html: "Contact us" },
        { desc: "phone number", html: "Call 1-800-123-4567" },
        { desc: "date", html: "12/34/56" },
      ];

      test.each(invalidCases)("rejects $desc", ({ html }) => {
        const doc = createMockDocument(html);
        expect(priceExtractor.extract(doc)).toBeUndefined();
      });
    });
  });
});
