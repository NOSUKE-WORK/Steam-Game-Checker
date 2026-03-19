import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const appid = searchParams.get("appid");

  if (!appid) return NextResponse.json({ error: "appid required" }, { status: 400 });

  const cached = cache.get(appid);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json({ url: cached.url });
  }

  // Steam CDNの画像URLを直接返す（APIコール不要）
  const url = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`;
  cache.set(appid, { url, timestamp: Date.now() });
  return NextResponse.json({ url });
}