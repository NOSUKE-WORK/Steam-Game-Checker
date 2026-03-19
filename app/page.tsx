"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import GameResult from "@/components/GameResult";

type Game = { appid: number; name: string; icon: string };
type RankingItem = { name: string; appid: number; icon?: string; count: number };
type ActivePlayer = { appid: number; name: string; icon: string; ccu: number };
type SaleItem = { appid: number; name: string; icon: string; discount: number; price: string; originalPrice: string };

function GameRow({ rank, name, icon, right, onClick }: {
  rank: number; name: string; icon: string; right?: React.ReactNode; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "0.75rem",
        padding: "0.5rem", borderRadius: "6px", border: "1px solid #222",
        background: "#111", cursor: "pointer", transition: "border-color 0.2s, transform 0.15s",
        height: "56px", boxSizing: "border-box",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#00FF41"; e.currentTarget.style.transform = "scale(1.01)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.transform = "scale(1)"; }}
    >
      <span style={{ color: "#00FF41", fontWeight: 800, fontSize: "0.9rem", width: "24px", flexShrink: 0, textAlign: "center" }}>{rank}</span>
      {icon && (
        <img
          src={icon}
          alt={name}
          style={{ width: "80px", height: "37px", objectFit: "cover", borderRadius: "3px", flexShrink: 0 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.82rem", color: "#fff", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {name}
        </div>
        {right}
      </div>
    </div>
  );
}

function SidebarRow({ rank, name, icon, onClick }: {
  rank: number; name: string; icon?: string; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "0.6rem",
        padding: "0.4rem 0.5rem", borderRadius: "6px", border: "1px solid #222",
        background: "#111", cursor: "pointer", transition: "border-color 0.2s",
        height: "56px", boxSizing: "border-box",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#00FF41")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#222")}
    >
      <span style={{ color: "#00FF41", fontWeight: 800, fontSize: "0.85rem", width: "20px", flexShrink: 0, textAlign: "center" }}>{rank}</span>
      {icon && (
        <img
          src={icon}
          alt={name}
          style={{ width: "70px", height: "37px", objectFit: "cover", borderRadius: "3px", flexShrink: 0 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      )}
      <span style={{ fontSize: "0.75rem", color: "#ccc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {name}
      </span>
    </div>
  );
}

function ActivePlayersList({ lang, onSelect }: { lang: "ja" | "en"; onSelect: (appid: number, name: string) => void }) {
  const [activePlayers, setActivePlayers] = useState<ActivePlayer[]>([]);
  useEffect(() => {
    fetch("/api/activeplayers").then((r) => r.json()).then((d) => setActivePlayers(Array.isArray(d) ? d : []));
  }, []);

  if (activePlayers.length === 0) return <div style={{ color: "#555", fontSize: "0.8rem" }}>{lang === "ja" ? "読み込み中..." : "Loading..."}</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      {activePlayers.map((game, i) => (
        <GameRow
          key={game.appid} rank={i + 1} name={game.name} icon={game.icon}
          onClick={() => onSelect(game.appid, game.name)}
          right={<div style={{ fontSize: "0.72rem", color: "#00FF41", marginTop: "0.1rem" }}>👥 {game.ccu.toLocaleString()} {lang === "ja" ? "人" : "players"}</div>}
        />
      ))}
    </div>
  );
}

function SalesList({ lang, onSelect }: { lang: "ja" | "en"; onSelect: (appid: number, name: string) => void }) {
  const [sales, setSales] = useState<SaleItem[]>([]);
  useEffect(() => {
    fetch("/api/sales").then((r) => r.json()).then((d) => setSales(Array.isArray(d) ? d : []));
  }, []);

  if (sales.length === 0) return <div style={{ color: "#555", fontSize: "0.8rem" }}>{lang === "ja" ? "読み込み中..." : "Loading..."}</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      {sales.map((game, i) => (
        <GameRow
          key={game.appid} rank={i + 1} name={game.name} icon={game.icon}
          onClick={() => onSelect(game.appid, game.name)}
          right={
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.1rem" }}>
              <span style={{ background: "#00FF41", color: "#000", fontWeight: 800, fontSize: "0.65rem", padding: "1px 4px", borderRadius: "3px" }}>-{game.discount}%</span>
              <span style={{ fontSize: "0.72rem", color: "#00FF41" }}>{game.price}</span>
              <span style={{ fontSize: "0.65rem", color: "#555", textDecoration: "line-through" }}>{game.originalPrice}</span>
            </div>
          }
        />
      ))}
    </div>
  );
}

const LogoSvg = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="12" fill="#0a0a0a"/>
    <rect x="1" y="1" width="62" height="62" rx="11" stroke="#00FF41" strokeWidth="1.5" fill="none"/>
    <rect x="10" y="22" width="44" height="24" rx="12" fill="none" stroke="#00FF41" strokeWidth="2"/>
    <circle cx="22" cy="35" r="5" fill="none" stroke="#00FF41" strokeWidth="1.8"/>
    <line x1="22" y1="25" x2="22" y2="29" stroke="#00FF41" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="44" cy="30" r="2.5" fill="#00FF41"/>
    <circle cx="38" cy="35" r="2.5" fill="#00FF41" fillOpacity="0.5"/>
    <circle cx="44" cy="40" r="2.5" fill="#00FF41" fillOpacity="0.3"/>
    <rect x="29" y="38" width="3" height="5" rx="1" fill="#00FF41"/>
    <rect x="33" y="34" width="3" height="9" rx="1" fill="#00FF41" fillOpacity="0.7"/>
    <rect x="27" y="27" width="5" height="2.5" rx="1.2" fill="#00FF41" fillOpacity="0.4"/>
    <rect x="33" y="27" width="5" height="2.5" rx="1.2" fill="#00FF41" fillOpacity="0.4"/>
  </svg>
);

const SectionTitle = ({ text }: { text: string }) => (
  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#00FF41", marginBottom: "0.5rem", letterSpacing: "0.1em", borderBottom: "1px solid #1a1a1a", paddingBottom: "0.5rem" }}>
    {text}
  </div>
);

export default function Home() {
  const [lang, setLang] = useState<"ja" | "en">("ja");
  const [selectedAppid, setSelectedAppid] = useState<number | null>(null);
  const [trending, setTrending] = useState<Game[]>([]);
  const [searchRanking, setSearchRanking] = useState<RankingItem[]>([]);

  useEffect(() => {
    fetch("/api/trending").then((r) => r.json()).then((data) => setTrending(Array.isArray(data) ? data : []));
    fetch("/api/ranking").then((r) => r.json()).then((data) => setSearchRanking(Array.isArray(data) ? data : []));
  }, []);

  const handleSelect = (appid: number, name: string) => {
    setSelectedAppid(appid);

    // ゲームデータ取得してアイコンも一緒にランキングに保存
    fetch(`/api/game?appid=${appid}&lang=${lang}`)
      .then((r) => r.json())
      .then((data) => {
        const icon = data.headerImage || "";
        // サーバーサイドランキングに記録
        fetch("/api/ranking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appid, name, icon }),
        }).then(() => {
          // ランキング再取得
          fetch("/api/ranking").then((r) => r.json()).then((d) => setSearchRanking(Array.isArray(d) ? d : []));
        });
      });
  };

  const handleLogoClick = () => setSelectedAppid(null);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", flexDirection: "column" }}>
      <Header lang={lang} onLangChange={setLang} onLogoClick={handleLogoClick} />

      {!selectedAppid && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2.5rem 2rem 2rem", gap: "1.2rem" }}>
          <LogoSvg size={80} />
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "2.2rem", fontWeight: 900, color: "#00FF41", textShadow: "0 0 20px #00FF41", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>
              STEAM GAME CHECKER
            </h1>
            <p style={{ color: "#888", fontSize: "0.95rem" }}>
              {lang === "ja" ? "ポチる前の5分が、後悔を防ぐ。" : "5 Minutes Before You Buy. No Regrets."}
            </p>
          </div>

          <SearchBar lang={lang} onSelect={handleSelect} />

          <div style={{ width: "100%", maxWidth: "1400px", display: "grid", gridTemplateColumns: "280px 1fr 1fr 280px", gap: "1rem", marginTop: "0.5rem", alignItems: "start" }}>
            <div className="card" style={{ padding: "1rem" }}>
              <SectionTitle text={`🔥 ${lang === "ja" ? "検索ランキング" : "Search Ranking"}`} />
              {searchRanking.length === 0 ? (
                <div style={{ color: "#555", fontSize: "0.8rem" }}>{lang === "ja" ? "まだデータがありません" : "No data yet"}</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {searchRanking.map((game, i) => (
                    <SidebarRow key={game.appid} rank={i + 1} name={game.name} icon={game.icon} onClick={() => handleSelect(game.appid, game.name)} />
                  ))}
                </div>
              )}
            </div>

            <div className="card" style={{ padding: "1rem" }}>
              <SectionTitle text={`👥 ${lang === "ja" ? "アクティブユーザーランキング" : "Active Players"}`} />
              <ActivePlayersList lang={lang} onSelect={handleSelect} />
            </div>

            <div className="card" style={{ padding: "1rem" }}>
              <SectionTitle text={`🔥 ${lang === "ja" ? "セール中タイトル" : "Games on Sale"}`} />
              <SalesList lang={lang} onSelect={handleSelect} />
            </div>

            <div className="card" style={{ padding: "1rem" }}>
              <SectionTitle text={`📈 ${lang === "ja" ? "Steam売上トップ" : "Steam Top Sellers"}`} />
              {trending.length === 0 ? (
                <div style={{ color: "#555", fontSize: "0.8rem" }}>{lang === "ja" ? "読み込み中..." : "Loading..."}</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {trending.map((game, i) => (
                    <SidebarRow key={game.appid} rank={i + 1} name={game.name} icon={game.icon} onClick={() => handleSelect(game.appid, game.name)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedAppid && (
        <div style={{ display: "flex", gap: "1.5rem", padding: "1.5rem 2rem", maxWidth: "1400px", margin: "0 auto", width: "100%", flex: 1 }}>
          <div className="card" style={{ width: "240px", flexShrink: 0, padding: "1rem", alignSelf: "start" }}>
            <SectionTitle text={`🔥 ${lang === "ja" ? "検索ランキング" : "Search Ranking"}`} />
            {searchRanking.length === 0 ? (
              <div style={{ color: "#555", fontSize: "0.8rem" }}>{lang === "ja" ? "まだデータがありません" : "No data yet"}</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {searchRanking.map((game, i) => (
                  <SidebarRow key={game.appid} rank={i + 1} name={game.name} icon={game.icon} onClick={() => handleSelect(game.appid, game.name)} />
                ))}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <SearchBar lang={lang} onSelect={handleSelect} />
            <div style={{ marginTop: "1.5rem" }}>
              <GameResult appid={selectedAppid} lang={lang} />
            </div>
          </div>

          <div className="card" style={{ width: "240px", flexShrink: 0, padding: "1rem", alignSelf: "start" }}>
            <SectionTitle text={`📈 ${lang === "ja" ? "Steam売上トップ" : "Steam Top Sellers"}`} />
            {trending.length === 0 ? (
              <div style={{ color: "#555", fontSize: "0.8rem" }}>{lang === "ja" ? "読み込み中..." : "Loading..."}</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {trending.map((game, i) => (
                  <SidebarRow key={game.appid} rank={i + 1} name={game.name} icon={game.icon} onClick={() => handleSelect(game.appid, game.name)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <footer style={{ borderTop: "1px solid #1a1a1a", padding: "1.5rem 2rem", textAlign: "center", color: "#444", fontSize: "0.75rem", lineHeight: 1.8 }}>
        <div>© 2025 Steam Game Checker</div>
        <div style={{ marginTop: "0.25rem", color: "#333" }}>
          Powered by Steam. This product uses the Steam® API but is not endorsed, certified or otherwise approved by Valve.
        </div>
      </footer>
    </div>
  );
}