import { NextResponse } from "next/server";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000;

const POPULAR_GAMES = [
  { appid: 730, name: "Counter-Strike 2" },
  { appid: 578080, name: "PUBG" },
  { appid: 1172470, name: "Apex Legends" },
  { appid: 252490, name: "Rust" },
  { appid: 413150, name: "Stardew Valley" },
  { appid: 553850, name: "HELLDIVERS 2" },
  { appid: 381210, name: "Dead by Daylight" },
  { appid: 105600, name: "Terraria" },
  { appid: 1086940, name: "Baldur's Gate 3" },
  { appid: 1091500, name: "Cyberpunk 2077" },
  { appid: 1245620, name: "ELDEN RING" },
  { appid: 1623730, name: "Palworld" },
  { appid: 292030, name: "The Witcher 3" },
  { appid: 322330, name: "Don't Starve Together" },
  { appid: 2358720, name: "Black Myth: Wukong" },
];

export async function GET() {
  const cached = cache.get("activeplayers");
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data);
  }

  try {
    const results = await Promise.all(
      POPULAR_GAMES.map(async (game) => {
        try {
          const res = await fetch(
            `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${game.appid}`
          );
          const data = await res.json();
          const ccu = data?.response?.player_count || 0;
          return {
            appid: game.appid,
            name: game.name,
            icon: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
            ccu,
          };
        } catch {
          return { ...game, icon: "", ccu: 0 };
        }
      })
    );

    const sorted = results
      .filter((g) => g.ccu > 0)
      .sort((a, b) => b.ccu - a.ccu)
      .slice(0, 10);

    cache.set("activeplayers", { data: sorted, timestamp: Date.now() });
    return NextResponse.json(sorted);
  } catch {
    return NextResponse.json([]);
  }
}