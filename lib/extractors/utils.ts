import { Selector } from "./types";
import { MinimalDocument } from "@/lib/fetchers/types";
import { IMAGE_SCORING } from "@/constants";
import { HTMLElement as NodeHtmlElement } from "node-html-parser";

type ElementType = Element | NodeHtmlElement;

export function extractFromJsonLd(
  document: Document | MinimalDocument,
  paths: (string | number)[][]
): string | undefined {
  try {
    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    );
    for (const script of scripts) {
      const data = JSON.parse(script.textContent || "");
      for (const path of paths) {
        let value = data;
        for (const key of path) {
          if (!value) break;
          value = Array.isArray(value) ? value[0]?.[key] : value[key];
        }
        if (value) return String(value);
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export function extractFromSelectors(
  document: Document | MinimalDocument,
  selectors: Selector[]
): string | undefined {
  for (const { selector, attr } of selectors) {
    const element = document.querySelector(selector);
    if (!element) continue;

    const value =
      attr === "textContent" ? element.textContent : element.getAttribute(attr);

    if (value?.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

export const normalizeImageUrl = (url: string): string => {
  // Handle relative URLs that start with @
  if (url.startsWith("@")) {
    return url.substring(1); // Remove the @ symbol
  }

  // Clean the URL
  return url
    .replace(/\?imwidth=\d+/, "")
    .replace(/\?w=\d+/, "")
    .replace(/&width=\d+/, "")
    .replace(/&size=\d+/, "")
    .replace(/&filter=[^&]+/, "");
};

interface ImageDimensions {
  width: number;
  height: number;
}

export function getImageDimensions(
  element: ElementType
): ImageDimensions | null {
  // Check for width/height attributes
  const width = element.getAttribute("width");
  const height = element.getAttribute("height");
  if (width && height) {
    const parsedWidth = parseInt(width, 10);
    const parsedHeight = parseInt(height, 10);
    if (!isNaN(parsedWidth) && !isNaN(parsedHeight)) {
      return {
        width: parsedWidth,
        height: parsedHeight,
      };
    }
  }

  // Check for dimension hints in srcset
  const srcset = element.getAttribute("srcset");
  if (srcset) {
    const match = srcset.match(/(\d+)w/);
    if (match) {
      const width = parseInt(match[1], 10);
      // Assume 1:1 ratio if only width is available
      return { width, height: width };
    }
  }

  // If no dimensions found, return null
  return null;
}

export function scoreImage(element: ElementType, url: string): number {
  // Skip data URIs entirely
  if (url.startsWith("data:")) {
    return -Infinity;
  }

  let score: number = IMAGE_SCORING.SCORES.GENERIC;
  const debug: string[] = [`Initial score: ${score}`];

  // Score based on source - check meta tags first
  if (element.tagName?.toLowerCase() === "meta") {
    const property = element.getAttribute("property");
    const name = element.getAttribute("name");
    if (property?.includes("og:image") || name?.includes("twitter:image")) {
      score = IMAGE_SCORING.SCORES.META;
      debug.push(`Meta tag found (${property || name}), score: ${score}`);
      score += 100;
      debug.push(`Meta tag bonus applied, score: ${score}`);
    }
  } else if (element.closest('[class*="product"], [id*="product"]')) {
    score = IMAGE_SCORING.SCORES.PRODUCT;
    debug.push(`Product class/id found, score: ${score}`);
  } else if (element.closest('[class*="gallery"]')) {
    score = IMAGE_SCORING.SCORES.GALLERY;
    debug.push(`Gallery class found, score: ${score}`);
  }

  // Handle SVGs - they might be good for logos but not main product images
  if (url.toLowerCase().endsWith(".svg")) {
    score = Math.min(score, IMAGE_SCORING.SCORES.GENERIC);
    debug.push(`SVG detected, score capped at ${score}`);
  }

  // Score based on dimensions with upper limits
  const dimensions = getImageDimensions(element);
  if (dimensions) {
    const { width, height } = dimensions;
    debug.push(`Dimensions found: ${width}x${height}`);

    // Cap dimensions at reasonable limits (e.g., 4K)
    const MAX_DIMENSION = 3840; // 4K width
    const effectiveWidth = Math.min(width, MAX_DIMENSION);
    const effectiveHeight = Math.min(height, MAX_DIMENSION);

    if (
      effectiveWidth < IMAGE_SCORING.MIN_WIDTH ||
      effectiveHeight < IMAGE_SCORING.MIN_HEIGHT
    ) {
      score += IMAGE_SCORING.SCORES.SIZE_PENALTY;
      debug.push(`Size penalty applied, new score: ${score}`);
    }
    if (
      effectiveWidth >= IMAGE_SCORING.PREFERRED_WIDTH &&
      effectiveHeight >= IMAGE_SCORING.PREFERRED_HEIGHT
    ) {
      score += IMAGE_SCORING.SCORES.SIZE_BONUS;
      debug.push(`Size bonus applied, new score: ${score}`);
    }

    // Add penalty for oversized images
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      score += IMAGE_SCORING.SCORES.SIZE_PENALTY;
      debug.push(`Oversized image penalty applied, new score: ${score}`);
    }
  }

  // Additional scoring factors
  if (
    url.toLowerCase().includes("thumbnail") ||
    url.toLowerCase().includes("icon")
  ) {
    score = -Infinity;
    debug.push(`Thumbnail/icon penalty applied, new score: ${score}`);
    return score;
  }

  // Only apply product/main bonus if not a meta tag
  if (
    score !== IMAGE_SCORING.SCORES.META &&
    (url.toLowerCase().includes("product") ||
      url.toLowerCase().includes("main"))
  ) {
    score += IMAGE_SCORING.SCORES.PRODUCT / 4;
    debug.push(`Product/main bonus applied, new score: ${score}`);
  }

  return score;
}
