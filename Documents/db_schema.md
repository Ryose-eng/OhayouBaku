# Database Schema

## users
ユーザー情報を管理するテーブル

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint | PRIMARY KEY | ユーザーID |
| name | string | NOT NULL | ユーザー名 |
| email | string | UNIQUE, NOT NULL | メールアドレス |
| email_verified_at | timestamp | NULLABLE | メール認証日時 |
| password | string | NOT NULL | パスワード（ハッシュ化） |
| remember_token | string | NULLABLE | ログイン保持トークン |
| created_at | timestamp | NOT NULL | 作成日時 |
| updated_at | timestamp | NOT NULL | 更新日時 |

## posts
ユーザーの投稿を管理するテーブル

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint | PRIMARY KEY | 投稿ID |
| user_id | bigint | FOREIGN KEY, CASCADE | 投稿者のユーザーID |
| body | text | NOT NULL | 投稿内容 |
| created_at | timestamp | NOT NULL | 作成日時 |
| updated_at | timestamp | NOT NULL | 更新日時 |

## chats
ユーザー間のチャットルームを管理するテーブル

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint | PRIMARY KEY | チャットID |
| user1_id | bigint | FOREIGN KEY, CASCADE | ユーザー1のID |
| user2_id | bigint | FOREIGN KEY, CASCADE | ユーザー2のID |
| status | string | DEFAULT 'pending' | チャットの状態 |
| created_at | timestamp | NOT NULL | 作成日時 |
| updated_at | timestamp | NOT NULL | 更新日時 |

※ user1_id と user2_id の組み合わせはユニーク

## message
チャットメッセージを管理するテーブル

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint | PRIMARY KEY | メッセージID |
| chat_id | bigint | FOREIGN KEY, CASCADE | チャットルームID |
| user_id | bigint | FOREIGN KEY, CASCADE | 送信者のユーザーID |
| content | text | NOT NULL | メッセージ内容 |
| read_at | timestamp | NULLABLE | 既読日時 |
| created_at | timestamp | NOT NULL | 作成日時 |
| updated_at | timestamp | NOT NULL | 更新日時 |

## vitals
ユーザーのバイタルデータを管理するテーブル

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint | PRIMARY KEY | バイタルID |
| user_id | bigint | FOREIGN KEY, CASCADE | ユーザーID |
| systolic | integer | NOT NULL | 最高血圧 |
| diastolic | integer | NOT NULL | 最低血圧 |
| pulse | integer | NOT NULL | 脈拍 |
| temperature | decimal(3,1) | NOT NULL | 体温 |
| oxygen | integer | NOT NULL | 酸素濃度 |
| mood | enum | NOT NULL | 気分（'happy','neutral','sad'） |
| note | text | NULLABLE | メモ |
| created_at | timestamp | NOT NULL | 作成日時 |
| updated_at | timestamp | NOT NULL | 更新日時 |

## events
ユーザーのカレンダー情報を管理するテーブル

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint | PRIMARY KEY | バイタルID |
| user_id | bigint | FOREIGN KEY, CASCADE | ユーザーID |
| title | integer | NOT NULL | タイトル |
| description | integer | NOT NULL | 説明 |
| start | datetime | NOT NULL | 開始時間 |
| end | datetime | NOT NULL | 終了時間 |
| allday | tinyint(1) | NOT NULL | 終日 |
| created_at | timestamp | NOT NULL | 作成日時 |
| updated_at | timestamp | NOT NULL | 更新日時 |

## todos
ユーザーのカレンダー情報を管理するテーブル

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint | PRIMARY KEY | バイタルID |
| user_id | bigint | FOREIGN KEY, CASCADE | ユーザーID |
| title | integer | NOT NULL | タイトル |
| completed | integer | NOT NULL | 完了 |
| created_at | timestamp | NOT NULL | 作成日時 |
| updated_at | timestamp | NOT NULL | 更新日時 |

## password_reset_tokens
パスワードリセット用のトークンを管理するテーブル

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| email | string | PRIMARY KEY | メールアドレス |
| token | string | NOT NULL | リセットトークン |
| created_at | timestamp | NULLABLE | 作成日時 |

## personal_access_tokens
APIアクセストークンを管理するテーブル

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint | PRIMARY KEY | トークンID |
| tokenable_type | string | NOT NULL | トークン所有モデル名 |
| tokenable_id | bigint | NOT NULL | トークン所有モデルID |
| name | string | NOT NULL | トークン名 |
| token | string(64) | UNIQUE, NOT NULL | トークン文字列 |
| abilities | text | NULLABLE | 権限情報 |
| last_used_at | timestamp | NULLABLE | 最終使用日時 |
| expires_at | timestamp | NULLABLE | 有効期限 |
| created_at | timestamp | NOT NULL | 作成日時 |
| updated_at | timestamp | NOT NULL | 更新日時 |

## failed_jobs
失敗したジョブを管理するテーブル

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint | PRIMARY KEY | ジョブID |
| uuid | string | UNIQUE, NOT NULL | ユニーク識別子 |
| connection | text | NOT NULL | 接続情報 |
| queue | text | NOT NULL | キュー名 |
| payload | longtext | NOT NULL | ジョブデータ |
| exception | longtext | NOT NULL | エラー内容 |
| failed_at | timestamp | DEFAULT CURRENT_TIMESTAMP | 失敗日時 |

## リレーションシップ

- User 1:N Posts
- User 1:N Vitals
- User 1:N Chats (user1_id)
- User 1:N Chats (user2_id)
- Chat 1:N Messages
- User 1:N Messages 