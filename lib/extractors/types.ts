export interface BaseMetadataExtractor {
  extract: (document: Document, url?: string) => string | undefined;
}

export interface MetadataExtractorWithClean extends BaseMetadataExtractor {
  clean: (value: string, url?: string) => string;
}

export interface PriceExtractor {
  extract: (document: Document) => number | undefined;
  clean: (price: string) => number;
}

export interface ImageExtractor {
  extract: (document: Document) => string[];
  clean: (value: string, url?: string) => string;
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
