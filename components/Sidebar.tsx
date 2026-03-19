"use client";

type Game = { appid: number; name: string; icon: string };

type Props = {
  lang: "ja" | "en";
  type: "search" | "trending";
  searchRanking?: { name: string; appid: number; icon?: string; count?: number }[];
  trending?: Game[];
  onSelect: (appid: number, name: string) => void;
};

function GameCard({ appid, name, rank, onSelect }: {
  appid: number;
  name: string;
  rank: number;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      style={{
        cursor: "pointer",
        borderRadius: "6px",
        overflow: "hidden",
        border: "1px solid #222",
        transition: "border-color 0.2s, transform 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#00FF41";
        e.currentTarget.style.transform = "scale(1.02)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#222";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <div style={{ position: "relative", height: "100px", background: "#111", overflow: "hidden" }}>
        <img
          src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`}
          alt={name}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            if (!img.dataset.fallback) {
              img.dataset.fallback = "1";
              img.src = `https://steamcdn-a.akamaihd.net/steam/apps/${appid}/header.jpg`;
            }
          }}
        />
        <div style={{
          position: "absolute",
          top: "6px",
          left: "6px",
          background: "rgba(0,0,0,0.85)",
          border: "1px solid #00FF41",
          color: "#00FF41",
          fontWeight: 800,
          fontSize: "0.85rem",
          borderRadius: "4px",
          padding: "1px 7px",
          lineHeight: 1.6,
        }}>
          {rank}
        </div>
      </div>
      <div style={{
        padding: "0.4rem 0.6rem",
        background: "#111",
        fontSize: "0.78rem",
        color: "#ccc",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {name}
      </div>
    </div>
  );
}

export default function Sidebar({ lang, type, searchRanking = [], trending = [], onSelect }: Props) {
  const titleStyle = {
    fontSize: "0.8rem",
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: "#00FF41",
    marginBottom: "1rem",
    borderBottom: "1px solid #1a1a1a",
    paddingBottom: "0.6rem",
  };

  const games = type === "search"
    ? searchRanking.map((g) => ({ appid: g.appid, name: g.name }))
    : trending.map((g) => ({ appid: g.appid, name: g.name }));

  const isEmpty = games.length === 0;

  return (
    <div style={{ width: "240px", flexShrink: 0 }}>
      <div className="card" style={{ padding: "1rem" }}>
        <div style={titleStyle}>
          {type === "search"
            ? `🔥 ${lang === "ja" ? "検索ランキング" : "Search Ranking"}`
            : `📈 ${lang === "ja" ? "Steam売上トップ" : "Steam Top Sellers"}`
          }
        </div>

        {isEmpty ? (
          <div style={{ color: "#555", fontSize: "0.8rem", textAlign: "center", padding: "1rem 0" }}>
            {type === "search"
              ? (lang === "ja" ? "まだデータがありません" : "No data yet")
              : (lang === "ja" ? "読み込み中..." : "Loading...")}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {games.map((game, i) => (
              <GameCard
                key={game.appid}
                appid={game.appid}
                name={game.name}
                rank={i + 1}
                onSelect={() => onSelect(game.appid, game.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}