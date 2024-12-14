import { HTMLElement } from "node-html-parser";

export type MinimalDocument = {
  querySelector: (sel: string) => HTMLElement | null;
  querySelectorAll: (sel: string) => HTMLElement[];
  getElementsByTagName: (tag: string) => HTMLElement[];
  documentElement: {
    lang: string;
    outerHTML: string;
  };
  URL: string;
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

export type PriceData = {
  price: number;
  currency: string;
};

export type TitleData = {
  title: string;
};

export type ImageData = {
  images: string[];
  imageUrl: string;
};

export type CurrencyData = {
  currency: string;
};

export type DocumentInput = Document | MinimalDocument;
