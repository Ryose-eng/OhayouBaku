#!/bin/bash
set -e

echo "Starting application..."
cd /var/www/html

# マイグレーションを実行
echo "Running migrations..."
php artisan migrate --force

# サーバーを起動
echo "Starting server..."
php artisan serve --host=0.0.0.0 --port=${PORT} 