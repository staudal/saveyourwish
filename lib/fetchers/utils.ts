import { parse } from "node-html-parser";
import { MinimalDocument } from "./types";
import { BOT_DETECTION_PATTERNS } from "@/constants";

const FETCH_TIMEOUT = 5000;
const BOT_DETECTION_TIMEOUT = 3000;

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      // Initial fetch with general timeout
      const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(FETCH_TIMEOUT),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Bot detection check with shorter timeout
      const textPromise = response.text();
      const botCheckPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Bot check timeout")),
          BOT_DETECTION_TIMEOUT
        )
      );

      const text = await Promise.race([textPromise, botCheckPromise]);

      if (isBotDetected(text, response)) {
        throw new Error("Bot detection encountered");
      }

      return new Response(text, response);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i === retries - 1) break;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw lastError || new Error("Max retries reached");
}

function isBotDetected(text: string, response: Response): boolean {
  const isBot =
    BOT_DETECTION_PATTERNS.some((pattern) =>
      text.toLowerCase().includes(pattern)
    ) ||
    !!response.headers.get("cf-chl-bypass") ||
    text.includes("captcha") ||
    text.includes("robot verification") ||
    text.includes("cloudflare") ||
    text.includes("ddos");

  return isBot;
}

export async function getDocument(url: string): Promise<MinimalDocument> {
  try {
    const response = await fetchWithRetry(url);
    const html = await response.text();
    const root = parse(html);

    return {
      querySelector: (sel: string) => root.querySelector(sel),
      querySelectorAll: (sel: string) => Array.from(root.querySelectorAll(sel)),
      getElementsByTagName: (tag: string) =>
        Array.from(root.getElementsByTagName(tag)),
      documentElement: {
        lang: root.getAttribute("lang") || "",
        outerHTML: root.toString(),
      },
      URL: url,
    };
  } catch (error) {
    console.error(`Failed to fetch document from ${url}:`, error);
    if (
      error instanceof Error &&
      (error.message === "Bot detection encountered" ||
        error.message === "Bot check timeout")
    ) {
      throw new Error(
        "This website is blocking automatic data fetching. Please enter the details manually."
      );
    }
    throw error;
  }
}

export function validateUrlInput(url: string): string | null {
  if (!url.startsWith("http")) {
    return "Invalid URL format";
  }
  return null;
}
