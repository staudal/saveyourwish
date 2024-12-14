import { describe, it, expect, vi, beforeEach } from "vitest";
import { imageFetcher } from "@/lib/fetchers/image";
import { imageExtractor } from "@/lib/extractors/image";
import { setupTestEnv } from "../test-utils";

// Mock the utils module
vi.mock("@/lib/fetchers/utils", async () => {
  const actual = (await vi.importActual("@/lib/fetchers/utils")) as any;
  return {
    ...actual,
    getDocument: vi.fn(),
  };
});

const { createMockDocument } = setupTestEnv();

describe("imageFetcher", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("extracts images from document", async () => {
    const doc = createMockDocument(`
      <meta property="og:image" content="https://example.com/og-image.jpg" />
      <img src="https://example.com/product.jpg" />
    `);

    expect(await imageFetcher.fetch(doc)).toEqual({
      success: true,
      data: {
        images: [
          "https://example.com/og-image.jpg",
          "https://example.com/product.jpg",
        ],
        imageUrl: "https://example.com/og-image.jpg",
      },
    });
  });

  it("handles URL input", async () => {
    const doc = createMockDocument(`
      <img src="https://example.com/product.jpg" />
    `);

    const { getDocument } = await import("@/lib/fetchers/utils");
    vi.mocked(getDocument).mockResolvedValue(doc);

    expect(await imageFetcher.fetch("https://example.com")).toEqual({
      success: true,
      data: {
        images: ["https://example.com/product.jpg"],
        imageUrl: "https://example.com/product.jpg",
      },
    });
  });

  it("handles no images found", async () => {
    const doc = createMockDocument(`<div>No images here</div>`);

    expect(await imageFetcher.fetch(doc)).toEqual({
      success: false,
      error: "No images found",
    });
  });

  it("handles fetch errors", async () => {
    const { getDocument } = await import("@/lib/fetchers/utils");
    vi.mocked(getDocument).mockRejectedValue(new Error("Network error"));

    expect(await imageFetcher.fetch("https://example.com")).toEqual({
      success: false,
      error: "Network error",
    });
  });

  it("handles malformed URLs", async () => {
    const doc = createMockDocument(`
      <img src="not-a-valid-url" />
    `);

    expect(await imageFetcher.fetch(doc)).toEqual({
      success: false,
      error: "No images found",
    });
  });

  it("handles empty document", async () => {
    const doc = createMockDocument(``);

    expect(await imageFetcher.fetch(doc)).toEqual({
      success: false,
      error: "No images found",
    });
  });

  it("cleans image URLs", async () => {
    const doc = createMockDocument(`
      <img src="https://example.com/image.jpg?width=800" />
    `);

    expect(await imageFetcher.fetch(doc)).toEqual({
      success: true,
      data: {
        images: ["https://example.com/image.jpg"],
        imageUrl: "https://example.com/image.jpg",
      },
    });
  });

  it("handles invalid document input", async () => {
    const invalidDoc = null;
    // @ts-expect-error testing invalid input
    expect(await imageFetcher.fetch(invalidDoc)).toEqual({
      success: false,
      error: "Unknown error",
    });
  });

  it("handles document input without required methods", async () => {
    const invalidDoc = {} as Document;
    expect(await imageFetcher.fetch(invalidDoc)).toEqual({
      success: false,
      error: "Unknown error",
    });
  });

  it("handles extraction errors gracefully", async () => {
    const doc = createMockDocument(`<div>Invalid content</div>`);
    vi.spyOn(imageExtractor, "extract").mockImplementation(() => {
      throw new Error("Extraction failed");
    });

    expect(await imageFetcher.fetch(doc)).toEqual({
      success: false,
      error: "Extraction failed",
    });
  });
});
