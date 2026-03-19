import { NextResponse } from "next/server";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000;

async function getAppDetail(appid: number): Promise<{ name: string; icon: string; isValid: boolean }> {
  try {
    const res = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&filters=basic`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const text = await res.text();
    if (text.trim().startsWith("<")) throw new Error("HTML");
    const data = JSON.parse(text);
    const detail = data?.[appid]?.data;

    if (!detail) return { name: "", icon: "", isValid: false };

    const isComingSoon = detail.release_date?.coming_soon === true;

    return {
      name: detail.name || "",
      icon: detail.header_image || "",
      isValid: !isComingSoon,
    };
  } catch {
    return { name: "", icon: "", isValid: false };
  }
}

export async function GET() {
  const cached = cache.get("trending");
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data);
  }

  try {
    // Steam売上トップをより多く取得できるエンドポイント
    const res = await fetch(
      "https://store.steampowered.com/api/featuredcategories/?cc=JP&l=japanese",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const text = await res.text();
    if (text.trim().startsWith("<")) throw new Error("HTML");

    const data = JSON.parse(text);

    // top_sellersとnew_releasesを合わせて候補を増やす
    const topSellers = data?.top_sellers?.items || [];
    const newReleases = data?.new_releases?.items || [];
    const specials = data?.specials?.items || [];

    // 重複を除いて結合
    const seen = new Set<number>();
    const candidates: any[] = [];
    for (const item of [...topSellers, ...newReleases, ...specials]) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        candidates.push(item);
      }
    }

    console.log("candidates count:", candidates.length);

    const results = [];
    for (const item of candidates) {
      if (results.length >= 10) break;
      const detail = await getAppDetail(item.id);
      if (detail.isValid && detail.name && detail.icon) {
        results.push({ appid: item.id, name: detail.name, icon: detail.icon });
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("trending results:", results.length);
    cache.set("trending", { data: results, timestamp: Date.now() });
    return NextResponse.json(results);
  } catch (e) {
    console.log("Trending fetch failed:", e);
    return NextResponse.json([]);
  }
}