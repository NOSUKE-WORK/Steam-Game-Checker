"use client";

import { useState, useEffect, useRef } from "react";

type Props = {
  appid: number;
  lang: "ja" | "en";
};

function ReviewCard({ review, lang }: { review: any; lang: string }) {
  const [expanded, setExpanded] = useState(false);
  const text = review.review || "";
  const limit = 150;
  const isLong = text.length > limit;

  return (
    <div style={{
      borderBottom: "1px solid #222",
      paddingBottom: "0.75rem",
      marginBottom: "0.75rem",
    }}>
      <div style={{
        fontSize: "0.8rem",
        color: "#ccc",
        lineHeight: 1.7,
        wordBreak: "break-word",
        overflow: "hidden",
        display: "-webkit-box",
        WebkitLineClamp: expanded ? 999 : 4,
        WebkitBoxOrient: "vertical" as const,
      }}>
        {text}
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: "none", border: "none", color: "#00FF41",
            fontSize: "0.72rem", cursor: "pointer", padding: "0.2rem 0",
            marginTop: "0.2rem", display: "block",
          }}
        >
          {expanded
            ? (lang === "ja" ? "▲ 閉じる" : "▲ Show less")
            : (lang === "ja" ? "▼ 続きを読む" : "▼ Read more")}
        </button>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.3rem" }}>
        <span style={{ fontSize: "0.7rem", color: "#555" }}>{"👍 "}{review.votes_up}</span>
      </div>
    </div>
  );
}

export default function GameResult({ appid, lang }: Props) {
  const [game, setGame] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState("");
  const posRef = useRef<HTMLDivElement>(null);
  const negRef = useRef<HTMLDivElement>(null);
  const [posCount, setPosCount] = useState(3);
  const [negCount, setNegCount] = useState(3);

  useEffect(() => {
    setLoading(true);
    setGame(null);
    setSummary(null);
    setError("");
    setPosCount(3);
    setNegCount(3);

    fetch(`/api/game?appid=${appid}&lang=${lang}`)
      .then((r) => r.json())
      .then(async (data) => {
        if (data.error) { setError(data.error); return; }
        setGame(data);

        const allReviews = [...(data.positiveReviews || []), ...(data.negativeReviews || [])];
        if (allReviews.length > 0) {
          setSummarizing(true);
          fetch("/api/summarize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ appid, reviews: allReviews, lang }),
          })
            .then((r) => r.json())
            .then((s) => { if (!s.error) setSummary(s); })
            .finally(() => setSummarizing(false));
        }
      })
      .catch(() => setError("Failed to fetch"))
      .finally(() => setLoading(false));
  }, [appid, lang]);

  // 高さを比較して少ない方にレビューを追加（最大5件）
  useEffect(() => {
    if (!game) return;
    const timer = setTimeout(() => {
      const posH = posRef.current?.scrollHeight || 0;
      const negH = negRef.current?.scrollHeight || 0;
      const diff = Math.abs(posH - negH);
      if (diff > 120) {
        if (posH < negH && posCount < Math.min(5, game.positiveReviews.length)) {
          setPosCount((c) => Math.min(c + 1, Math.min(5, game.positiveReviews.length)));
        } else if (negH < posH && negCount < Math.min(5, game.negativeReviews.length)) {
          setNegCount((c) => Math.min(c + 1, Math.min(5, game.negativeReviews.length)));
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [game, posCount, negCount]);

  if (loading) return (
    <div style={{ textAlign: "center", padding: "4rem", color: "#00FF41" }}>
      <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚙️</div>
      <div>{lang === "ja" ? "データを取得中..." : "Fetching data..."}</div>
    </div>
  );

  if (error) return (
    <div style={{ textAlign: "center", padding: "4rem", color: "#ff4444" }}>
      {lang === "ja" ? "データの取得に失敗しました" : "Failed to fetch data"}
    </div>
  );

  if (!game) return null;

  const scoreColor = game.rating.score === null ? "#888"
    : game.rating.score >= 70 ? "#00FF41"
    : game.rating.score >= 40 ? "#ffaa00"
    : "#ff4444";

  const linkStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: "0.5rem",
    marginTop: "1rem", padding: "0.5rem 1.2rem", background: "#1b2838",
    color: "#fff", borderRadius: "4px", fontWeight: 700, fontSize: "0.85rem",
    textDecoration: "none", border: "1px solid #4c6b22", transition: "all 0.2s",
  };

  const SteamIcon = () => (
    <svg width="18" height="18" viewBox="0 0 233 233" fill="white" xmlns="http://www.w3.org/2000/svg">
      <path d="M116.5 0C52.1 0 0 52.1 0 116.5c0 55.6 38.9 102.1 91.1 113.7l-31.4-77.4c-5.3-1.2-10.2-3.8-14.2-7.8-9.8-9.8-11.4-24.8-4.8-36.4l.3-.5 38.6 15.9c.1-1 .3-1.9.5-2.9 3.9-15.3 19.5-24.5 34.8-20.6 15.3 3.9 24.5 19.5 20.6 34.8-.3 1.2-.7 2.3-1.2 3.4l38.1 15.7.3-.7c7.6-19.1-1.7-40.7-20.8-48.3-5.7-2.3-11.6-3-17.3-2.3l-38.6-96.3C116.4 7 116.5 3.5 116.5 0zm-6.9 145.5c-2 7.9-10.1 12.6-18 10.6l-8.9-2.3 12.8 31.5c5.9 2.1 12.5 2 18.4-.5 11.9-4.9 17.6-18.5 12.7-30.4-4.8-11.9-18.4-17.6-30.3-12.7l13.3 3.4c7.8 2 12.5 10 10.5 17.9l-10.5-17.5zm83.8-33.8c-10.9-27-42-40.1-69.1-29.3l15.2 38c7.4-1.3 15.2.5 21.5 5.6 10.6 8.4 13.1 23.7 6 35.1l26.7 10.9c16.4-17.7 17.5-45.3-.3-60.3z"/>
    </svg>
  );

  const positiveReviews = game.positiveReviews || [];
  const negativeReviews = game.negativeReviews || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* 基本情報 */}
      <div className="card" style={{ display: "flex", gap: "1.5rem" }}>
        {game.headerImage && (
          <img src={game.headerImage} alt={game.name} style={{ width: "260px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }} />
        )}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.5rem", color: "#fff" }}>{game.name}</h2>
          <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: "1rem", lineHeight: 1.6 }}>{game.description}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={{ background: "#111", borderRadius: "6px", padding: "0.75rem" }}>
              <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: "0.25rem" }}>
                {lang === "ja" ? "⭐ Steam評価" : "⭐ Rating"}
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: scoreColor }}>
                {game.rating.score !== null ? `${game.rating.score}%` : "N/A"}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#888", marginTop: "0.2rem" }}>{game.rating.summary}</div>
              <div style={{ fontSize: "0.7rem", color: "#666", marginTop: "0.2rem" }}>
                {"👍 "}{game.rating.positive.toLocaleString()}{" / 👎 "}{game.rating.negative.toLocaleString()}
              </div>
            </div>
            <div style={{ background: "#111", borderRadius: "6px", padding: "0.75rem" }}>
              <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: "0.25rem" }}>
                {lang === "ja" ? "💰 現在価格" : "💰 Price"}
              </div>
              <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#00FF41" }}>{game.price.current}</div>
              {game.price.discount > 0 && (
                <div style={{ fontSize: "0.7rem", color: "#888" }}>
                  <span style={{ textDecoration: "line-through" }}>{game.price.original}</span>
                  {" "}<span style={{ color: "#00FF41" }}>{"-"}{game.price.discount}{"%"}</span>
                </div>
              )}
            </div>
            <div style={{ background: "#111", borderRadius: "6px", padding: "0.75rem" }}>
              <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: "0.25rem" }}>
                {lang === "ja" ? "👥 総レビュー数" : "👥 Total Reviews"}
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>
                {game.rating.total.toLocaleString()}{lang === "ja" ? "件" : ""}
              </div>
            </div>
            <div style={{ background: "#111", borderRadius: "6px", padding: "0.75rem" }}>
              <div style={{ fontSize: "0.7rem", color: "#888", marginBottom: "0.25rem" }}>
                {lang === "ja" ? "👤 現在のプレイヤー数" : "👤 Current Players"}
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#fff" }}>
                {game.ccu > 0 ? game.ccu.toLocaleString() : "N/A"}
              </div>
            </div>
          </div>
          <a href={game.storeUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>
            <SteamIcon />
            {lang === "ja" ? "Steamストアで見る" : "View on Steam"}
          </a>
        </div>
      </div>

      {/* レビュー */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", alignItems: "start" }}>
        <div ref={posRef} className="card">
          <div style={{ fontWeight: 700, color: "#00FF41", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
            {lang === "ja" ? "👍 好評レビュー" : "👍 Positive Reviews"}
          </div>
          {positiveReviews.length === 0 ? (
            <div style={{ color: "#555", fontSize: "0.85rem" }}>
              {lang === "ja" ? "まだレビューがありません" : "No reviews yet"}
            </div>
          ) : (
            positiveReviews.slice(0, posCount).map((r: any, i: number) => (
              <ReviewCard key={i} review={r} lang={lang} />
            ))
          )}
        </div>

        <div ref={negRef} className="card">
          <div style={{ fontWeight: 700, color: "#ff4444", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
            {lang === "ja" ? "👎 不評レビュー" : "👎 Negative Reviews"}
          </div>
          {negativeReviews.length === 0 ? (
            <div style={{ color: "#555", fontSize: "0.85rem" }}>
              {lang === "ja" ? "まだレビューがありません" : "No reviews yet"}
            </div>
          ) : (
            negativeReviews.slice(0, negCount).map((r: any, i: number) => (
              <ReviewCard key={i} review={r} lang={lang} />
            ))
          )}
        </div>
      </div>

      {/* AI要約 */}
      <div className="card">
        <div style={{ fontWeight: 700, color: "#00FF41", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
          {lang === "ja" ? "🤖 AIによるレビュー要約" : "🤖 AI Review Summary"}
        </div>
        {summarizing ? (
          <div style={{ color: "#888", fontSize: "0.85rem" }}>
            {lang === "ja" ? "AIが分析中..." : "AI is analyzing..."}
          </div>
        ) : summary ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <div style={{ color: "#00FF41", fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.85rem" }}>
                {lang === "ja" ? "👍 好評ポイント" : "👍 What's Great"}
              </div>
              {summary.positive?.map((p: string, i: number) => (
                <div key={i} style={{ fontSize: "0.82rem", color: "#ccc", marginBottom: "0.4rem", paddingLeft: "0.5rem", borderLeft: "2px solid #00FF41" }}>
                  {p}
                </div>
              ))}
            </div>
            <div>
              <div style={{ color: "#ff4444", fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.85rem" }}>
                {lang === "ja" ? "👎 不評ポイント" : "👎 What's Not Great"}
              </div>
              {summary.negative?.map((p: string, i: number) => (
                <div key={i} style={{ fontSize: "0.82rem", color: "#ccc", marginBottom: "0.4rem", paddingLeft: "0.5rem", borderLeft: "2px solid #ff4444" }}>
                  {p}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ color: "#555", fontSize: "0.85rem" }}>
            {lang === "ja" ? "日本語レビューがないため要約できません" : "No English reviews to summarize"}
          </div>
        )}
      </div>

      {/* 広告枠 */}
      <div style={{
        border: "1px dashed #333", borderRadius: "8px", padding: "1rem",
        textAlign: "center", color: "#444", fontSize: "0.8rem",
      }}>
        AD SPACE
      </div>
    </div>
  );
}