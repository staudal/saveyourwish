import { CURRENCIES } from "../constants";

interface BaseMetadataExtractor {
  extract: (document: Document, url?: string) => string | undefined;
}

interface MetadataExtractorWithClean extends BaseMetadataExtractor {
  clean: (value: string, url?: string) => string;
}

interface PriceExtractor {
  extract: (document: Document) => string | undefined;
  clean: (value: string) => string;
}

interface ImageExtractor {
  extract: (document: Document) => string[];
  clean: (value: string, url?: string) => string;
}

export const titleExtractor: MetadataExtractorWithClean = {
  extract: (document: Document) => {
    const titleSelectors = [
      { selector: 'meta[property="og:title"]', attr: "content" },
      { selector: 'meta[name="title"]', attr: "content" },
      { selector: 'meta[property="product:name"]', attr: "content" },
      { selector: 'meta[name="twitter:title"]', attr: "content" },
      { selector: '[itemprop="name"]', attr: "content" },
      { selector: ".product-title", attr: "textContent" },
      { selector: ".product-name", attr: "textContent" },
      { selector: "#product-title", attr: "textContent" },
      { selector: "h1", attr: "textContent" },
      { selector: "title", attr: "textContent" },
    ];

    for (const { selector, attr } of titleSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const rawTitle =
          attr === "textContent"
            ? (element as HTMLElement).textContent?.trim()
            : element.getAttribute(attr);

        if (rawTitle) {
          return rawTitle;
        }
      }
    }

    return undefined;
  },

  clean: (title: string): string => {
    let cleanedTitle = title;

    // Common separators in product titles
    const separators = [",", " - ", " – ", " — ", " : ", ": ", " | ", "| "];

    // Common patterns that indicate metadata rather than product title
    const metadataPatterns = [
      /\.(com|net|org|dk|co\.uk|de)(\s|:|$)/i,
      /^[0-9\s,]+$/,
      /^[A-Z\s]+$/,
      /^.*\.(com|net|org|dk|co\.uk|de)\b/i,
      /^[^:]+:[^:]+$/,
      /^[A-Z][A-Z\s]+$/,
      /.+/,
    ];

    // Process each separator in sequence
    for (const separator of separators) {
      const parts = cleanedTitle.split(separator);
      if (parts.length > 1) {
        const mainPart = parts[0];
        const latterPart = parts.slice(1).join(separator).toLowerCase().trim();

        if (metadataPatterns.some((pattern) => pattern.test(latterPart))) {
          cleanedTitle = mainPart;
        }
      }
    }

    // Final cleanup
    cleanedTitle = cleanedTitle.trim().replace(/\s+/g, " ");

    return cleanedTitle || title;
  },
};

export const priceExtractor: PriceExtractor = {
  extract: (document: Document) => {
    // Try to get structured data first
    const scriptElements = document.querySelectorAll(
      'script[type="application/ld+json"]'
    );

    for (const script of scriptElements) {
      try {
        const jsonData = JSON.parse(script.textContent || "");

        const price =
          jsonData.offers?.price ||
          jsonData.price ||
          (Array.isArray(jsonData) && jsonData[0]?.offers?.price) ||
          (Array.isArray(jsonData) && jsonData[0]?.price) ||
          jsonData.offers?.[0]?.price ||
          jsonData.offers?.[0]?.priceSpecification?.price;

        if (price) {
          return price.toString();
        }
      } catch (e) {
        console.log("Error parsing JSON-LD:", e);
      }
    }

    const priceSelectors = [
      { selector: 'meta[property="og:price:amount"]', attr: "content" },
      { selector: 'meta[property="product:price:amount"]', attr: "content" },
      { selector: '[itemprop="price"]', attr: "content" },
      { selector: ".price", attr: "textContent" },
      { selector: ".price-tag", attr: "textContent" },
      { selector: ".amount", attr: "textContent" },
      { selector: ".value", attr: "textContent" },
      { selector: ".price-value", attr: "textContent" },
      { selector: "[data-price]", attr: "data-price" },
      { selector: "[data-amount]", attr: "data-amount" },
      { selector: "[data-price-value]", attr: "data-price-value" },
      { selector: 'span[class*="price"]', attr: "textContent" },
      { selector: 'div[class*="price"]', attr: "textContent" },
      { selector: '[class*="price"]', attr: "textContent" },
      { selector: 'meta[itemprop="price"]', attr: "content" },
    ];

    for (const { selector, attr } of priceSelectors) {
      const elements = document.querySelectorAll(selector);

      for (const element of elements) {
        const rawPrice =
          attr === "textContent"
            ? (element as HTMLElement).textContent?.trim()
            : element.getAttribute(attr);

        if (rawPrice) {
          const uniquePrice = rawPrice.match(/[\d.,]+/)?.[0];
          if (uniquePrice) {
            return uniquePrice;
          }
        }
      }
    }

    return undefined;
  },

  clean: (price: string): string => {
    const match = price.match(/([\d.,]+)/);
    if (!match) {
      return "0";
    }

    const rawPrice = match[0];

    const parts = rawPrice.split(/[.,]/);

    if (parts.length === 1) {
      return parts[0];
    }

    if (parts.length === 2) {
      if (parts[1].length <= 2) {
        return `${parts[0]}.${parts[1]}`;
      }
      return parts.join("");
    }

    const lastPart = parts.pop() || "";

    if (lastPart.length <= 2) {
      return `${parts.join("")}.${lastPart}`;
    }

    return parts.concat(lastPart).join("");
  },
};

export const currencyExtractor: BaseMetadataExtractor = {
  extract: (document: Document) => {
    const currencySymbols = Object.fromEntries(
      CURRENCIES.map((currency) => [currency.symbol, currency.value])
    );

    // Try to get structured data first
    const scriptElements = document.querySelectorAll(
      'script[type="application/ld+json"]'
    );

    for (const script of scriptElements) {
      try {
        const jsonData = JSON.parse(script.textContent || "");
        const currency =
          jsonData.offers?.priceCurrency ||
          jsonData.priceCurrency ||
          (Array.isArray(jsonData) && jsonData[0]?.offers?.priceCurrency) ||
          (Array.isArray(jsonData) && jsonData[0]?.priceCurrency) ||
          jsonData.offers?.[0]?.priceCurrency ||
          jsonData.offers?.[0]?.priceSpecification?.priceCurrency;

        if (currency) {
          return currency.toString();
        }
      } catch (e) {
        console.log("Error parsing JSON-LD:", e);
      }
    }

    const currencySelectors = [
      { selector: 'meta[property="og:price:currency"]', attr: "content" },
      { selector: 'meta[property="product:price:currency"]', attr: "content" },
      { selector: '[itemprop="priceCurrency"]', attr: "content" },
      { selector: "[data-currency]", attr: "data-currency" },
      { selector: 'meta[itemprop="priceCurrency"]', attr: "content" },
    ];

    for (const { selector, attr } of currencySelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const currency =
          attr === "textContent"
            ? (element as HTMLElement).textContent?.trim()
            : element.getAttribute(attr);

        if (currency) {
          return currency.toUpperCase();
        }
      }
    }

    const priceElements = document.querySelectorAll('[class*="price"]');

    for (const element of priceElements) {
      const text = (element as HTMLElement).textContent || "";
      for (const [symbol, code] of Object.entries(currencySymbols)) {
        if (text.includes(symbol)) {
          return code;
        }
      }
    }

    const url = document.URL || document.baseURI;
    if (url) {
      try {
        const tld = new URL(url).hostname.split(".").pop()?.toLowerCase();
        if (tld === "uk" || tld === "co.uk") {
          return "GBP";
        }
        if (tld === "dk") {
          return "DKK";
        }
      } catch (e) {
        console.log("Error parsing URL:", e);
      }
    }

    return undefined;
  },
};

export const imageExtractor: ImageExtractor = {
  extract: (document: Document) => {
    const images: { url: string; score: number }[] = [];

    const normalizeUrl = (url: string, baseUri: string): string | undefined => {
      try {
        if (url.startsWith("//")) url = `https:${url}`;
        let absoluteUrl = new URL(url, baseUri).href;
        if (absoluteUrl.startsWith("http:")) {
          absoluteUrl = absoluteUrl.replace("http:", "https:");
        }
        return absoluteUrl;
      } catch (e) {
        console.error("Error normalizing URL:", e);
        return undefined;
      }
    };

    const normalizeImageUrl = (url: string): string => {
      // Remove size constraints from common e-commerce sites
      return url
        .replace(/\?imwidth=\d+/, "") // Remove Zalando's imwidth parameter
        .replace(/\?w=\d+/, "") // Remove generic width parameter
        .replace(/&width=\d+/, "") // Remove width as query param
        .replace(/&size=\d+/, "") // Remove size constraints
        .replace(/&filter=[^&]+/, ""); // Remove image filters
    };

    const scoreImage = (element: Element, url: string): number => {
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

    const addUniqueImage = (element: Element, url: string) => {
      const normalizedUrl = normalizeUrl(url, document.baseURI);
      if (normalizedUrl) {
        const cleanUrl = normalizeImageUrl(normalizedUrl);
        if (!images.some((img) => img.url === cleanUrl)) {
          const score = scoreImage(element, cleanUrl);
          images.push({ url: cleanUrl, score });
        }
      }
    };

    const imageSelectors = [
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
      // Add more product gallery selectors
      { selector: ".product-gallery img", attr: "src" },
      { selector: ".product-images img", attr: "src" },
      {
        selector: '[data-gallery-role="gallery-placeholder"] img',
        attr: "src",
      }, // Magento stores
      { selector: "#imageBlock img", attr: "src" }, // Amazon
      { selector: ".imgTagWrapper img", attr: "src" }, // Amazon
    ];

    // Rest of the code remains the same, but use addUniqueImage instead of direct URL handling
    for (const { selector, attr } of imageSelectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const imageUrl =
          attr === "src"
            ? element.getAttribute("src")
            : element.getAttribute(attr);

        if (imageUrl) {
          addUniqueImage(element, imageUrl);
        }
      });
    }

    // Add JSON-LD image extraction
    const scriptElements = document.querySelectorAll(
      'script[type="application/ld+json"]'
    );

    for (const script of scriptElements) {
      try {
        const jsonData = JSON.parse(script.textContent || "");
        const imageUrls = Array.isArray(jsonData.image)
          ? jsonData.image
          : [jsonData.image];

        if (imageUrls.length > 0) {
          imageUrls.forEach((url: string) => {
            if (url) addUniqueImage(script, url);
          });
        }
      } catch (e) {
        console.error("Error parsing JSON-LD:", e);
      }
    }

    // Sort images by score and return URLs only
    const sortedImages = images
      .sort((a, b) => b.score - a.score)
      .map((img) => img.url);

    return sortedImages;
  },

  clean: (imageUrl: string, baseUrl?: string): string => {
    try {
      // Handle protocol-relative URLs
      if (imageUrl.startsWith("//")) {
        imageUrl = `https:${imageUrl}`;
      }

      if (baseUrl) {
        const absoluteUrl = new URL(imageUrl, baseUrl).href;
        return absoluteUrl;
      }

      new URL(imageUrl);
      return imageUrl;
    } catch (e) {
      console.error("Invalid image URL:", e);
      return imageUrl;
    }
  },
};
