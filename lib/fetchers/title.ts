import { DocumentInput, FetchResponse, TitleData } from "./types";
import { getDocument } from "./utils";
import { titleExtractor } from "../extractors";

const FETCH_TIMEOUT = 5000;

export const titleFetcher = {
  async fetch(
    input: string | DocumentInput
  ): Promise<FetchResponse<TitleData>> {
    try {
      // URL validation
      if (typeof input === "string") {
        if (!input.startsWith("http")) {
          return { success: false, error: "Invalid URL format" };
        }
      }

      // Basic input validation
      if (!input) {
        return { success: false, error: "Invalid document input" };
      }

      // Get document
      const document =
        typeof input === "string" ? await getDocument(input) : input;

      // Extract title with timeout
      const rawTitle = await Promise.race<string | undefined>([
        titleExtractor.extract(document),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), FETCH_TIMEOUT)
        ),
      ]);

      if (!rawTitle) {
        return {
          success: false,
          error: "No title found",
        };
      }

      return {
        success: true,
        data: {
          title: titleExtractor.clean(rawTitle),
        },
      };
    } catch (error) {
      console.error("Error fetching title:", error);
      if (error instanceof Error) {
        // Handle bot detection errors
        if (error.message.includes("blocking automatic data fetching")) {
          return {
            success: false,
            error: error.message,
          };
        }
        if (error.message === "Timeout") {
          return {
            success: false,
            error: "Title extraction timed out",
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
