import { describe, it, expect, vi, beforeEach } from "vitest";

// Add type imports
import type { PgSelectBase } from "drizzle-orm/pg-core";
import type { PriceData } from "@/lib/fetchers/types";

// Mocks must be defined before any imports that use them
vi.mock("@/actions/wish", () => ({
  getUrlPrice: vi.fn(),
}));

// Create spy functions outside the mock
const setSpy = vi.fn();
const whereSpy = vi.fn(() => Promise.resolve());

// Add a mock state to track failures
let mockFailureCount = 0;

// Create a mock DB query result
const mockDbQuery = {
  prepare: vi.fn(),
  execute: vi.fn(),
  _: {},
  config: {},
} as unknown as PgSelectBase<any, any, any, any>;

// Fix the mock DB query type
const createMockDbQuery = (results: any[]) =>
  ({
    ...mockDbQuery,
    then: (fn: (val: any) => any) => fn(results),
  } as unknown as PgSelectBase<any, any, any, any>);

// Create a properly typed mock query builder
const createMockQueryBuilder = (results: any[]) =>
  ({
    from: () => ({
      where: () => createMockDbQuery(results),
    }),
  } as any);

// Update the mock implementation
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() =>
      createMockQueryBuilder([
        {
          id: "wish1",
          destinationUrl: "https://example.com/product1",
          price: 10.99,
          currency: "USD",
          priceUpdateFailures: mockFailureCount,
        },
      ])
    ),
    update: vi.fn(() => ({
      set: setSpy.mockReturnValue({ where: whereSpy }),
    })),
  },
  wishes: { id: "id", autoUpdatePrice: "autoUpdatePrice" },
  eq: (a: any, b: any) => ({ a, b }),
}));

// Import after mocks
import { GET } from "@/app/api/cron/update-prices/route";
import { getUrlPrice } from "@/actions/wish";
import { db } from "@/lib/db";

// Add helper function to create request
const createAuthRequest = () =>
  new Request("http://localhost", {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  });

describe("Price Update Cron Job", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFailureCount = 0;
    process.env.CRON_SECRET = "test-secret";
  });

  it("rejects unauthorized requests", async () => {
    const request = new Request("http://localhost", {
      headers: { authorization: "Bearer wrong-secret" },
    });

    const response = await GET(request);
    expect(response.status).toBe(401);
  });

  it("successfully updates prices for valid wishes", async () => {
    vi.mocked(getUrlPrice).mockResolvedValueOnce({
      success: true,
      data: { price: 11.99, currency: "USD" } satisfies PriceData,
    });

    const request = new Request("http://localhost", {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.updated).toBe(1);
    expect(setSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        priceUpdateFailures: 0,
      })
    );
  });

  it("handles price fetch failures correctly", async () => {
    vi.mocked(getUrlPrice).mockResolvedValueOnce({
      success: false,
      error: "Failed to fetch price",
    });

    const request = new Request("http://localhost", {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.updated).toBe(0);
    expect(setSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        priceUpdateFailures: expect.any(Number),
      })
    );
  });

  it("disables auto-update after max failures", async () => {
    vi.mocked(getUrlPrice).mockResolvedValue({
      success: false,
      error: "Failed to fetch price",
    });

    const request = new Request("http://localhost", {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    });

    for (let i = 0; i < 3; i++) {
      mockFailureCount = i;
      await GET(request);
    }

    const lastCall = setSpy.mock.calls[setSpy.mock.calls.length - 1];
    expect(lastCall[0]).toEqual(
      expect.objectContaining({
        autoUpdatePrice: false,
        priceUpdateFailures: 3,
      })
    );
  });

  it("resets failure count on successful update", async () => {
    vi.mocked(getUrlPrice).mockResolvedValueOnce({
      success: true,
      data: { price: 21.99, currency: "EUR" },
    });

    const request = new Request("http://localhost", {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    });

    await GET(request);

    expect(setSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        priceUpdateFailures: 0,
      })
    );
  });

  it("updates multiple wishes in parallel", async () => {
    vi.mocked(getUrlPrice)
      .mockResolvedValueOnce({
        success: true,
        data: { price: 11.99, currency: "USD" } satisfies PriceData,
      })
      .mockResolvedValueOnce({
        success: true,
        data: { price: 22.99, currency: "EUR" } satisfies PriceData,
      });

    vi.mocked(db.select).mockImplementation(() =>
      createMockQueryBuilder([
        { id: "wish1", destinationUrl: "url1", priceUpdateFailures: 0 },
        { id: "wish2", destinationUrl: "url2", priceUpdateFailures: 0 },
      ])
    );

    const response = await GET(createAuthRequest());
    const data = await response.json();

    expect(data.updated).toBe(2);
  });

  it("handles network timeouts gracefully", async () => {
    vi.mocked(getUrlPrice).mockRejectedValueOnce(new Error("Network timeout"));

    const response = await GET(createAuthRequest());
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(setSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        priceUpdateFailures: expect.any(Number),
      })
    );
  });

  it("preserves existing currency when price update succeeds without currency", async () => {
    vi.mocked(db.select).mockImplementation(() =>
      createMockQueryBuilder([
        {
          id: "wish1",
          destinationUrl: "url1",
          price: 10.99,
          currency: "USD",
          priceUpdateFailures: 0,
        },
      ])
    );

    vi.mocked(getUrlPrice).mockResolvedValueOnce({
      success: true,
      data: { price: 11.99, currency: "USD" } satisfies PriceData,
    });

    await GET(createAuthRequest());

    // Check that the first call to setSpy has both price and original currency
    const firstCall = setSpy.mock.calls[0][0];
    expect(firstCall).toEqual(
      expect.objectContaining({
        price: 11.99,
        currency: "USD", // Should keep existing currency
        priceUpdateFailures: 0,
      })
    );
  });

  it("handles invalid price data gracefully", async () => {
    vi.mocked(getUrlPrice).mockResolvedValueOnce({
      success: true,
      data: { price: -1, currency: "USD" } satisfies PriceData,
    });

    const response = await GET(createAuthRequest());
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.updated).toBe(0);
    expect(setSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        priceUpdateFailures: expect.any(Number),
      })
    );
  });

  it("handles missing destination URLs", async () => {
    vi.mocked(db.select).mockImplementation(() =>
      createMockQueryBuilder([
        {
          id: "wish1",
          price: 10.99,
          currency: "USD",
          priceUpdateFailures: 0,
          // destinationUrl intentionally omitted
        },
      ])
    );

    const response = await GET(createAuthRequest());
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.updated).toBe(0);
    expect(setSpy).not.toHaveBeenCalled();
  });

  it("maintains update frequency limits", async () => {
    const recentDate = new Date();
    vi.mocked(db.select).mockImplementation(() =>
      createMockQueryBuilder([
        {
          id: "wish1",
          destinationUrl: "url1",
          lastPriceUpdateAttempt: recentDate,
          price: 10.99,
          currency: "USD",
          priceUpdateFailures: 0,
        },
      ])
    );

    const response = await GET(createAuthRequest());
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.updated).toBe(0);
    expect(getUrlPrice).not.toHaveBeenCalled();
  });

  it("returns correct counts in response", async () => {
    vi.mocked(db.select).mockImplementation(() =>
      createMockQueryBuilder([
        { id: "wish1", destinationUrl: "url1", priceUpdateFailures: 0 },
        { id: "wish2", destinationUrl: "url2", priceUpdateFailures: 2 },
      ])
    );

    vi.mocked(getUrlPrice)
      .mockResolvedValueOnce({
        success: true,
        data: { price: 11.99, currency: "USD" } satisfies PriceData,
      })
      .mockResolvedValueOnce({
        success: false,
        error: "Failed to fetch price",
      });

    const response = await GET(createAuthRequest());
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.total).toBe(2);
    expect(data.updated).toBe(1);
    expect(data.disabled).toBe(1);
    expect(Array.isArray(data.results)).toBe(true);
  });

  it("logs update results correctly", async () => {
    const consoleSpy = vi.spyOn(console, "log");
    const errorSpy = vi.spyOn(console, "error");

    vi.mocked(db.select).mockImplementation(() =>
      createMockQueryBuilder([
        {
          id: "wish1",
          destinationUrl: "url1",
          price: 10.99,
          currency: "USD",
          priceUpdateFailures: 0,
        },
        {
          id: "wish2",
          destinationUrl: "url2",
          price: 20.99,
          currency: "EUR",
          priceUpdateFailures: 0,
        },
      ])
    );

    vi.mocked(getUrlPrice)
      .mockResolvedValueOnce({
        success: true,
        data: { price: 11.99, currency: "USD" } satisfies PriceData,
      })
      .mockResolvedValueOnce({
        success: false,
        error: "Failed to fetch price",
      });

    await GET(createAuthRequest());

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Starting price update for 2 wishes")
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Updated price for wish wish1: 10.99 -> 11.99 USD"
      )
    );
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to update price for wish wish2")
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Price update complete. 1/2 wishes updated successfully"
      )
    );

    consoleSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
