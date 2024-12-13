import { FetchResponse, TitleData } from "./types";
import { fetchWithHeaders, createDOM } from "./utils";
import { titleExtractor } from "../extractors";

export async function fetchTitle(
  url: string
): Promise<FetchResponse<TitleData>> {
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

    const rawTitle = titleExtractor.extract(document, url);
    if (!rawTitle) {
      return {
        success: false,
        error: "No title found",
      };
    }

    return {
      success: true,
      data: {
        title: titleExtractor.clean(rawTitle, url),
      },
    };
  } catch (error) {
    console.error("Error fetching title:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
