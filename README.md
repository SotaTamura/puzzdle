# rails-react-template

Ruby on Rails (API mode) + React Router v7 のWebアプリテンプレート。

Wordle風ミニゲームをサンプルとして含む。

## 構成

- `backend/` — Rails API サーバー (API mode, ActiveRecord, PostgreSQL)
- `frontend/` — React Router v7 (framework mode, SSR, Tailwind CSS, daisyUI)

## 開発

### 環境構築

以下のいずれかの方法でツールをインストール。

**Nix** — すべてのツールが `flake.nix` で提供される。

```bash
direnv allow
# もしくは: nix develop
```

**mise** — `.mise.toml` の `[tools]` のコメントを戻してからインストール。

```bash
mise install
```

**手動** — 以下を個別にインストール。

- [Docker](https://docs.docker.com/get-docker/) (PostgreSQL コンテナ用)
- [Ruby](https://www.ruby-lang.org/) (4.0+)
- [Bun](https://bun.sh/) (1.3+)

### 起動

```bash
# 依存インストール
cd backend && bundle install && cd ..
cd frontend && bun install && cd ..

# 初回セットアップ: DB 起動 + マイグレーション + シードデータ
mise run db-setup

# 開発サーバー起動 (DB + Backend + Frontend)
mise run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8080

### mise タスク

`.mise.toml` にタスクが定義されている。`mise run <タスク名>` で実行。

```bash
mise run lint       # Standard Ruby + Biome
mise run format     # Standard Ruby --fix + Biome
```

### 環境変数

| 変数 | 説明 | デフォルト |
|------|------|-----------|
| `DATABASE_URL` | PostgreSQL 接続文字列 | `postgres://postgres:postgres@localhost:5432/wordle` |
| `PORT` | Backend リッスンポート | `8080` |
| `API_URL` | Backend URL (SSR サーバーから) | `http://localhost:8080` |
| `VITE_API_URL` | Backend URL (ブラウザから、ビルド時に埋め込み) | `http://localhost:8080` |

### Docker Compose (動作確認用)

[Docker](https://docs.docker.com/get-docker/) のみで動く。ホットリロードは対応していない。

```bash
docker compose up
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8080

## デプロイ (Coolify)

### Docker Compose

`docker-compose.yaml` にはポートマッピングを含めていない（Coolify/Traefik が管理するため）。ローカルでは `docker-compose.override.yaml` が自動で読み込まれ、ポートが公開される。

1. Coolifyで新規プロジェクト作成 → **Docker Compose** を選択
2. GitHubリポジトリ接続
3. Compose ファイルに `docker-compose.yaml` を指定
4. 各サービスのポートとドメインを Coolify の UI で設定
5. 環境変数で `VITE_API_URL` を本番の Backend URL に設定
6. デプロイ

### 個別サービス

Backend, Frontend, DB をそれぞれ別サービスとして追加。個別にスケール・再デプロイ可能。

**Backend**

1. GitHubリポジトリ接続、Base Directory を `backend` に設定
2. ビルドパック: **Dockerfile**
3. ポート: `8080`
4. 環境変数に `DATABASE_URL` を設定

**Frontend**

1. GitHubリポジトリ接続、Base Directory を `frontend` に設定
2. ビルドパック: **Dockerfile**
3. ポート: `3000`
4. 環境変数に `VITE_API_URL` を設定（バックエンドのURL）

**DB**

CoolifyのUIから PostgreSQL をワンクリックで追加可能。

## このテンプレートの再現手順

このリポジトリを作成した際のコマンド。テンプレートとして使う場合はこのセクションは不要。

```bash
# backend
mkdir -p backend && cd backend
# Rails API app を手動で構築
bundle init
# Gemfile に rails, pg, puma, rack-cors を追加
bundle install
bundle exec rails new . --api --database=postgresql --skip-git --minimal

# frontend
cd ..
bunx create-react-router frontend
cd frontend
bun add -d @biomejs/biome tailwindcss @tailwindcss/vite daisyui
```

## 参考

- [Ruby on Rails](https://rubyonrails.org/)
- [React Router](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [daisyUI](https://daisyui.com/)
- [Biome](https://biomejs.dev/)
- [Coolify](https://coolify.io/docs/)
