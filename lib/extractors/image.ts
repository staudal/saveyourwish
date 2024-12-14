import { ImageExtractor, Selector } from "./types";
import { MinimalDocument } from "../fetchers/types";
import { normalizeImageUrl, scoreImage } from "./utils";
import { IMAGE_SELECTORS, IMAGE_URL_NORMALIZATION } from "@/constants";

const MAX_IMAGES = 8; // Reasonable limit for product images

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
      } catch {
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

        if (!images.some((img) => img.url === cleanUrl)) {
          const score = scoreImage(element, cleanUrl);
          images.push({ url: cleanUrl, score });
        }
      } catch {
        // Silently ignore errors when processing URLs
      }
    };

    // Extract from meta tags and common selectors
    const imageSelectors: Selector[] = [
      ...IMAGE_SELECTORS.META,
      ...IMAGE_SELECTORS.HTML,
      // Add a catch-all for plain img tags
      { selector: "img", attr: "src" },
    ];

    // Extract from selectors until we hit the limit
    for (const { selector, attr } of imageSelectors) {
      if (images.length >= MAX_IMAGES) break;

      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (images.length >= MAX_IMAGES) break;

        let imageUrl;
        if (attr === "src") {
          imageUrl = element.getAttribute("src");
          if (!imageUrl && element.querySelector("img")) {
            imageUrl = element.querySelector("img")?.getAttribute("src");
          }
        } else {
          imageUrl = element.getAttribute(attr);
        }
        if (imageUrl) addUniqueImage(element, imageUrl);
      }
    }

    // Extract from JSON-LD with limit
    if (images.length < MAX_IMAGES) {
      const scriptElements = document.querySelectorAll(
        'script[type="application/ld+json"]'
      );

      for (const script of scriptElements) {
        if (images.length >= MAX_IMAGES) break;

        try {
          const jsonData = JSON.parse(script.textContent || "");
          for (const path of IMAGE_SELECTORS.JSONLD_PATHS) {
            if (images.length >= MAX_IMAGES) break;

            let value = jsonData;
            for (const key of path) {
              value = value?.[key];
              if (!value) break;
            }
            if (value) {
              const imageUrls = Array.isArray(value) ? value : [value];
              for (const url of imageUrls) {
                if (images.length >= MAX_IMAGES) break;
                if (typeof url === "string") addUniqueImage(script, url);
              }
            }
          }
        } catch {
          // Silently continue on JSON parse errors
          continue;
        }
      }
    }

    // Sort images by score and return URLs only, filtering out negative scores
    return images
      .filter((img) => img.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_IMAGES)
      .map((img) => img.url);
  },

  clean: (imageUrl: string, baseUrl?: string): string => {
    try {
      let normalizedUrl = imageUrl;
      if (imageUrl.startsWith("//")) {
        normalizedUrl = `${IMAGE_URL_NORMALIZATION.PROTOCOL_PREFIX}${imageUrl}`;
      }

      if (baseUrl) {
        return new URL(normalizedUrl, baseUrl).href;
      }

      return new URL(normalizedUrl).href;
    } catch {
      // Silently return original URL if invalid
      return imageUrl;
    }
  },
};
