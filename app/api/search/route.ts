import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=japanese&cc=JP`
    );
    const data = await response.json();

    const results = data.items?.map((item: any) => ({
      appid: item.id,
      name: item.name,
      icon: item.tiny_image,
    })) || [];

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}