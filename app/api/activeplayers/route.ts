import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000;

const POPULAR_GAMES = [
  { appid: 730 },
  { appid: 578080 },
  { appid: 1172470 },
  { appid: 252490 },
  { appid: 413150 },
  { appid: 553850 },
  { appid: 381210 },
  { appid: 105600 },
  { appid: 1086940 },
  { appid: 1091500 },
  { appid: 1245620 },
  { appid: 1623730 },
  { appid: 292030 },
  { appid: 322330 },
  { appid: 2358720 },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "ja";
  const cacheKey = `activeplayers-${lang}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data);
  }

  try {
    const l = lang === "en" ? "english" : "japanese";

    const results = await Promise.all(
      POPULAR_GAMES.map(async (game) => {
        try {
          const [ccuRes, detailRes] = await Promise.all([
            fetch(`https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${game.appid}`),
            fetch(`https://store.steampowered.com/api/appdetails?appids=${game.appid}&filters=basic&l=${l}`, {
              headers: { "User-Agent": "Mozilla/5.0" },
            }),
          ]);

          const ccuData = await ccuRes.json();
          const ccu = ccuData?.response?.player_count || 0;

          const detailText = await detailRes.text();
          const detailData = JSON.parse(detailText);
          const detail = detailData?.[game.appid]?.data;

          return {
            appid: game.appid,
            name: detail?.name || "",
            icon: detail?.header_image || "",
            ccu,
          };
        } catch {
          return { appid: game.appid, name: "", icon: "", ccu: 0 };
        }
      })
    );

    const sorted = results
      .filter((g) => g.ccu > 0 && g.name)
      .sort((a, b) => b.ccu - a.ccu)
      .slice(0, 10);

    cache.set(cacheKey, { data: sorted, timestamp: Date.now() });
    return NextResponse.json(sorted);
  } catch {
    return NextResponse.json([]);
  }
}