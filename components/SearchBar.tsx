"use client";

import { useState, useEffect, useRef } from "react";

type Result = { appid: number; name: string; icon: string };

type Props = {
  lang: "ja" | "en";
  onSelect: (appid: number, name: string) => void;
};

export default function SearchBar({ lang, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); setOpen(false); return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [query]);

  const handleSelect = (appid: number, name: string) => {
    onSelect(appid, name);
    setQuery(name);
    setOpen(false);
  };

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lang === "ja" ? "ゲームタイトルを入力してください" : "Enter a game title..."}
          style={{
            width: "100%",
            padding: "1.2rem 1.5rem 1.2rem 3.5rem",
            fontSize: "1.1rem",
            background: "#1a1a1a",
            border: "2px solid #00FF41",
            borderRadius: "8px",
            color: "#fff",
            outline: "none",
            boxShadow: "0 0 20px rgba(0,255,65,0.2)",
          }}
        />
        <span style={{
          position: "absolute", left: "1.1rem", top: "50%", transform: "translateY(-50%)",
          fontSize: "1.3rem",
        }}>🔍</span>
        {loading && (
          <span style={{
            position: "absolute", right: "1.1rem", top: "50%", transform: "translateY(-50%)",
            color: "#00FF41", fontSize: "0.85rem",
          }}>
            {lang === "ja" ? "検索中..." : "Searching..."}
          </span>
        )}
      </div>

      {open && results.length > 0 && (
        <ul style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
          background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px",
          listStyle: "none", zIndex: 200, maxHeight: "320px", overflowY: "auto",
          boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
        }}>
          {results.map((r) => (
            <li
              key={r.appid}
              onClick={() => handleSelect(r.appid, r.name)}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.75rem 1rem", cursor: "pointer",
                borderBottom: "1px solid #222", transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#252525")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {r.icon && <img src={r.icon} alt="" width={32} height={32} style={{ borderRadius: "4px" }} />}
              <span style={{ color: "#fff", fontSize: "0.95rem" }}>{r.name}</span>
            </li>
          ))}
        </ul>
      )}

      {open && results.length === 0 && !loading && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
          background: "#1a1a1a", border: "1px solid #2a2a2a", borderRadius: "8px",
          padding: "1rem", color: "#888", textAlign: "center", zIndex: 200,
        }}>
          {lang === "ja" ? "見つかりませんでした" : "No results found"}
        </div>
      )}
    </div>
  );
}