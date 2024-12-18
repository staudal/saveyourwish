export interface UnsplashSearchResponse {
  total_pages: number;
  results: Array<{
    id: string;
    urls: {
      regular: string;
      small: string;
    };
    links: {
      download_location: string;
    };
  }>;
}

export async function searchUnsplash(query: string, page = 1, perPage = 8) {
  const response = await fetch(
    `/api/unsplash?query=${encodeURIComponent(
      query
    )}&page=${page}&perPage=${perPage}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch images");
  }

  return response.json();
}

export async function trackDownload(downloadLocation: string) {
  try {
    await fetch("/api/unsplash", {
      method: "POST",
      body: JSON.stringify({ downloadLocation }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Failed to track Unsplash download:", error);
  }
}
