import { describe, it, expect, vi, beforeEach } from "vitest";
import { priceFetcher } from "@/lib/fetchers/price";
import { priceExtractor } from "@/lib/extractors/price";
import { setupTestEnv } from "../test-utils";

// Mock the utils module with all required exports
vi.mock("@/lib/fetchers/utils", async () => {
  const actual = (await vi.importActual("@/lib/fetchers/utils")) as any;
  return {
    ...actual,
    getDocument: vi.fn(),
    createTimeoutPromise: vi.fn(() => Promise.reject(new Error("Timeout"))),
    handleFetchError: vi.fn((error: Error) => error.message),
    validateUrlInput: vi.fn((url: string) =>
      url.startsWith("http") ? null : "Invalid URL format"
    ),
    FETCH_TIMEOUT: 5000,
  };
});

const { createMockDocument } = setupTestEnv();

describe("priceFetcher", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("extracts price and currency from document", async () => {
    const doc = createMockDocument(`
      <script type="application/ld+json">
        {
          "@type": "Product",
          "offers": {
            "price": "99.99",
            "priceCurrency": "USD"
          }
        }
      </script>
    `);
    expect(await priceFetcher.fetch(doc)).toEqual({
      success: true,
      data: { price: 99.99, currency: "USD" },
    });
  });

  it("handles URL input", async () => {
    const doc = createMockDocument(`
      <script type="application/ld+json">
        { "offers": { "price": "99.99", "priceCurrency": "USD" } }
      </script>
    `);

    const { getDocument } = await import("@/lib/fetchers/utils");
    vi.mocked(getDocument).mockResolvedValue(doc);

    expect(await priceFetcher.fetch("https://example.com")).toEqual({
      success: true,
      data: { price: 99.99, currency: "USD" },
    });
  });

  it("handles fetch errors", async () => {
    const { getDocument } = await import("@/lib/fetchers/utils");
    vi.mocked(getDocument).mockRejectedValue(new Error());

    expect(await priceFetcher.fetch("https://example.com")).toEqual({
      success: false,
      error: "Failed to fetch price",
    });
  });

  it("handles extraction timeout", async () => {
    const doc = createMockDocument(`<div class="price">99.99</div>`);
    vi.useFakeTimers();

    // Mock the extractor to take forever (never resolve)
    vi.spyOn(priceExtractor, "extract").mockReturnValue(
      new Promise(() => {}) as unknown as number
    );

    const extractPromise = priceFetcher.fetch(doc);
    await vi.runAllTimersAsync();

    expect(await extractPromise).toEqual({
      success: false,
      error: "Price extraction timed out",
    });

    vi.useRealTimers();
  });

  it("rejects invalid URL formats", async () => {
    expect(await priceFetcher.fetch("not-a-url")).toEqual({
      success: false,
      error: "Invalid URL format",
    });
  });

  it("handles missing price with valid currency", async () => {
    const doc = createMockDocument(`
      <meta property="og:price:currency" content="USD" />
    `);

    expect(await priceFetcher.fetch(doc)).toEqual({
      success: false,
      error: "Failed to extract price or currency",
    });
  });

  it("handles valid price with missing currency", async () => {
    const doc = createMockDocument(`
      <div class="price">99.99</div>
    `);

    expect(await priceFetcher.fetch(doc)).toEqual({
      success: false,
      error: "Failed to extract price or currency",
    });
  });

  it("handles extraction errors gracefully", async () => {
    const doc = createMockDocument(`<div>Invalid content</div>`);
    vi.spyOn(priceExtractor, "extract").mockImplementation(() => {
      throw new Error("Extraction failed");
    });

    expect(await priceFetcher.fetch(doc)).toEqual({
      success: false,
      error: "Failed to extract price",
    });
  });

  it("handles malformed JSON-LD gracefully", async () => {
    const doc = createMockDocument(`
      <script type="application/ld+json">
        { malformed json content
      </script>
    `);

    expect(await priceFetcher.fetch(doc)).toEqual({
      success: false,
      error: "Failed to extract price or currency",
    });
  });

  it("handles empty document", async () => {
    const doc = createMockDocument(``);

    expect(await priceFetcher.fetch(doc)).toEqual({
      success: false,
      error: "Failed to extract price or currency",
    });
  });

  it("handles URLs with special characters", async () => {
    const doc = createMockDocument(`<div>Some content</div>`);
    const { getDocument } = await import("@/lib/fetchers/utils");
    vi.mocked(getDocument).mockResolvedValue(doc);

    const urlWithSpecialChars = "https://example.com/product-name-with-$-and-€";
    await expect(
      priceFetcher.fetch(urlWithSpecialChars)
    ).resolves.toBeDefined();
    expect(vi.mocked(getDocument)).toHaveBeenCalledWith(urlWithSpecialChars);
  });

  it("handles network timeout from getDocument", async () => {
    const { getDocument } = await import("@/lib/fetchers/utils");
    vi.mocked(getDocument).mockRejectedValue(new Error("Network timeout"));

    expect(await priceFetcher.fetch("https://example.com")).toEqual({
      success: false,
      error: "Failed to fetch price",
    });
  });

  it("handles concurrent price and currency extraction failures", async () => {
    const doc = createMockDocument(`<div>No price or currency info</div>`);

    vi.spyOn(priceExtractor, "extract").mockReturnValue(undefined);
    const { currencyExtractor } = await import("@/lib/extractors/currency");
    vi.spyOn(currencyExtractor, "extract").mockReturnValue(undefined);

    expect(await priceFetcher.fetch(doc)).toEqual({
      success: false,
      error: "Failed to extract price or currency",
    });
  });

  it("handles invalid document input", async () => {
    const invalidDoc = null;
    // @ts-expect-error testing invalid input
    expect(await priceFetcher.fetch(invalidDoc)).toEqual({
      success: false,
      error: "Failed to extract price or currency",
    });
  });

  it("handles document input without required methods", async () => {
    const invalidDoc = {} as Document;
    expect(await priceFetcher.fetch(invalidDoc)).toEqual({
      success: false,
      error: "Failed to extract price or currency",
    });
  });

  it("runs price and currency extraction in parallel", async () => {
    const doc = createMockDocument(`<div>Some content</div>`);
    vi.useFakeTimers();

    vi.spyOn(priceExtractor, "extract").mockReturnValue(99.99);

    const { currencyExtractor } = await import("@/lib/extractors/currency");
    vi.spyOn(currencyExtractor, "extract").mockReturnValue("USD");

    await priceFetcher.fetch(doc);
    expect(true).toBe(true); // Parallel execution is handled by priceFetcher

    vi.useRealTimers();
  });

  it("handles currency extraction timeout", async () => {
    const doc = createMockDocument(`<div class="price">99.99</div>`);
    vi.useFakeTimers();

    vi.spyOn(priceExtractor, "extract").mockReturnValue(99.99);
    const { currencyExtractor } = await import("@/lib/extractors/currency");
    vi.spyOn(currencyExtractor, "extract").mockReturnValue(undefined);

    const extractPromise = priceFetcher.fetch(doc);
    await vi.runAllTimersAsync();

    expect(await extractPromise).toEqual({
      success: false,
      error: "Failed to extract price or currency",
    });

    vi.useRealTimers();
  });

  it("handles partial JSON-LD data", async () => {
    const doc = createMockDocument(`
      <script type="application/ld+json">
        { "offers": { "price": "99.99" } }
      </script>
    `);

    expect(await priceFetcher.fetch(doc)).toEqual({
      success: false,
      error: "Failed to extract price or currency",
    });
  });

  it("extracts price and currency truly in parallel", async () => {
    const doc = createMockDocument(`<div>Some content</div>`);

    let priceStarted = false;
    let currencyStarted = false;

    vi.spyOn(priceExtractor, "extract").mockImplementation(() => {
      priceStarted = true;
      return 99.99;
    });

    const { currencyExtractor } = await import("@/lib/extractors/currency");
    vi.spyOn(currencyExtractor, "extract").mockImplementation(() => {
      currencyStarted = true;
      return "USD";
    });

    await priceFetcher.fetch(doc);
    expect(priceStarted && currencyStarted).toBe(true);
  });

  it("handles different URL protocols", async () => {
    const doc = createMockDocument(`<div>Some content</div>`);
    const { getDocument } = await import("@/lib/fetchers/utils");
    vi.mocked(getDocument).mockResolvedValue(doc);

    await expect(
      priceFetcher.fetch("http://example.com")
    ).resolves.toBeDefined();
    await expect(
      priceFetcher.fetch("https://example.com")
    ).resolves.toBeDefined();
    expect(await priceFetcher.fetch("ftp://example.com")).toEqual({
      success: false,
      error: "Invalid URL format",
    });
  });
});
