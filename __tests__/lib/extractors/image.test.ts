import { imageExtractor } from "@/lib/extractors/image";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setupTestEnv } from "@/__tests__/lib/test-utils";
import { IMAGE_LIMITS } from "@/constants";

describe("imageExtractor", () => {
  const { createMockDocument } = setupTestEnv();

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("metadata extraction", () => {
    it("extracts images from meta tags in order of priority", () => {
      const variations = [
        {
          html: '<meta property="og:image" content="https://example.com/og-image.jpg" />',
          expected: ["https://example.com/og-image.jpg"],
        },
        {
          html: '<meta property="og:image:secure_url" content="https://example.com/secure-image.jpg" />',
          expected: ["https://example.com/secure-image.jpg"],
        },
        {
          html: '<meta name="twitter:image" content="https://example.com/twitter-image.jpg" />',
          expected: ["https://example.com/twitter-image.jpg"],
        },
        {
          html: '<meta property="product:image" content="https://example.com/product-image.jpg" />',
          expected: ["https://example.com/product-image.jpg"],
        },
      ];

      for (const { html, expected } of variations) {
        const doc = createMockDocument(html);
        const results = imageExtractor.extract(doc);
        expect(results).toBeDefined();
        expect(results).toEqual(expected);
      }
    });

    it("extracts images from HTML elements", () => {
      const variations = [
        {
          html: '<img itemprop="image" src="https://example.com/product.jpg" />',
          expected: ["https://example.com/product.jpg"],
        },
        {
          html: '<div class="product-image"><img src="https://example.com/main.jpg" /></div>',
          expected: ["https://example.com/main.jpg"],
        },
        {
          html: '<div data-main-image><img src="https://example.com/gallery.jpg" /></div>',
          expected: ["https://example.com/gallery.jpg"],
        },
      ];

      for (const { html, expected } of variations) {
        const doc = createMockDocument(html);
        expect(imageExtractor.extract(doc)).toEqual(expected);
      }
    });

    it("extracts images from JSON-LD", () => {
      const variations = [
        {
          html: `
            <script type="application/ld+json">
              { "image": "https://example.com/jsonld-image.jpg" }
            </script>
          `,
          expected: ["https://example.com/jsonld-image.jpg"],
        },
        {
          html: `
            <script type="application/ld+json">
              { "offers": { "image": "https://example.com/offer-image.jpg" } }
            </script>
          `,
          expected: ["https://example.com/offer-image.jpg"],
        },
        {
          html: `
            <script type="application/ld+json">
              { "image": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"] }
            </script>
          `,
          expected: [
            "https://example.com/image1.jpg",
            "https://example.com/image2.jpg",
          ],
        },
      ];

      for (const { html, expected } of variations) {
        const doc = createMockDocument(html);
        expect(imageExtractor.extract(doc)).toEqual(expected);
      }
    });
  });

  describe("URL normalization", () => {
    it("converts protocol-relative URLs to HTTPS", () => {
      const doc = createMockDocument(`
        <img src="//example.com/image.jpg" />
      `);
      expect(imageExtractor.extract(doc)).toEqual([
        "https://example.com/image.jpg",
      ]);
    });

    it("converts HTTP to HTTPS", () => {
      const doc = createMockDocument(`
        <img src="http://example.com/image.jpg" />
      `);
      expect(imageExtractor.extract(doc)).toEqual([
        "https://example.com/image.jpg",
      ]);
    });

    it("handles relative URLs with baseUrl", () => {
      expect(
        imageExtractor.clean("/images/product.jpg", "https://example.com")
      ).toBe("https://example.com/images/product.jpg");
    });

    it("handles invalid URLs gracefully", () => {
      const invalidUrl = "not-a-url";
      expect(imageExtractor.clean(invalidUrl)).toBe(invalidUrl);
    });
  });

  describe("deduplication and scoring", () => {
    it("removes duplicate images", () => {
      const doc = createMockDocument(`
        <meta property="og:image" content="https://example.com/image.jpg" />
        <img src="https://example.com/image.jpg" />
        <img src="https://example.com/unique.jpg" />
      `);
      const results = imageExtractor.extract(doc);
      expect(results.length).toBe(2);
      expect(new Set(results).size).toBe(2);
    });

    it("prioritizes images based on source and attributes", () => {
      const doc = createMockDocument(`
        <meta property="og:image" content="https://example.com/og.jpg" />
        <img class="product-image" src="https://example.com/product.jpg" />
        <img src="https://example.com/generic.jpg" />
      `);
      const results = imageExtractor.extract(doc);
      expect(results).toBeDefined();
      expect(results[0]).toMatch(/og\.jpg$/);
    });

    it("prioritizes images found in product containers over generic images", () => {
      const doc = createMockDocument(`
        <div class="logo-container">
          <img src="https://example.com/logo.jpg" />
        </div>
        <div class="product-gallery">
          <img src="https://example.com/main-product-image-large.jpg" width="1000" height="1000" />
        </div>
        <div class="icons">
          <img src="https://example.com/icon.png" />
        </div>
      `);
      const results = imageExtractor.extract(doc);
      expect(results.length).toBeGreaterThan(0);
      // The product-gallery image should come first
      expect(results[0]).toBe(
        "https://example.com/main-product-image-large.jpg"
      );
      // Logo and icon should not outrank the main product image
      expect(results).not.toEqual(
        expect.arrayContaining([
          "https://example.com/logo.jpg",
          "https://example.com/icon.png",
        ])
      );
    });
  });

  describe("error handling", () => {
    it("handles malformed JSON-LD gracefully", () => {
      const doc = createMockDocument(`
        <script type="application/ld+json">
          { invalid json }
        </script>
        <img src="https://example.com/fallback.jpg" />
      `);
      expect(imageExtractor.extract(doc)).toEqual([
        "https://example.com/fallback.jpg",
      ]);
    });

    it("handles missing attributes gracefully", () => {
      const doc = createMockDocument(`
        <img />
        <img src="" />
        <img src="https://example.com/valid.jpg" />
      `);
      expect(imageExtractor.extract(doc)).toEqual([
        "https://example.com/valid.jpg",
      ]);
    });

    it("handles empty image lists gracefully", () => {
      const doc = createMockDocument("<div>No images here</div>");
      expect(imageExtractor.extract(doc)).toEqual([]);
    });
  });

  describe("image sizing", () => {
    it("prefers larger images", () => {
      const doc = createMockDocument(`
        <img src="https://example.com/small.jpg" width="100" height="100" />
        <img src="https://example.com/large.jpg" width="800" height="800" />
        <img src="https://example.com/medium.jpg" width="400" height="400" />
      `);
      const results = imageExtractor.extract(doc);
      expect(results).toBeDefined();
      expect(results[0]).toMatch(/large\.jpg$/);
      expect(results[results.length - 1]).toMatch(/small\.jpg$/);
    });

    it("penalizes thumbnail and icon images", () => {
      const doc = createMockDocument(`
        <img src="https://example.com/thumbnail.jpg" />
        <img src="https://example.com/icon.jpg" />
        <img src="https://example.com/product.jpg" />
      `);
      const results = imageExtractor.extract(doc);
      expect(results[0]).toMatch(/product\.jpg$/);
      expect(results).not.toEqual(
        expect.arrayContaining([expect.stringMatching(/thumbnail\.jpg$/)])
      );
    });

    it("handles missing dimension information gracefully", () => {
      const doc = createMockDocument(`
        <img src="https://example.com/no-dimensions.jpg" />
        <img src="https://example.com/with-dimensions.jpg" width="800" height="800" />
      `);
      const results = imageExtractor.extract(doc);
      expect(results.length).toBe(2);
    });

    it("extracts dimensions from srcset", () => {
      const doc = createMockDocument(`
        <img 
          src="https://example.com/responsive.jpg"
          srcset="https://example.com/small.jpg 300w,
                  https://example.com/large.jpg 1200w"
        />
      `);
      const results = imageExtractor.extract(doc);
      expect(results.length).toBe(1);
    });
  });

  describe("edge cases", () => {
    it("excludes data URIs", () => {
      const doc = createMockDocument(`
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==" />
        <img src="https://example.com/real-image.jpg" />
      `);
      const results = imageExtractor.extract(doc);
      expect(results).toEqual(["https://example.com/real-image.jpg"]);
    });

    it("handles SVGs appropriately", () => {
      const doc = createMockDocument(`
        <img src="https://example.com/logo.svg" />
        <img src="https://example.com/product.jpg" />
      `);
      const results = imageExtractor.extract(doc);
      expect(results[0]).toMatch(/product\.jpg$/);
    });

    it("handles dimension inference from filename and srcset correctly", () => {
      const html = `
        <div>
          <!-- Very small image by filename (exclude) -->
          <img src="https://example.com/flag_50x50.png" />
    
          <!-- Large image by filename -->
          <img src="https://example.com/product_1200x1200.jpg" />
    
          <!-- No explicit dimensions, but large inferred from srcset -->
          <img 
            src="https://example.com/unknown.jpg" 
            srcset="https://example.com/unknown_1080w.jpg 1080w, https://example.com/unknown_1200w.jpg 1200w"
          />
    
          <!-- A generic image with no dimension hints -->
          <img src="https://example.com/generic_image.jpg" />
        </div>
      `;

      const doc = createMockDocument(html);
      const results = imageExtractor.extract(doc);

      // We expect the large product image (1200x1200) and the srcset-inferred large image to appear first
      // The flag_50x50 should be excluded, and the generic image should come last (or not at all if dimensions are penalized)

      // The order should be:
      // 1. product_1200x1200.jpg (large by filename)
      // 2. unknown.jpg (large by srcset)
      // generic_image.jpg may appear after these two unless penalized enough.

      expect(results).toContain("https://example.com/product_1200x1200.jpg");
      expect(results).toContain("https://example.com/unknown.jpg");
      expect(results).not.toContain("https://example.com/flag_50x50.png");

      // Check ordering - product image should be first because it has "product" in the URL and large dimensions
      expect(results[0]).toBe("https://example.com/product_1200x1200.jpg");
      // The srcset large should be next
      expect(results[1]).toBe("https://example.com/unknown.jpg");

      // The generic image may or may not appear depending on your scoring rules.
      // If your logic doesn't exclude it, at least ensure it's not higher than the other two.
      if (results.includes("https://example.com/generic_image.jpg")) {
        expect(
          results.indexOf("https://example.com/generic_image.jpg")
        ).toBeGreaterThan(1);
      }
    });
  });

  describe("image limits", () => {
    it("limits the number of returned images to MAX_IMAGES", () => {
      // Create more images than the limit
      const imageUrls = Array.from(
        { length: 20 },
        (_, i) => `https://example.com/image${i + 1}.jpg`
      );

      const html = imageUrls
        .map((url) => `<img src="${url}" width="800" height="800" />`)
        .join("\n");

      const doc = createMockDocument(html);
      const results = imageExtractor.extract(doc);

      expect(results.length).toBeLessThanOrEqual(IMAGE_LIMITS.MAX_IMAGES);
      expect(results).toHaveLength(IMAGE_LIMITS.MAX_IMAGES);
    });

    it("returns all images when less than MAX_IMAGES", () => {
      const imageUrls = Array.from(
        { length: 5 },
        (_, i) => `https://example.com/image${i + 1}.jpg`
      );

      const html = imageUrls
        .map((url) => `<img src="${url}" width="800" height="800" />`)
        .join("\n");

      const doc = createMockDocument(html);
      const results = imageExtractor.extract(doc);

      expect(results).toHaveLength(5);
    });
  });
});
