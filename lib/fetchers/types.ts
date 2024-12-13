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
