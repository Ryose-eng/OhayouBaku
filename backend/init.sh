#!/bin/bash
cd /var/www/html

# PHPを使用してLaravelのログに書き込む
php -r "require 'vendor/autoload.php'; \Log::info('=== Init Script Started ===');"

# マイグレーション前のログ
php -r "require 'vendor/autoload.php'; \Log::info('Starting database migration...');"
php artisan migrate --force

# マイグレーション後のログ
php -r "require 'vendor/autoload.php'; \Log::info('Migration completed. Starting server...');"
php artisan serve --host=0.0.0.0 --port=$PORT

php -r "require 'vendor/autoload.php'; \Log::info('Server started on port ' . getenv('PORT'));" 