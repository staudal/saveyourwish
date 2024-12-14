import { DocumentInput, FetchResponse, ImageData } from "./types";
import { getDocument } from "./utils";
import { imageExtractor } from "../extractors";
import { normalizeImageUrl } from "../extractors/utils";

const FETCH_TIMEOUT = 5000;

export const imageFetcher = {
  async fetch(
    input: string | DocumentInput
  ): Promise<FetchResponse<ImageData>> {
    try {
      // URL validation
      if (typeof input === "string") {
        if (!input.startsWith("http")) {
          return { success: false, error: "Invalid URL format" };
        }
      }

      // Validate document input
      if (
        !input ||
        (typeof input !== "string" && !("querySelectorAll" in input))
      ) {
        return { success: false, error: "Unknown error" };
      }

      // Get document
      const document =
        typeof input === "string" ? await getDocument(input) : input;

      // Extract images with timeout
      const images =
        (await Promise.race([
          imageExtractor.extract(document),
          new Promise<string[]>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), FETCH_TIMEOUT)
          ),
        ])) || [];

      // Filter out invalid URLs
      const validImages = images.filter((url) => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      });

      if (!validImages.length) {
        return {
          success: false,
          error: "No images found",
        };
      }

      // Clean URLs
      const cleanedImages = validImages.map((img) => {
        try {
          const urlObj = new URL(img);
          // Remove all query parameters
          urlObj.search = "";
          return imageExtractor.clean(urlObj.toString());
        } catch {
          // If URL parsing fails, try cleaning with normalizeImageUrl
          const normalized = normalizeImageUrl(img);
          return imageExtractor.clean(normalized);
        }
      });

      return {
        success: true,
        data: {
          images: cleanedImages,
          imageUrl: cleanedImages[0],
        },
      };
    } catch (error) {
      console.error("Error fetching images:", error);
      if (error instanceof Error) {
        if (error.message === "Timeout") {
          return {
            success: false,
            error: "Image extraction timed out",
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: "Unknown error",
      };
    }
  },
};
