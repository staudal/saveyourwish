import { ImageExtractor, Selector } from "./types";
import { normalizeImageUrl, scoreImage } from "./utils";

export const imageExtractor: ImageExtractor = {
  extract: (document: Document): string[] => {
    const images: { url: string; score: number }[] = [];

    const addUniqueImage = (
      element: Element,
      url: string | null | undefined
    ) => {
      if (!url) return;

      try {
        let absoluteUrl = url;
        if (url.startsWith("//")) absoluteUrl = `https:${url}`;
        if (absoluteUrl.startsWith("http:")) {
          absoluteUrl = absoluteUrl.replace("http:", "https:");
        }

        const cleanUrl = normalizeImageUrl(absoluteUrl);
        if (!images.some((img) => img.url === cleanUrl)) {
          const score = scoreImage(element, cleanUrl);
          images.push({ url: cleanUrl, score });
        }
      } catch (e) {
        console.error("Error processing image URL:", e);
      }
    };

    // Extract from meta tags and common selectors
    const imageSelectors: Selector[] = [
      { selector: 'meta[property="og:image"]', attr: "content" },
      { selector: 'meta[property="og:image:url"]', attr: "content" },
      { selector: 'meta[property="og:image:secure_url"]', attr: "content" },
      { selector: 'meta[name="twitter:image"]', attr: "content" },
      { selector: 'meta[name="twitter:image:src"]', attr: "content" },
      { selector: 'meta[property="product:image"]', attr: "content" },
      { selector: '[itemprop="image"]', attr: "content" },
      { selector: '[itemprop="image"]', attr: "src" },
      { selector: "#product-image", attr: "src" },
      { selector: ".product-image img", attr: "src" },
      { selector: ".product-image-main img", attr: "src" },
      { selector: "[data-main-image]", attr: "src" },
      { selector: ".product-gallery img", attr: "src" },
      { selector: ".product-images img", attr: "src" },
      {
        selector: '[data-gallery-role="gallery-placeholder"] img',
        attr: "src",
      },
      { selector: "#imageBlock img", attr: "src" },
      { selector: ".imgTagWrapper img", attr: "src" },
    ];

    // Extract from selectors
    for (const { selector, attr } of imageSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const imageUrl =
          attr === "src"
            ? element.getAttribute("src")
            : element.getAttribute(attr);
        addUniqueImage(element, imageUrl);
      });
    }

    // Extract from JSON-LD
    const jsonLdPaths: (string | number)[][] = [["image"], ["offers", "image"]];
    const scriptElements = document.querySelectorAll(
      'script[type="application/ld+json"]'
    );

    for (const script of scriptElements) {
      try {
        const jsonData = JSON.parse(script.textContent || "");
        for (const path of jsonLdPaths) {
          let value = jsonData;
          for (const key of path) {
            value = value?.[key];
            if (!value) break;
          }
          if (value) {
            const imageUrls = Array.isArray(value) ? value : [value];
            imageUrls.forEach((url) => {
              if (url) addUniqueImage(script, url);
            });
          }
        }
      } catch (e) {
        console.error("Error parsing JSON-LD:", e);
      }
    }

    // Sort images by score and return URLs only
    return images.sort((a, b) => b.score - a.score).map((img) => img.url);
  },

  clean: (imageUrl: string, baseUrl?: string): string => {
    try {
      if (imageUrl.startsWith("//")) {
        imageUrl = `https:${imageUrl}`;
      }

      if (baseUrl) {
        return new URL(imageUrl, baseUrl).href;
      }

      return new URL(imageUrl).href;
    } catch (e) {
      console.error("Invalid image URL:", e);
      return imageUrl;
    }
  },
};
