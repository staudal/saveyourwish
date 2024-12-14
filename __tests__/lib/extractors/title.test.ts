import { titleExtractor } from "@/lib/extractors/title";
import { describe, it, expect } from "vitest";
import { setupTestEnv } from "@/__tests__/lib/test-utils";

describe("titleExtractor", () => {
  const { createMockDocument } = setupTestEnv();

  describe("metadata extraction", () => {
    it("extracts title from meta tags in order of priority", () => {
      const variations = [
        {
          html: '<meta property="og:title" content="OG Title" />',
          expected: "OG Title",
        },
        {
          html: '<meta name="title" content="Meta Title" />',
          expected: "Meta Title",
        },
        {
          html: '<meta property="product:name" content="Product Name" />',
          expected: "Product Name",
        },
        {
          html: '<meta name="twitter:title" content="Twitter Title" />',
          expected: "Twitter Title",
        },
      ];

      for (const { html, expected } of variations) {
        const doc = createMockDocument(html);
        expect(titleExtractor.extract(doc)).toBe(expected);
      }
    });

    it("extracts title from common HTML elements", () => {
      const variations = [
        {
          html: '<div itemprop="name">Product Name</div>',
          expected: "Product Name",
        },
        {
          html: '<div class="product-title">Product Title</div>',
          expected: "Product Title",
        },
        {
          html: '<div class="product-name">Product Name</div>',
          expected: "Product Name",
        },
        {
          html: '<div id="product-title">Product Title</div>',
          expected: "Product Title",
        },
        {
          html: "<h1>Page Heading</h1>",
          expected: "Page Heading",
        },
        {
          html: "<title>Page Title</title>",
          expected: "Page Title",
        },
      ];

      for (const { html, expected } of variations) {
        const doc = createMockDocument(html);
        expect(titleExtractor.extract(doc)).toBe(expected);
      }
    });
  });

  describe("title cleaning", () => {
    it("removes common separators and site names", () => {
      const variations = [
        {
          title: "Product Name | Example.com",
          expected: "Product Name",
        },
        {
          title: "Product Name - Example.com",
          expected: "Product Name",
        },
        {
          title: "Product Name – Example.com",
          expected: "Product Name",
        },
        {
          title: "Product Name — Example.com",
          expected: "Product Name",
        },
        {
          title: "Product Name : Example.com",
          expected: "Product Name",
        },
        {
          title: "Product Name: Example.com",
          expected: "Product Name",
        },
      ];

      for (const { title, expected } of variations) {
        expect(titleExtractor.clean(title)).toBe(expected);
      }
    });

    it("removes common TLDs", () => {
      const variations = [
        {
          title: "Product Name | example.com",
          expected: "Product Name",
        },
        {
          title: "Product Name | example.net",
          expected: "Product Name",
        },
        {
          title: "Product Name | example.org",
          expected: "Product Name",
        },
        {
          title: "Product Name | example.co.uk",
          expected: "Product Name",
        },
      ];

      for (const { title, expected } of variations) {
        expect(titleExtractor.clean(title)).toBe(expected);
      }
    });

    it("handles multiple separators", () => {
      const variations = [
        {
          title: "Product Name | Category | Example.com",
          expected: "Product Name",
        },
        {
          title: "Product Name - Subcategory - Example.com",
          expected: "Product Name",
        },
      ];

      for (const { title, expected } of variations) {
        expect(titleExtractor.clean(title)).toBe(expected);
      }
    });

    it("preserves original title when cleaning would make it empty", () => {
      const variations = [
        {
          title: "Example.com",
          expected: "Example.com",
        },
        {
          title: "SITE NAME",
          expected: "SITE NAME",
        },
      ];

      for (const { title, expected } of variations) {
        expect(titleExtractor.clean(title)).toBe(expected);
      }
    });

    it("normalizes whitespace", () => {
      const variations = [
        {
          title: "Product   Name  |  Example.com",
          expected: "Product Name",
        },
        {
          title: " Product Name ",
          expected: "Product Name",
        },
        {
          title: "Product\nName | Example.com",
          expected: "Product Name",
        },
      ];

      for (const { title, expected } of variations) {
        expect(titleExtractor.clean(title)).toBe(expected);
      }
    });
  });

  describe("priority and edge cases", () => {
    it("prioritizes metadata over HTML elements", () => {
      const doc = createMockDocument(`
        <meta property="og:title" content="OG Title" />
        <h1>Page Heading</h1>
        <title>Page Title</title>
      `);
      expect(titleExtractor.extract(doc)).toBe("OG Title");
    });

    it("handles missing title gracefully", () => {
      const doc = createMockDocument(`
        <div>Some content without title</div>
      `);
      expect(titleExtractor.extract(doc)).toBeUndefined();
    });

    it("handles empty or whitespace-only titles", () => {
      const variations = [
        '<meta property="og:title" content="" />',
        '<meta property="og:title" content="   " />',
        "<h1>   </h1>",
        "<title></title>",
      ];

      for (const html of variations) {
        const doc = createMockDocument(html);
        expect(titleExtractor.extract(doc)).toBeUndefined();
      }
    });

    it("preserves special characters and unicode", () => {
      const variations = [
        {
          html: '<meta property="og:title" content="Product™ - Special Edition®" />',
          expected: "Product™",
        },
        {
          html: "<h1>café & restaurant</h1>",
          expected: "café & restaurant",
        },
        {
          html: "<title>münich bräuhaus | example.com</title>",
          expected: "münich bräuhaus",
        },
      ];

      for (const { html, expected } of variations) {
        const doc = createMockDocument(html);
        expect(titleExtractor.extract(doc)).toBe(expected);
      }
    });
  });
});
