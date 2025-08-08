## 🚀 開発環境のセットアップ

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/OhayouBaku.git
cd OhayouBaku

# Dockerコンテナの起動
docker-compose up -d

# バックエンド（Laravel）のセットアップ
docker-compose exec ohayoubaku-app composer install
docker-compose exec ohayoubaku-app php artisan key:generate
docker-compose exec ohayoubaku-app php artisan migrate

# フロントエンド（React）のセットアップ
docker-compose exec ohayoubaku-node npm install
docker-compose exec ohayoubaku-node npm run dev
