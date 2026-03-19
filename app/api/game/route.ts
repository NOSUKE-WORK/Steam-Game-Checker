import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000;

async function safeFetchJson(url: string): Promise<any> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    });
    const text = await res.text();
    if (text.trim().startsWith("<")) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function fetchAllReviews(appid: string, reviewType: string, lang: string): Promise<any[]> {
  const results: any[] = [];
  let cursor = "*";
  const maxPages = 20;
  const reviewLang = lang === "en" ? "english" : "japanese";

  for (let page = 0; page < maxPages; page++) {
    const url = `https://store.steampowered.com/appreviews/${appid}?json=1&filter=helpful&review_type=${reviewType}&num_per_page=100&language=${reviewLang}&cursor=${encodeURIComponent(cursor)}`;
    const data = await safeFetchJson(url);

    if (!data?.reviews?.length) break;

    results.push(...data.reviews);

    if (!data.cursor || data.cursor === cursor || data.reviews.length < 100) break;
    cursor = data.cursor;

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`fetchAllReviews [${reviewType}/${reviewLang}]: ${results.length} reviews fetched`);
  return results;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const appid = searchParams.get("appid");
  const lang = searchParams.get("lang") || "ja";

  if (!appid) {
    return NextResponse.json({ error: "appid is required" }, { status: 400 });
  }

  const cacheKey = `${appid}-${lang}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data);
  }

  try {
    const cc = lang === "en" ? "us" : "jp";
    const l = lang === "en" ? "english" : "japanese";

    const [detailData, reviewSummaryData] = await Promise.all([
      safeFetchJson(`https://store.steampowered.com/api/appdetails?appids=${appid}&cc=${cc}&l=${l}`),
      safeFetchJson(`https://store.steampowered.com/appreviews/${appid}?json=1&num_per_page=0&language=all`),
    ]);

    const detail = detailData?.[appid]?.data;
    if (!detail) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const [allPositive, allNegative] = await Promise.all([
      fetchAllReviews(appid, "positive", lang),
      fetchAllReviews(appid, "negative", lang),
    ]);

    const reviewSummary = reviewSummaryData?.query_summary;
    const totalPositive = reviewSummary?.total_positive || 0;
    const totalNegative = reviewSummary?.total_negative || 0;
    const totalReviews = reviewSummary?.total_reviews || 0;
    const scorePercent = totalReviews > 0
      ? Math.round((totalPositive / totalReviews) * 100)
      : null;

    const ccuData = await safeFetchJson(
      `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appid}`
    );
    const ccu = ccuData?.response?.player_count || 0;

    const sortAndSlice = (reviews: any[]) =>
      reviews
        .filter((r: any) => {
          const text = r.review || "";
          if (text.length < 10) return false;
          // 日本語モード：ひらがな・カタカナを含むもののみ
          if (lang === "ja") return /[\u3041-\u3096\u30A1-\u30F6]/.test(text);
          // 英語モード：ASCII文字のみ
          return /^[\x00-\x7F\s]+$/.test(text.trim());
        })
        .sort((a: any, b: any) => (b.votes_up || 0) - (a.votes_up || 0))
        .slice(0, 10);

    const positiveReviews = sortAndSlice(allPositive);
    const negativeReviews = sortAndSlice(allNegative);

    console.log(`Filtered: positive=${positiveReviews.length}, negative=${negativeReviews.length}`);

    const result = {
      appid,
      name: detail.name,
      headerImage: detail.header_image,
      description: detail.short_description,
      storeUrl: `https://store.steampowered.com/app/${appid}`,
      price: {
        current: detail.price_overview?.final_formatted || (lang === "ja" ? "無料" : "Free"),
        original: detail.price_overview?.initial_formatted || null,
        discount: detail.price_overview?.discount_percent || 0,
      },
      rating: {
        score: scorePercent,
        positive: totalPositive,
        negative: totalNegative,
        total: totalReviews,
        summary: reviewSummary?.review_score_desc || "",
      },
      ccu,
      positiveReviews,
      negativeReviews,
    };

    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Game API error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}