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
      if (typeof input === "string" && !input.startsWith("http")) {
        return { success: false, error: "Invalid URL format" };
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
      return {
        success: false,
        error:
          error instanceof Error && error.message === "Timeout"
            ? "Title extraction timed out"
            : error instanceof Error
            ? error.message
            : "Unknown error",
      };
    }
  },
};
