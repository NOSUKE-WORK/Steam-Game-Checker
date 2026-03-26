import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000;

async function getAppDetail(appid: number, lang: string): Promise<{ name: string; icon: string }> {
  try {
    const l = lang === "en" ? "english" : "japanese";
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&filters=basic&l=${l}`,
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "ja";
  const cacheKey = `sales-${lang}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data);
  }

  try {
    const cc = lang === "en" ? "us" : "jp";
    const l = lang === "en" ? "english" : "japanese";

    const res = await fetch(
      `https://store.steampowered.com/api/featuredcategories/?cc=${cc}&l=${l}`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const text = await res.text();
    if (text.trim().startsWith("<")) throw new Error("HTML");

    const data = JSON.parse(text);
    const specials = data?.specials?.items || [];

    const results = await Promise.all(
      specials.slice(0, 10).map(async (item: any) => {
        const detail = await getAppDetail(item.id, lang);
        return {
          appid: item.id,
          name: detail.name || item.name,
          icon: detail.icon,
          discount: item.discount_percent || 0,
          price: item.final_price
            ? lang === "en"
              ? `$${(item.final_price / 100).toFixed(2)}`
              : `¥${Math.floor(item.final_price / 100).toLocaleString()}`
            : "",
          originalPrice: item.original_price
            ? lang === "en"
              ? `$${(item.original_price / 100).toFixed(2)}`
              : `¥${Math.floor(item.original_price / 100).toLocaleString()}`
            : "",
        };
      })
    );

    cache.set(cacheKey, { data: results, timestamp: Date.now() });
    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}