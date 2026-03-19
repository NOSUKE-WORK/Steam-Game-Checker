"use client";

type Props = {
  lang: "ja" | "en";
  onLangChange: (lang: "ja" | "en") => void;
  onLogoClick: () => void;
};

export default function Header({ lang, onLangChange, onLogoClick }: Props) {
  return (
    <header style={{
      background: "#0d0d0d",
      borderBottom: "1px solid #1a1a1a",
      padding: "0.75rem 2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div
        onClick={onLogoClick}
        style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="8" fill="#0a0a0a" stroke="#00FF41" strokeWidth="1.2"/>
          {/* コントローラー本体 */}
          <rect x="7" y="14" width="26" height="15" rx="7" fill="none" stroke="#00FF41" strokeWidth="1.4"/>
          {/* 左スティック */}
          <circle cx="14" cy="22" r="3" fill="none" stroke="#00FF41" strokeWidth="1.2"/>
          {/* 十字キー */}
          <line x1="14" y1="16" x2="14" y2="19" stroke="#00FF41" strokeWidth="1.2" strokeLinecap="round"/>
          {/* ABXYボタン */}
          <circle cx="27" cy="19" r="1.2" fill="#00FF41"/>
          <circle cx="24" cy="22" r="1.2" fill="#00FF41" fillOpacity="0.5"/>
          <circle cx="27" cy="25" r="1.2" fill="#00FF41" fillOpacity="0.3"/>
          {/* データバー（グラフ） */}
          <rect x="18" y="24" width="2" height="3" rx="0.5" fill="#00FF41"/>
          <rect x="21" y="22" width="2" height="5" rx="0.5" fill="#00FF41" fillOpacity="0.7"/>
          {/* SELECT/STARTボタン */}
          <rect x="17" y="17" width="3" height="1.5" rx="0.7" fill="#00FF41" fillOpacity="0.5"/>
          <rect x="21" y="17" width="3" height="1.5" rx="0.7" fill="#00FF41" fillOpacity="0.5"/>
          {/* グロー効果 */}
          <rect width="40" height="40" rx="8" fill="none" stroke="#00FF41" strokeWidth="0.5" opacity="0.3"/>
        </svg>
        <div>
          <div style={{
            fontSize: "1.1rem",
            fontWeight: 800,
            color: "#00FF41",
            letterSpacing: "0.05em",
            textShadow: "0 0 10px #00FF41",
          }}>
            STEAM GAME CHECKER
          </div>
          <div style={{ fontSize: "0.65rem", color: "#888", letterSpacing: "0.1em" }}>
            {lang === "ja" ? "ポチる前の5分が、後悔を防ぐ" : "CHECK BEFORE YOU BUY"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        {(["ja", "en"] as const).map((l) => (
          <button
            key={l}
            onClick={() => onLangChange(l)}
            style={{
              padding: "0.3rem 0.8rem",
              borderRadius: "4px",
              border: `1px solid ${lang === l ? "#00FF41" : "#333"}`,
              background: lang === l ? "#00FF41" : "transparent",
              color: lang === l ? "#000" : "#888",
              fontWeight: lang === l ? 700 : 400,
              cursor: "pointer",
              fontSize: "0.8rem",
              transition: "all 0.2s",
            }}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </header>
  );
}