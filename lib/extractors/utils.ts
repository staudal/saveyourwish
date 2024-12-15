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
  if (url.startsWith("data:")) {
    return -Infinity;
  }

  let score: number = IMAGE_SCORING.SCORES.GENERIC;
  const debug: string[] = [`Initial score: ${score}`];

  const tagName = element.tagName?.toLowerCase();
  const lowerUrl = url.toLowerCase();

  // Meta sources: top priority
  if (tagName === "meta") {
    const property = element.getAttribute("property");
    const name = element.getAttribute("name");
    if (
      (property && property.includes("og:image")) ||
      (name && name.includes("twitter:image"))
    ) {
      score = IMAGE_SCORING.SCORES.META + 100;
      debug.push(`Meta tag image found, score: ${score}`);
    }
  } else if (element.closest('[class*="product"], [id*="product"]')) {
    // Product context
    score = IMAGE_SCORING.SCORES.PRODUCT;
    debug.push(`Product class/id found, base product score: ${score}`);

    // Boost if in a main product-like container
    if (
      element.closest(
        '[class*="main-image"], .product-image-main, .main-product-image, .product-detail-hero'
      )
    ) {
      score += 20;
      debug.push(
        `Main product image container found, extra boost, score: ${score}`
      );
    }
  } else if (element.closest('[class*="gallery"]')) {
    // Treat gallery images as product-level with a strong bonus
    score = Math.max(score, IMAGE_SCORING.SCORES.PRODUCT);
    score += 50;
    debug.push(
      `Image in gallery container, treated as product with bonus, score: ${score}`
    );
  }

  // SVG files are usually logos or icons
  if (lowerUrl.endsWith(".svg")) {
    score = Math.min(score, IMAGE_SCORING.SCORES.GENERIC);
    debug.push(`SVG image detected, score capped at generic: ${score}`);
  }

  // Dimension-based scoring
  const dimensions = getImageDimensions(element);
  if (dimensions) {
    const { width, height } = dimensions;
    debug.push(`Dimensions: ${width}x${height}`);

    // Penalize small images
    if (width < IMAGE_SCORING.MIN_WIDTH || height < IMAGE_SCORING.MIN_HEIGHT) {
      score += IMAGE_SCORING.SCORES.SIZE_PENALTY;
      debug.push(`Small image penalty applied, score: ${score}`);
    }

    // Reward large images
    if (
      width >= IMAGE_SCORING.PREFERRED_WIDTH &&
      height >= IMAGE_SCORING.PREFERRED_HEIGHT
    ) {
      score += IMAGE_SCORING.SCORES.SIZE_BONUS;
      debug.push(`Large image bonus applied, score: ${score}`);
    }
  } else {
    debug.push(
      "No explicit dimensions found, trying to infer from srcset or filename."
    );

    // If no dimensions, try inferring size from srcset
    const srcset = element.getAttribute("srcset");
    let inferredLarge = false;
    if (srcset) {
      const widthMatches = srcset.match(/\b(\d+)w\b/g);
      if (widthMatches) {
        const widths = widthMatches
          .map((w) => parseInt(w.replace("w", ""), 10))
          .filter(Boolean);
        if (widths.length > 0) {
          const maxWidth = Math.max(...widths);
          debug.push(`Inferred max width from srcset: ${maxWidth}`);
          if (maxWidth >= IMAGE_SCORING.PREFERRED_WIDTH) {
            score += IMAGE_SCORING.SCORES.SIZE_BONUS;
            debug.push(
              `Inferred large image from srcset, bonus applied, score: ${score}`
            );
            inferredLarge = true;
          }
        }
      }
    }

    // If we haven't inferred large size, try filename pattern
    if (!inferredLarge) {
      // First, try the x-dimension pattern
      let fileWidth: number | undefined;
      let fileHeight: number | undefined;

      // Pattern 1: (\d+)x(\d+)
      let match = lowerUrl.match(/(\d+)x(\d+)/);
      if (!match) {
        // Pattern 2: (\d+),(\d+)
        // This will catch Amazon-like patterns such as SR116,116 as well.
        // We'll just look for any "\d+,\d+" pattern and consider it dimensions.
        match = lowerUrl.match(/(\d+),(\d+)/);
      }

      if (match) {
        fileWidth = parseInt(match[1], 10);
        fileHeight = parseInt(match[2], 10);

        // If the pattern was from Amazon (e.g. SR116,116), it's still valid dimensions.
        // Check if these are small or large
        if (
          fileWidth < IMAGE_SCORING.MIN_WIDTH ||
          fileHeight < IMAGE_SCORING.MIN_HEIGHT
        ) {
          score = -Infinity;
          debug.push(
            `Excluded due to very small inferred dimensions from filename (${fileWidth}x${fileHeight}), score: ${score}`
          );
          return score;
        } else if (
          fileWidth >= IMAGE_SCORING.PREFERRED_WIDTH &&
          fileHeight >= IMAGE_SCORING.PREFERRED_HEIGHT
        ) {
          score += IMAGE_SCORING.SCORES.SIZE_BONUS;
          debug.push(
            `Inferred large image from filename pattern (${fileWidth}x${fileHeight}), bonus applied, score: ${score}`
          );
        } else {
          // Neutral case: dimensions are not too small, but not large enough for a bonus
          debug.push(
            `Inferred moderate dimensions from filename (${fileWidth}x${fileHeight}), no penalty or bonus applied`
          );
        }
      } else {
        debug.push("No filename dimension pattern detected.");
      }
    }
  }

  // Exclusions based on keywords in the URL
  if (
    lowerUrl.includes("thumbnail") ||
    lowerUrl.includes("icon") ||
    lowerUrl.includes("logo") ||
    lowerUrl.includes("placeholder") ||
    lowerUrl.includes("flag")
  ) {
    score = -Infinity;
    debug.push(
      `Excluded due to unwanted keyword (thumbnail/icon/logo/placeholder/flag), score: ${score}`
    );
    return score;
  }

  // If not meta, and URL suggests product or main, give a small bonus
  if (
    score !== IMAGE_SCORING.SCORES.META &&
    (lowerUrl.includes("product") || lowerUrl.includes("main"))
  ) {
    score += IMAGE_SCORING.SCORES.PRODUCT / 4;
    debug.push(`"product"/"main" in URL, small bonus applied, score: ${score}`);
  }

  return score;
}
