import { describe, it, expect, vi, beforeEach } from "vitest";
import { titleFetcher } from "@/lib/fetchers/title";
import { titleExtractor } from "@/lib/extractors";
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

describe("titleFetcher", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("extracts title from document", async () => {
    const doc = createMockDocument(`
      <title>Test Product</title>
      <meta property="og:title" content="Test Product - Store" />
    `);

    vi.spyOn(titleExtractor, "extract").mockReturnValue("Test Product");
    vi.spyOn(titleExtractor, "clean").mockReturnValue("Test Product");

    expect(await titleFetcher.fetch(doc)).toEqual({
      success: true,
      data: { title: "Test Product" },
    });
  });

  it("handles URL input", async () => {
    const doc = createMockDocument(`
      <title>Test Product</title>
    `);

    const { getDocument } = await import("@/lib/fetchers/utils");
    vi.mocked(getDocument).mockResolvedValue(doc);
    vi.spyOn(titleExtractor, "extract").mockReturnValue("Test Product");
    vi.spyOn(titleExtractor, "clean").mockReturnValue("Test Product");

    expect(await titleFetcher.fetch("https://example.com")).toEqual({
      success: true,
      data: { title: "Test Product" },
    });
  });

  it("handles fetch errors", async () => {
    const { getDocument } = await import("@/lib/fetchers/utils");
    vi.mocked(getDocument).mockRejectedValue(new Error("Network error"));

    expect(await titleFetcher.fetch("https://example.com")).toEqual({
      success: false,
      error: "Network error",
    });
  });

  it("handles missing title", async () => {
    const doc = createMockDocument(`<div>No title here</div>`);
    vi.spyOn(titleExtractor, "extract").mockReturnValue(undefined);

    expect(await titleFetcher.fetch(doc)).toEqual({
      success: false,
      error: "No title found",
    });
  });

  it("handles empty document", async () => {
    const doc = createMockDocument(``);
    vi.spyOn(titleExtractor, "extract").mockReturnValue(undefined);

    expect(await titleFetcher.fetch(doc)).toEqual({
      success: false,
      error: "No title found",
    });
  });

  it("cleans extracted title", async () => {
    const doc = createMockDocument(`
      <title>Test Product | Store Name</title>
    `);

    vi.spyOn(titleExtractor, "extract").mockReturnValue(
      "Test Product | Store Name"
    );
    vi.spyOn(titleExtractor, "clean").mockReturnValue("Test Product");

    expect(await titleFetcher.fetch(doc)).toEqual({
      success: true,
      data: { title: "Test Product" },
    });
  });

  it("handles invalid document input", async () => {
    const invalidDoc = null;
    // @ts-expect-error testing invalid input
    expect(await titleFetcher.fetch(invalidDoc)).toEqual({
      success: false,
      error: "Invalid document input",
    });
  });

  it("handles extraction errors gracefully", async () => {
    const doc = createMockDocument(`<div>Invalid content</div>`);
    vi.spyOn(titleExtractor, "extract").mockImplementation(() => {
      throw new Error("Extraction failed");
    });

    expect(await titleFetcher.fetch(doc)).toEqual({
      success: false,
      error: "Extraction failed",
    });
  });

  it("handles malformed HTML gracefully", async () => {
    const doc = createMockDocument(`
      <title>Unclosed title
      <div>Some content</div>
    `);
    vi.spyOn(titleExtractor, "extract").mockReturnValue(undefined);

    expect(await titleFetcher.fetch(doc)).toEqual({
      success: false,
      error: "No title found",
    });
  });

  it("handles network timeout", async () => {
    const { getDocument } = await import("@/lib/fetchers/utils");
    vi.mocked(getDocument).mockRejectedValue(new Error("Network timeout"));

    expect(await titleFetcher.fetch("https://example.com")).toEqual({
      success: false,
      error: "Network timeout",
    });
  });
});
