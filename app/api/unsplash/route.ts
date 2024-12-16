import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { downloadLocation } = await req.json();

  try {
    const response = await fetch(downloadLocation, {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_SECRET_KEY}`,
      },
    });

    if (!response.ok) throw new Error("Failed to track download");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to track download" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const page = searchParams.get("page") || "1";
  const perPage = searchParams.get("perPage") || "8";

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    if (!process.env.UNSPLASH_SECRET_KEY) {
      console.error("UNSPLASH_SECRET_KEY is not defined");
      throw new Error("Unsplash API key is not configured");
    }

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query
    )}&page=${page}&per_page=${perPage}`;

    console.log("Fetching from Unsplash:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Unsplash API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      });
      throw new Error(`Unsplash API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Unsplash search error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch images",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}
