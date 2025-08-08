
# おはようバク - 介護（健康管理・コミュニケーション）アプリ

<div align="center">
  <!-- <img src="docs/images/logo.png" alt="OhayouBaku Logo" width="300"> -->

  [![Laravel](https://img.shields.io/badge/Laravel-10.x-FF2D20.svg?style=flat-square&logo=laravel)](https://laravel.com)
  [![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?style=flat-square&logo=react)](https://reactjs.org)
  [![Docker](https://img.shields.io/badge/Docker-20.x-2496ED.svg?style=flat-square&logo=docker)](https://www.docker.com)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
</div>

## 📱 アプリケーション概要

「おはようバク」は、日々の健康管理とコミュニケーションを組み合わせた新しい形のヘルスケアアプリケーションです。金銭的に施設に預けることが難しい場合や、一人暮らしをしているご家族や大切な人が心配な方に、健康や安全を気軽に確認できるサポートを提供します。日々の生活の中で、遠くからでも健康状態や生活の様子を把握できる安心感を提供し、独立した生活を見守りたい方向けに開発したアプリです。

### 主な機能
- 💬 介護者・被介護者間のリアルタイムチャット
- 🌡️ バイタルデータの記録・管理（血圧、脈拍、SP02など）
- 📊 健康データの可視化（グラフ表示）
- 📅 共有カレンダー・ToDoリスト
- 📝 ユーザー間のコミュニケーション



## 🛠️ 技術スタック

### バックエンド
- Laravel 10.x
- PHP 8.2
- MySQL 8.0
- Laravel Sanctum
- Socket.IO（リアルタイムチャット）

### フロントエンド
- React 18.x
- Vite
- Socket.IO Client
- Styled Components
- Recharts（グラフ描画）

### インフラ
- Docker/Docker Compose
- Nginx

## 📚 ドキュメント

- [API仕様書](Documents/api_spec.md)
- [データベース設計書](Documents/db_schema.md)
- [アーキテクチャ設計書](Documents/architecture.md)
- [開発環境構築手順](Documents/setup.md)



## 🐟 ご利用の流れ

### ユーザー登録
  - お名前、メールアドレス、パスワードを入力
  - 介護者の場合はチェックボックスにチェックをいれる
<div align="center">
  <img src="Documents\img\Ohayoubaku_signup.png" alt="チャットデモ" width="800">
</div>

### パートナー認証
  - チャット画面から介護者・被介護者間でお互いのメールアドレスを入力して認証
  - 認証が完了すると「パートナー」として登録される
<div align="center">
  <img src="Documents\img\Ohayoubaku_partner.png" alt="チャットデモ" width="800">
</div>

- **情報共有**
  - チャット
  - バイタル情報（体温、血圧など）
  - カレンダー
  - TODOリスト
  - 上記はパートナー間でのみ共有（アクセス権付与）

### 未認証の場合
  - バイタル情報、カレンダー・TODOリスト画面で以下の内容が表示される
<div align="center">
  <img src="Documents\img\Ohayobaku_unverified.png" alt="チャットデモ" width="800">
</div>

## 🌟 主要機能のデモ

### リアルタイムチャット
<div align="center">
  <img src="Documents\img\Ohayoubaku_chat.png" alt="チャットデモ" width="800">
</div>

### バイタルデータ管理
<div align="center">
  <img src="Documents\img\Ohayobaku_vitals1.png" alt="バイタルデータ管理デモ" width="800">
  <img src="Documents\img\Ohayobaku_vitals2.png" alt="バイタルデータ管理デモ" width="800">
</div>

### カレンダー・TODOリスト
<div align="center">
  <img src="Documents\img\Ohayoubaku_calender1.png" alt="カレンダー・TODOリストデモ" width="800">
  <img src="Documents\img\Ohayobaku_calender2.png" alt="カレンダー・TODOリストデモ" width="800">
</div>

## 💡 工夫した点

1. **リアルタイム通信の実装**
   - Socket.IOを使用したチャット機能の実装
   - メッセージの即時配信と既読管理

2. **データの可視化**
   - Rechartsを活用した直感的なグラフ表示
   - 健康データのトレンド分析機能

3. **パートナー認証とアクセス権管理**
   - 双方のメールアドレス入力によるパートナー認証フローを実装
   - パートナー間のみでチャット・健康データ・カレンダー・TODOを共有
   - 認証状態に応じたアクセス制御を実装（未認証ユーザーは他人のデータにアクセス不可）

## 🔧 今後の展望

- [ ] 健康データの分析AIの導入
- [ ] 日記の感情分析AIの導入
- [ ] PWA対応
- [ ] グループチャット機能の追加
- [ ] 多言語対応
