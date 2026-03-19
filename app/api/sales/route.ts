import { NextResponse } from "next/server";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000;

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
  const cached = cache.get("sales");
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
    const specials = data?.specials?.items || [];

    const results = await Promise.all(
      specials.slice(0, 10).map(async (item: any) => {
        const detail = await getAppDetail(item.id);
        return {
          appid: item.id,
          name: detail.name || item.name,
          icon: detail.icon,
          discount: item.discount_percent || 0,
          price: item.final_price ? `¥${Math.floor(item.final_price / 100).toLocaleString()}` : "",
          originalPrice: item.original_price ? `¥${Math.floor(item.original_price / 100).toLocaleString()}` : "",
        };
      })
    );

    cache.set("sales", { data: results, timestamp: Date.now() });
    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}