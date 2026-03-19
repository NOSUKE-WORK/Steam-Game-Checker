import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { reviews, targetLang } = await request.json();

  if (!reviews || reviews.length === 0) {
    return NextResponse.json({ reviews: [] });
  }

  try {
    const translated = await Promise.all(
      reviews.map(async (r: any) => {
        const text = r.review || "";
        if (!text || text.length < 5) return { ...r, translatedReview: text, wasTranslated: false };

        // ひらがなが含まれていれば日本語、ASCII文字のみなら英語
        const hasHiragana = /[\u3041-\u3096]/.test(text);
        const isAsciiOnly = /^[\x00-\x7F\s]+$/.test(text.trim());

        if (targetLang === "ja" && hasHiragana) {
          return { ...r, translatedReview: text, wasTranslated: false };
        }
        if (targetLang === "en" && isAsciiOnly) {
          return { ...r, translatedReview: text, wasTranslated: false };
        }

        const systemPrompt = targetLang === "ja"
          ? "あなたは翻訳者です。入力されたテキストを全て日本語に翻訳してください。中国語・韓国語・英語・その他全ての言語を日本語に翻訳してください。元の言語のテキストを一切残さないでください。翻訳文のみ返答してください。"
          : "You are a translator. Translate ALL of the input text to English. Translate from any language including Japanese, Chinese, Korean. Do not leave any non-English text. Return only the translation.";

        const userPrompt = targetLang === "ja"
          ? `以下のテキストを全て日本語に翻訳してください。中国語・韓国語が含まれていても全て日本語にしてください:\n\n${text.slice(0, 800)}`
          : `Translate ALL of the following text to English:\n\n${text.slice(0, 800)}`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.1,
            max_tokens: 800,
          }),
        });

        const data = await response.json();
        if (!response.ok) return { ...r, translatedReview: text, wasTranslated: false };

        const translatedText = data.choices?.[0]?.message?.content?.trim() || text;
        return { ...r, translatedReview: translatedText, wasTranslated: true };
      })
    );

    return NextResponse.json({ reviews: translated });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json({ reviews });
  }
}