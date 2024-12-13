import { FetchResponse, ImageData } from "./types";
import { fetchWithHeaders, createDOM } from "./utils";
import { imageExtractor } from "../extractors";

export async function fetchImages(
  url: string
): Promise<FetchResponse<ImageData>> {
  try {
    const response = await fetchWithHeaders(url);
    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch URL: ${response.statusText}`,
      };
    }

    const html = await response.text();
    const dom = createDOM(html);
    const document = dom.window.document;

    const images = imageExtractor.extract(document);
    if (!images.length) {
      return {
        success: false,
        error: "No images found",
      };
    }

    // Clean all image URLs
    const cleanedImages = images.map((img) => imageExtractor.clean(img, url));

    return {
      success: true,
      data: {
        images: cleanedImages,
        imageUrl: cleanedImages[0],
      },
    };
  } catch (error) {
    console.error("Error fetching images:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
