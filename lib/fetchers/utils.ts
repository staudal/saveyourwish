import { parse } from "node-html-parser";
import { MinimalDocument } from "./types";

const TIMEOUT = 12000;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Browser profile that worked before
const BROWSER_PROFILE = {
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  acceptLanguage: "da",
  acceptEncoding: "gzip, deflate, br, zstd",
};

// Cache interface
interface CacheEntry {
  document: MinimalDocument;
  timestamp: number;
}

// In-memory cache
const documentCache: Map<string, CacheEntry> = new Map();

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      // Exponential backoff
      if (i > 0) {
        const delay = Math.min(1000 * Math.pow(2, i - 1), 4000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      console.log(`[Debug] Attempt ${i + 1}/${retries} for ${url}`);

      const response = await fetch(url, {
        headers: {
          "User-Agent": BROWSER_PROFILE.userAgent,
          Accept: BROWSER_PROFILE.accept,
          "Accept-Language": BROWSER_PROFILE.acceptLanguage,
          "Accept-Encoding": BROWSER_PROFILE.acceptEncoding,
          "Cache-Control": "max-age=0",
          "Sec-Ch-Ua":
            '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
          "Sec-Ch-Ua-Mobile": "?0",
          "Sec-Ch-Ua-Platform": '"macOS"',
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
        },
        credentials: "include",
        redirect: "follow",
        signal: AbortSignal.timeout(TIMEOUT),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();

      // Basic validation that we got HTML
      if (!text.includes("<!DOCTYPE html>")) {
        console.error("[Debug] Invalid HTML response:", text.substring(0, 200));
        throw new Error("Invalid HTML response");
      }

      return new Response(text, response);
    } catch (error) {
      console.error(`[Debug] Attempt ${i + 1} failed:`, error);
      lastError = error as Error;

      if (i === retries - 1) {
        console.error(`[Debug] All ${retries} attempts failed`);
        break;
      }
    }
  }

  throw lastError || new Error("Failed to fetch");
}

export async function getDocument(url: string): Promise<MinimalDocument> {
  try {
    // Check cache first
    const cached = documentCache.get(url);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      console.log(`[Debug] Cache hit for ${url}`);
      return cached.document;
    }

    console.log(`[Debug] Cache miss, fetching document from ${url}`);
    const response = await fetchWithRetry(url);
    const text = await response.text();
    const root = parse(text);

    const document = {
      querySelector: (sel: string) => root.querySelector(sel),
      querySelectorAll: (sel: string) => root.querySelectorAll(sel),
      getElementsByTagName: (tag: string) => root.getElementsByTagName(tag),
      documentElement: {
        lang: root.querySelector("html")?.getAttribute("lang") || "",
        outerHTML: root.toString(),
      },
      URL: url,
    };

    // Store in cache
    documentCache.set(url, {
      document,
      timestamp: now,
    });

    return document;
  } catch (error) {
    console.error(`[Debug] Failed to fetch document:`, error);
    throw new Error(
      "Unable to access this website. Please try entering the details manually."
    );
  }
}

// Optional: Add a method to clear the cache if needed
export function clearDocumentCache(): void {
  documentCache.clear();
}

export function validateUrlInput(url: string): string | null {
  if (!url.startsWith("http")) {
    return "Invalid URL format";
  }
  return null;
}
