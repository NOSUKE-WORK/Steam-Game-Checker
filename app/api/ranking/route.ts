import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export async function GET() {
  try {
    const ranking = await redis.get<any[]>("searchRanking") || [];
    return NextResponse.json(ranking);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  const { appid, name, icon } = await request.json();
  if (!appid || !name) return NextResponse.json({ error: "invalid" }, { status: 400 });

  try {
    const ranking = await redis.get<any[]>("searchRanking") || [];

    const existing = ranking.find((r: any) => r.appid === appid);
    const filtered = ranking.filter((r: any) => r.appid !== appid);
    const updated = [
      { appid, name, icon: icon || existing?.icon || "", count: (existing?.count || 0) + 1 },
      ...filtered,
    ]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    await redis.set("searchRanking", updated);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("ranking error:", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}