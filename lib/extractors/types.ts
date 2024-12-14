import { MinimalDocument } from "@/lib/fetchers/types";

export interface BaseMetadataExtractor<T> {
  extract: (document: Document | MinimalDocument) => T | undefined;
}

export interface MetadataExtractorWithClean
  extends BaseMetadataExtractor<string> {
  clean: (value: string, url?: string) => string;
}

export interface ImageExtractor {
  extract: (document: Document | MinimalDocument) => string[];
  clean: (imageUrl: string, baseUrl?: string) => string;
}

export type Selector = {
  selector: string;
  attr:
    | "content"
    | "textContent"
    | "src"
    | "data-price"
    | "data-amount"
    | "data-price-value";
};

export type SuccessResponse<T> = {
  success: true;
  data: T;
};

export type ErrorResponse = {
  success: false;
  error: string;
};

export type FetchResponse<T> = SuccessResponse<T> | ErrorResponse;
