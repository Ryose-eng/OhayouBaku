# アーキテクチャ設計書

## システム構成

### 開発環境
- Docker/Docker Compose による仮想化環境
- マルチコンテナ構成
  - PHP (Laravel) コンテナ
  - MySQL コンテナ
  - Nginx コンテナ
  - Node.js コンテナ

### コンテナ構成詳細
| コンテナ名 | ベースイメージ | 役割 | ポート |
|------------|----------------|------|--------|
| ohayoubaku-app | php:8.2.13-fpm | バックエンドアプリケーション | 9000 |
| ohayoubaku-web | nginx:1.24.0-alpine | Webサーバー | 80 |
| ohayoubaku-db | mysql:8.0.32 | データベース | 3306 |
| ohayoubaku-node | node:20.11.0-alpine | フロントエンド開発環境 | 5173 |

## ディレクトリ構成

```
OhayouBaku/
├── backend/ # Laravel アプリケーション
│ ├── app/
│ │ ├── Http/
│ │ │ ├── Controllers/ # APIコントローラー
│ │ │ └── Middleware/ # ミドルウェア
│ │ └── Models/ # Eloquentモデル
│ ├── database/
│ │ └── migrations/ # DBマイグレーション
│ └── routes/
│ └── api.php # APIルート定義
├── frontend/ # React アプリケーション
│ ├── src/
│ │ ├── components/ # Reactコンポーネント
│ │ ├── pages/ # ページコンポーネント
│ │ └── hooks/ # カスタムフック
│ └── vite.config.js # Vite設定（WebSocket含む）
├── docker/ # Docker設定ファイル
│ ├── nginx/
│ ├── php/
│ └── node/
└── Documents/ # ドキュメント
```

## 主要パッケージ/ライブラリ

### バックエンド (Laravel)
- PHP 8.2
- Laravel Framework
- Laravel Sanctum (API認証)

### フロントエンド (React)
| パッケージ名 | バージョン | 用途 |
|-------------|------------|------|
| react | ^18.2.0 | UIライブラリ |
| react-router-dom | ^7.4.1 | ルーティング |
| socket.io-client | ^4.8.1 | リアルタイム通信 |
| recharts | ^2.15.2 | グラフ描画 |
| styled-components | ^6.1.16 | スタイリング |

## 通信アーキテクチャ

### REST API
- Laravel による RESTful API の提供
- Sanctum による API 認証
- JSON形式でのデータ通信

### WebSocket
- Socket.IO によるリアルタイム通信
- チャット機能での双方向通信
- Vite dev server 統合

## セキュリティ設計

### 認証
- トークンベース認証 (Sanctum)
- セッション管理
- CORS設定

### データベース
- マイグレーションによるバージョン管理
- リレーション整合性の確保
- 外部キー制約の活用
