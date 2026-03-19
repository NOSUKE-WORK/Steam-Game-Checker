import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Steam Game Checker | Steamゲーム買う前にチェック！",
  description: "Steamゲームの評価・価格・レビューをリアルタイムで分析。AIがレビューを要約して、あなたのゲーム選びをサポート。",
  keywords: "Steam,ゲーム,レビュー,評価,セール,ゲーム検索",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Steam Game Checker",
    description: "Steamゲームの評価・価格・レビューをリアルタイム分析",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}