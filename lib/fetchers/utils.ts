import { parse } from "node-html-parser";
import { MinimalDocument } from "./types";

const TIMEOUT = 12000;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Cache interface
interface CacheEntry {
  document: MinimalDocument;
  timestamp: number;
}

// In-memory cache
const documentCache: Map<string, CacheEntry> = new Map();

async function fetchDocument(url: string): Promise<Response> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
}

export async function getDocument(url: string): Promise<MinimalDocument> {
  try {
    // Check cache first
    const cached = documentCache.get(url);
    const now = Date.now();

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      return cached.document;
    }

    const response = await fetchDocument(url);
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

export function clearDocumentCache(): void {
  documentCache.clear();
}

export function validateUrlInput(url: string): string | null {
  if (!url.startsWith("http")) {
    return "Invalid URL format";
  }
  return null;
}
