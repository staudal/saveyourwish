const ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY!;

export interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: Array<{
    id: string;
    urls: {
      raw: string;
      full: string;
      regular: string;
      small: string;
      thumb: string;
    };
    user: {
      name: string;
      username: string;
      links: {
        html: string;
      };
    };
    links: {
      html: string;
      download_location: string;
    };
  }>;
}

export async function searchUnsplash(query: string, page = 1, perPage = 8) {
  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query
    )}&page=${page}&per_page=${perPage}`,
    {
      headers: {
        Authorization: `Client-ID ${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch images");
  }

  return response.json();
}

export async function trackDownload(downloadLocation: string) {
  try {
    await fetch(downloadLocation, {
      headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`,
      },
    });
  } catch (error) {
    console.error("Failed to track Unsplash download:", error);
  }
}
