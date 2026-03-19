import { NextResponse } from "next/server";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000;

async function getAppDetail(appid: number): Promise<{ name: string; icon: string }> {
  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&filters=basic`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const text = await res.text();
    if (text.trim().startsWith("<")) throw new Error("HTML");
    const data = JSON.parse(text);
    const detail = data?.[appid]?.data;
    return {
      name: detail?.name || "",
      icon: detail?.header_image || "",
    };
  } catch {
    return { name: "", icon: "" };
  }
}

export async function GET() {
  const cached = cache.get("trending");
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data);
  }

  try {
    const res = await fetch(
      "https://store.steampowered.com/api/featuredcategories/?cc=JP&l=japanese",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const text = await res.text();
    if (text.trim().startsWith("<")) throw new Error("HTML");

    const data = JSON.parse(text);
    const topSellers = data?.top_sellers?.items || [];

    if (topSellers.length > 0) {
      // appdetailsから正確なname/iconを取得
      const results = await Promise.all(
        topSellers.slice(0, 10).map(async (item: any) => {
          const detail = await getAppDetail(item.id);
          return {
            appid: item.id,
            name: detail.name || item.name,
            icon: detail.icon,
          };
        })
      );
      cache.set("trending", { data: results, timestamp: Date.now() });
      return NextResponse.json(results);
    }
    throw new Error("No top sellers");
  } catch {
    console.log("Trending fetch failed");
    return NextResponse.json([]);
  }
}