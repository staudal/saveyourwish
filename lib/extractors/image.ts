import { ImageExtractor, Selector } from "./types";
import { MinimalDocument } from "../fetchers/types";
import { normalizeImageUrl, scoreImage } from "./utils";
import { HTMLElement } from "node-html-parser";
import {
  IMAGE_SELECTORS,
  IMAGE_URL_NORMALIZATION,
  IMAGE_LIMITS,
} from "@/constants";

export const imageExtractor: ImageExtractor = {
  extract: (document: Document | MinimalDocument): string[] => {
    const images: { url: string; score: number }[] = [];

    const normalizeUrl = (url: string): string => {
      try {
        let normalizedUrl = url;
        if (url.startsWith("//")) {
          normalizedUrl = `${IMAGE_URL_NORMALIZATION.PROTOCOL_PREFIX}${url}`;
        }
        if (
          normalizedUrl.startsWith("http:") &&
          IMAGE_URL_NORMALIZATION.FORCE_HTTPS
        ) {
          normalizedUrl = normalizedUrl.replace(
            "http:",
            IMAGE_URL_NORMALIZATION.PROTOCOL_PREFIX
          );
        }
        return normalizedUrl;
      } catch (e) {
        console.error("Error normalizing URL:", e);
        return url;
      }
    };

    const addUniqueImage = (
      element: Element | HTMLElement,
      url: string | null | undefined
    ) => {
      if (!url?.trim()) return;

      try {
        const normalizedUrl = normalizeUrl(url);
        const cleanUrl = normalizeImageUrl(normalizedUrl);

        // Allow URLs that start with http(s) or are relative paths
        if (
          cleanUrl &&
          (cleanUrl.startsWith("http") || cleanUrl.startsWith("/"))
        ) {
          if (!images.some((img) => img.url === cleanUrl)) {
            const score = scoreImage(element, cleanUrl);
            images.push({ url: cleanUrl, score });
          }
        }
      } catch {
        // Silently ignore invalid URLs
      }
    };

    // Extract from meta tags and common selectors
    const imageSelectors: Selector[] = [
      ...IMAGE_SELECTORS.META,
      ...IMAGE_SELECTORS.HTML,
      // Add a catch-all for plain img tags
      { selector: "img", attr: "src" },
    ];

    // Extract from selectors
    for (const { selector, attr } of imageSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        let imageUrl;
        if (attr === "src") {
          // For img elements, get src directly
          imageUrl = element.getAttribute("src");
          if (!imageUrl && element.querySelector("img")) {
            // If this is a container with an img inside
            imageUrl = element.querySelector("img")?.getAttribute("src");
          }
        } else {
          imageUrl = element.getAttribute(attr);
        }
        if (imageUrl) addUniqueImage(element, imageUrl);
      });
    }

    // Extract from JSON-LD
    const scriptElements = document.querySelectorAll(
      'script[type="application/ld+json"]'
    );

    for (const script of scriptElements) {
      try {
        const jsonData = JSON.parse(script.textContent || "");
        for (const path of IMAGE_SELECTORS.JSONLD_PATHS) {
          let value = jsonData;
          for (const key of path) {
            value = value?.[key];
            if (!value) break;
          }
          if (value) {
            const imageUrls = Array.isArray(value) ? value : [value];
            imageUrls.forEach((url) => {
              if (typeof url === "string") addUniqueImage(script, url);
            });
          }
        }
      } catch {
        // Silently continue on JSON parse errors
        continue;
      }
    }

    // Sort images by score and return URLs only, filtering out negative scores
    return images
      .filter((img) => img.score >= 0) // Filter out negative scores (thumbnails)
      .sort((a, b) => b.score - a.score)
      .slice(0, IMAGE_LIMITS.MAX_IMAGES) // Limit to max number of images
      .map((img) => img.url);
  },

  clean: (imageUrl: string, baseUrl?: string): string => {
    try {
      // Handle relative URLs that start with @
      if (imageUrl.startsWith("@")) {
        imageUrl = imageUrl.substring(1);
      }

      // Handle URLs that start with just "images/"
      if (
        imageUrl.startsWith("images/") ||
        imageUrl.match(/^https?:\/\/images\//)
      ) {
        // Remove any protocol prefix if it exists
        const path = imageUrl.replace(/^https?:\/\//, "");
        return `https://www.proshop.dk/${path}`;
      }

      let normalizedUrl = imageUrl;
      if (imageUrl.startsWith("//")) {
        normalizedUrl = `${IMAGE_URL_NORMALIZATION.PROTOCOL_PREFIX}${imageUrl}`;
      }

      if (baseUrl) {
        return new URL(normalizedUrl, baseUrl).href;
      }

      return new URL(normalizedUrl).href;
    } catch {
      // Return original URL if invalid
      return imageUrl;
    }
  },
};
