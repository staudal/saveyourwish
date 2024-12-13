import { Selector } from "./types";

export function extractFromJsonLd(
  document: Document,
  paths: (string | number)[][]
): string | undefined {
  try {
    // Find all JSON-LD scripts
    const scripts = document.querySelectorAll(
      'script[type="application/ld+json"]'
    );

    // Try each script
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent || "");

        // Try each path
        for (const path of paths) {
          let value = data;
          // Follow the path
          for (const key of path) {
            if (value && typeof value === "object") {
              value = value[key];
            } else {
              value = undefined;
              break;
            }
          }
          if (value !== undefined && value !== null) {
            return String(value);
          }
        }
      } catch {
        // Ignore JSON parse errors and continue to next script
        continue;
      }
    }
  } catch {
    // Ignore any DOM errors
  }
  return undefined;
}

export function extractFromSelectors(
  document: Document,
  selectors: Selector[],
  transform?: (value: string) => string | undefined
): string | undefined {
  try {
    for (const { selector, attr } of selectors) {
      // Try querySelector first for better performance
      const element = document.querySelector(selector);
      if (element) {
        const value =
          attr === "textContent"
            ? element.textContent?.trim()
            : element.getAttribute(attr);

        if (value) {
          return transform ? transform(value) : value;
        }
      }

      // If no match with querySelector, try querySelectorAll
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const value =
          attr === "textContent"
            ? element.textContent?.trim()
            : element.getAttribute(attr);

        if (value) {
          const transformed = transform ? transform(value) : value;
          if (transformed) {
            return transformed;
          }
        }
      }
    }
  } catch {
    // Ignore DOM errors
  }
  return undefined;
}

export const normalizeImageUrl = (url: string): string => {
  return url
    .replace(/\?imwidth=\d+/, "")
    .replace(/\?w=\d+/, "")
    .replace(/&width=\d+/, "")
    .replace(/&size=\d+/, "")
    .replace(/&filter=[^&]+/, "");
};

export const scoreImage = (element: Element, url: string): number => {
  let score = 0;

  // Prefer larger images
  const width = parseInt(element.getAttribute("width") || "0");
  const height = parseInt(element.getAttribute("height") || "0");
  if (width > 500) score += 3;
  if (height > 500) score += 3;

  // Prefer images with product-related classes/IDs
  const productTerms = ["product", "main", "hero", "primary", "featured"];
  const elementString = element.outerHTML.toLowerCase();
  productTerms.forEach((term) => {
    if (elementString.includes(term)) score += 2;
  });

  // Prefer images from meta tags
  if (element.tagName === "META") score += 4;

  // Avoid small thumbnails and icons
  if (url.includes("thumb") || url.includes("icon")) score -= 2;
  if (width < 200 || height < 200) score -= 2;

  return score;
};
