# 🎮 Steam Game Checker

> 5 Minutes Before You Buy. No Regrets.

A web service that lets you check Steam game reviews, ratings, and prices in real time.

## 🔍 Use Cases

- Looking up game title information for work
- Checking reviews before an impulse buy
- Getting a quick AI summary of Japanese reviews

## ✨ Features

- **Game Search** - Search by title and view detailed Steam information
- **Ratings & Prices** - Real-time Steam score, current price, and sale info
- **Current Player Count** - See how many people are playing right now
- **Japanese Reviews** - Displays positive and negative reviews sorted by helpfulness
- **AI Review Summary** - Groq AI automatically summarizes Japanese reviews
- **Search Ranking** - Shows the most searched titles by all users
- **Active Players Ranking** - Games with the most players right now
- **Games on Sale** - Currently discounted titles at a glance
- **Steam Top Sellers** - What's selling right now on Steam
- **JP / EN Toggle** - Switch the interface language with one click

## 🛠 Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **AI Summarization**: Groq API (llama-3.1-8b-instant)
- **Game Data**: Steam Web API
- **Ranking Persistence**: Upstash Redis
- **Deployment**: Vercel

## 🚀 Usage

Just visit **https://steam-game-checker.vercel.app/** — no installation required.

## 🔧 Local Development
```bash
git clone https://github.com/NOSUKE-WORK/steam-game-checker.git
cd steam-game-checker
npm install
```

Create a `.env.local` file with the following:
```
STEAM_API_KEY=your_steam_api_key
GROQ_API_KEY=your_groq_api_key
ITAD_API_KEY=your_itad_api_key
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token
```
```bash
npm run dev
```

## 📝 Disclaimer

This product uses the Steam® API but is not endorsed, certified or otherwise approved by Valve Corporation.

---

# 🎮 Steam Game Checker（日本語）

> ポチる前の5分が、後悔を防ぐ。

Steamゲームの評価・価格・レビューをリアルタイムで確認できるWebサービスです。

## 🔍 こんなときに使えます

- 業務でゲームタイトルの情報を調べたいとき
- 衝動買いする前にレビューをざっくり確認したいとき
- 日本語レビューをAIで要約してサクッと把握したいとき

## ✨ 機能

- **ゲーム検索** - タイトル名で検索してSteamの詳細情報を表示
- **Steam評価・価格表示** - 評価スコア・現在価格・セール情報をリアルタイム取得
- **現在のプレイヤー数** - 今何人がプレイしているか確認
- **日本語レビュー表示** - 参考になった順に好評・不評レビューを表示
- **AIによるレビュー要約** - Groq AIが日本語レビューを自動で要約
- **検索ランキング** - ユーザーが多く検索したタイトルをランキング表示
- **アクティブユーザーランキング** - 今プレイヤーが多いゲームを表示
- **セール中タイトル** - 現在セール中のゲームを一覧表示
- **Steam売上トップ** - 今売れているゲームを表示
- **日本語/英語切替** - JP/ENボタンでインターフェース切替

## 🛠 技術スタック

- **フレームワーク**: Next.js (App Router)
- **スタイリング**: Tailwind CSS
- **AI要約**: Groq API (llama-3.1-8b-instant)
- **ゲームデータ**: Steam Web API
- **ランキング永続化**: Upstash Redis
- **デプロイ**: Vercel

## 🚀 使い方

**https://steam-game-checker.vercel.app/** にアクセスするだけ。インストール不要。

## 🔧 ローカル開発
```bash
git clone https://github.com/NOSUKE-WORK/steam-game-checker.git
cd steam-game-checker
npm install
```

`.env.local` を作成して以下を設定：
```
STEAM_API_KEY=your_steam_api_key
GROQ_API_KEY=your_groq_api_key
ITAD_API_KEY=your_itad_api_key
KV_REST_API_URL=your_upstash_redis_url
KV_REST_API_TOKEN=your_upstash_redis_token
```
```bash
npm run dev
```

## 📝 注意事項

This product uses the Steam® API but is not endorsed, certified or otherwise approved by Valve Corporation.
```

作成したらデプロイしてください：
```
git add .
git commit -m "update README with Japanese section"
git push
