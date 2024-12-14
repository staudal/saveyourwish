import { parse } from "node-html-parser";
import { MinimalDocument } from "./types";
import { BOT_DETECTION_PATTERNS } from "@/constants";

// Update cache type
const documentCache = new Map<string, MinimalDocument>();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CONCURRENT_REQUESTS = 3;

// Semaphore for limiting concurrent requests
let activeRequests = 0;
const requestQueue: (() => void)[] = [];

// Add cache size limit
const MAX_CACHE_SIZE = 100;

async function acquireRequestSlot(): Promise<void> {
  if (activeRequests < MAX_CONCURRENT_REQUESTS) {
    activeRequests++;
    return;
  }
  return new Promise<void>((resolve) => requestQueue.push(resolve));
}

function releaseRequestSlot(): void {
  activeRequests--;
  const next = requestQueue.shift();
  if (next) {
    activeRequests++;
    next();
  }
}

export async function fetchWithHeaders(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate, br",
      DNT: "1",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
  });
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetchWithHeaders(url);
      if (response.ok) {
        const text = await response.text();
        if (
          BOT_DETECTION_PATTERNS.some((pattern) =>
            text.toLowerCase().includes(pattern)
          )
        ) {
          throw new Error("Bot detection encountered");
        }
        return new Response(text, response);
      }

      if (response.status === 429 || response.status >= 500) {
        const waitTime = Math.pow(2, i) * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        continue;
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
  throw new Error("Max retries reached");
}

export async function getDocument(url: string): Promise<MinimalDocument> {
  try {
    const cached = documentCache.get(url);
    if (cached) return cached;

    await acquireRequestSlot();

    try {
      const response = await fetchWithRetry(url);
      const html = await response.text();
      const root = parse(html);

      const doc = {
        querySelector: (sel: string) => root.querySelector(sel),
        querySelectorAll: (sel: string) => root.querySelectorAll(sel),
        getElementsByTagName: (tag: string) => root.getElementsByTagName(tag),
        documentElement: {
          lang: root.querySelector("html")?.getAttribute("lang") || "",
          outerHTML: root.toString(),
        },
        URL: url,
      };

      // Implement LRU-like cache cleanup
      if (documentCache.size >= MAX_CACHE_SIZE) {
        const firstKey = documentCache.keys().next().value;
        documentCache.delete(firstKey);
      }

      documentCache.set(url, doc);
      setTimeout(() => documentCache.delete(url), CACHE_DURATION);

      return doc;
    } finally {
      releaseRequestSlot();
    }
  } catch (error) {
    console.error(`Failed to fetch document from ${url}:`, error);
    throw error;
  }
}

export const FETCH_TIMEOUT = 5000;

export type FetcherConfig = {
  timeout?: number;
};

export function createTimeoutPromise(timeout: number = FETCH_TIMEOUT) {
  return new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), timeout)
  );
}

export function handleFetchError(error: unknown): string {
  return error instanceof Error && error.message === "Timeout"
    ? "Extraction timed out"
    : error instanceof Error
    ? error.message
    : "Unknown error";
}

export function validateUrlInput(url: string): string | null {
  if (!url.startsWith("http")) {
    return "Invalid URL format";
  }
  return null;
}
