import { NextRequest, NextResponse } from "next/server";

// サーバーメモリに保存（Vercelではインスタンスごとに保持）
const searchCounts = new Map<string, { name: string; appid: number; icon: string; count: number }>();

export async function GET() {
  const ranking = Array.from(searchCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  return NextResponse.json(ranking);
}

export async function POST(request: NextRequest) {
  const { appid, name, icon } = await request.json();
  if (!appid || !name) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const key = String(appid);
  const existing = searchCounts.get(key);
  searchCounts.set(key, {
    appid,
    name,
    icon: icon || existing?.icon || "",
    count: (existing?.count || 0) + 1,
  });

  return NextResponse.json({ ok: true });
}