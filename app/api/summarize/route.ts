import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const { appid, reviews, lang } = await request.json();

  if (!reviews || reviews.length === 0) {
    return NextResponse.json({ error: "No reviews" }, { status: 400 });
  }

  const cacheKey = `${appid}-${lang}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json(cached.data);
  }

  try {
    const isJa = lang === "ja";

    // 日本語モード：ひらがな・カタカナを含むもののみ
    // 英語モード：ASCII文字のみ
    const filteredReviews = reviews
      .map((r: any) => r.review || "")
      .filter((r: string) => {
        if (r.length < 20) return false;
        if (isJa) return /[\u3041-\u3096\u30A1-\u30F6]/.test(r);
        return /^[\x00-\x7F\s]+$/.test(r.trim());
      })
      .slice(0, 20)
      .map((r: string) => r.slice(0, 300))
      .join("\n---\n");

    if (!filteredReviews) {
      return NextResponse.json({ error: "No suitable reviews" }, { status: 400 });
    }

    const prompt = isJa
      ? `以下の日本語のSteamゲームレビューを読んで、好評ポイントと不評ポイントをそれぞれ3つ、具体的にまとめてください。必ず以下のJSON形式のみで返答してください:
{"positive":["好評1","好評2","好評3"],"negative":["不評1","不評2","不評3"]}

レビュー:
${filteredReviews}`
      : `Summarize these Steam reviews with 3 specific positive and 3 specific negative points. Return ONLY this JSON:
{"positive":["point1","point2","point3"],"negative":["point1","point2","point3"]}

Reviews:
${filteredReviews}`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You respond with valid JSON only. No markdown, no code blocks, no explanation.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq error:", JSON.stringify(data));
      return NextResponse.json({ error: "Groq API error" }, { status: 500 });
    }

    const text = data.choices?.[0]?.message?.content || "";
    const clean = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      const positiveMatch = clean.match(/"positive"\s*:\s*\[([\s\S]*?)\]/);
      const negativeMatch = clean.match(/"negative"\s*:\s*\[([\s\S]*?)\]/);
      const extractItems = (match: RegExpMatchArray | null): string[] => {
        if (!match) return [];
        return match[1]
          .split(/",\s*"/)
          .map((s: string) => s.replace(/^"|"$/g, "").trim())
          .filter((s: string) => s.length > 0)
          .slice(0, 3);
      };
      parsed = {
        positive: extractItems(positiveMatch),
        negative: extractItems(negativeMatch),
      };
    }

    if (!parsed?.positive?.length || !parsed?.negative?.length) {
      return NextResponse.json({ error: "Invalid response" }, { status: 500 });
    }

    cache.set(cacheKey, { data: parsed, timestamp: Date.now() });
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Summarize error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}