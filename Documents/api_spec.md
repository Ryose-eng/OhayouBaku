# API Specification

## API概要
| カテゴリ | 説明 |
|---------|------|
| 認証 | ユーザー登録、ログイン機能を提供 |
| 投稿 | ユーザーの投稿の作成・取得機能を提供 |
| チャット | ユーザー間のチャット機能を提供 |
| バイタル | ユーザーの健康データ管理機能を提供 |

## API一覧

### 認証系API
| エンドポイント | メソッド | 認証要否 | 説明 | 用途 |
|--------------|---------|----------|------|------|
| /api/register | POST | 不要 | ユーザー登録 | 新規ユーザーの作成 |
| /api/login | POST | 不要 | ログイン | 既存ユーザーの認証 |
| /api/logout | POST | 必要 | ログアウト | 現在のセッションの終了 |

### 投稿系API
| エンドポイント | メソッド | 認証要否 | 説明 | 用途 |
|--------------|---------|----------|------|------|
| /api/posts | GET | 必要 | 投稿一覧取得 | タイムライン表示 |
| /api/posts | POST | 必要 | 投稿作成 | 新規投稿の作成 |
| /api/posts/{id} | GET | 必要 | 投稿詳細取得 | 特定の投稿の表示 |

### チャット系API
| エンドポイント | メソッド | 認証要否 | 説明 | 用途 |
|--------------|---------|----------|------|------|
| /api/chats | POST | 必要 | チャットルーム作成 | 新規チャットの開始 |
| /api/chats | GET | 必要 | チャットルーム一覧取得 | チャット一覧の表示 |
| /api/chats/{chatId} | GET | 必要 | チャットルーム詳細取得 | メッセージ履歴の表示 |
| /api/messages | POST | 必要 | メッセージ送信 | チャットメッセージの送信 |
| /api/user-chat | GET | 必要 | ユーザーのチャットルーム取得 | 現在のユーザーのチャットルーム情報取得 |

### バイタル系API
| エンドポイント | メソッド | 認証要否 | 説明 | 用途 |
|--------------|---------|----------|------|------|
| /api/vitals | POST | 必要 | バイタルデータ登録 | 健康データの記録 |
| /api/vitals | GET | 必要 | バイタルデータ一覧取得 | 健康データの履歴表示 |

## 詳細仕様

### 認証関連

#### ユーザー登録
- **エンドポイント**: `POST /api/register`
- **リクエストボディ**:
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "password_confirmation": "string"
  }
  ```
- **レスポンス**: 200 OK
  ```json
  {
    "user": {
      "id": "integer",
      "name": "string",
      "email": "string"
    },
    "token": "string"
  }
  ```

### ログイン
- **エンドポイント**: `POST /api/login`
- **リクエストボディ**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **レスポンス**: 200 OK
  ```json
  {
    "token": "string"
  }
  ```

## 投稿関連

### 投稿一覧取得
- **エンドポイント**: `GET /api/posts`
- **認証**: 必要
- **レスポンス**: 200 OK
  ```json
  [
    {
      "id": "integer",
      "body": "string",
      "created_at": "datetime",
      "user": {
        "id": "integer",
        "name": "string"
      }
    }
  ]
  ```

### 投稿作成
- **エンドポイント**: `POST /api/posts`
- **認証**: 必要
- **リクエストボディ**:
  ```json
  {
    "body": "string"
  }
  ```
- **レスポンス**: 201 Created
  ```json
  {
    "id": "integer",
    "body": "string",
    "created_at": "datetime",
    "user": {
      "id": "integer",
      "name": "string"
    }
  }
  ```

## チャット関連

### チャットルーム作成
- **エンドポイント**: `POST /api/chats`
- **認証**: 必要
- **リクエストボディ**:
  ```json
  {
    "email": "string"
  }
  ```
- **レスポンス**: 200 OK
  ```json
  {
    "success": true,
    "chatId": "integer",
    "status": "string",
    "message": "string"
  }
  ```

### チャットルーム一覧取得
- **エンドポイント**: `GET /api/chats`
- **認証**: 必要
- **レスポンス**: 200 OK
  ```json
  {
    "success": true,
    "chats": [
      {
        "id": "integer",
        "partner": {
          "id": "integer",
          "name": "string",
          "email": "string"
        },
        "latest_message": {
          "content": "string",
          "sent_at": "datetime",
          "is_mine": "boolean"
        },
        "created_at": "datetime"
      }
    ]
  }
  ```

### チャットルーム詳細取得
- **エンドポイント**: `GET /api/chats/{chatId}`
- **認証**: 必要
- **レスポンス**: 200 OK
  ```json
  {
    "success": true,
    "chat": {
      "id": "integer",
      "status": "string"
    },
    "partner": {
      "id": "integer",
      "name": "string"
    },
    "messages": [
      {
        "id": "integer",
        "content": "string",
        "created_at": "datetime",
        "read_at": "datetime|null",
        "is_mine": "boolean"
      }
    ]
  }
  ```

### メッセージ送信
- **エンドポイント**: `POST /api/messages`
- **認証**: 必要
- **リクエストボディ**:
  ```json
  {
    "chat_id": "integer",
    "content": "string"
  }
  ```
- **レスポンス**: 200 OK
  ```json
  {
    "success": true,
    "message": {
      "id": "integer",
      "content": "string",
      "created_at": "datetime"
    }
  }
  ```

### ユーザーのチャットルーム取得
- **エンドポイント**: `GET /api/user-chat`
- **認証**: 必要
- **レスポンス**: 200 OK
  ```json
  {
    "success": true,
    "chatId": "integer",
    "status": "string",
    "message": "string|null"
  }
  ```
- **エラーレスポンス**: 
  ```json
  {
    "success": false,
    "message": "チャットルームが見つかりません"
  }
  ```
  または
  ```json
  {
    "success": false,
    "message": "エラーが発生しました"
  }
  ```

## バイタル関連

### バイタルデータ登録
- **エンドポイント**: `POST /api/vitals`
- **認証**: 必要
- **リクエストボディ**:
  ```json
  {
    "systolic": "integer",
    "diastolic": "integer",
    "pulse": "integer",
    "temperature": "decimal",
    "oxygen": "integer",
    "mood": "string(happy|neutral|sad)",
    "note": "string|null"
  }
  ```
- **レスポンス**: 200 OK
  ```json
  {
    "id": "integer",
    "user_id": "integer",
    "systolic": "integer",
    "diastolic": "integer",
    "pulse": "integer",
    "temperature": "decimal",
    "oxygen": "integer",
    "mood": "string",
    "note": "string|null",
    "created_at": "datetime"
  }
  ```

### バイタルデータ一覧取得
- **エンドポイント**: `GET /api/vitals`
- **認証**: 必要
- **レスポンス**: 200 OK
  ```json
  {
    "user_id": "integer",
    "vitals": [
      {
        "id": "integer",
        "systolic": "integer",
        "diastolic": "integer",
        "pulse": "integer",
        "temperature": "decimal",
        "oxygen": "integer",
        "mood": "string",
        "note": "string|null",
        "created_at": "datetime"
      }
    ]
  }
  ```

## エラーレスポンス
すべてのエンドポイントで以下のようなエラーレスポンスが返される可能性があります：

### 認証エラー
- **ステータス**: 401 Unauthorized
  ```json
  {
    "message": "Unauthenticated."
  }
  ```

### バリデーションエラー
- **ステータス**: 422 Unprocessable Entity
  ```json
  {
    "message": "The given data was invalid.",
    "errors": {
      "field_name": [
        "エラーメッセージ"
      ]
    }
  }
  ```

### サーバーエラー
- **ステータス**: 500 Internal Server Error
  ```json
  {
    "success": false,
    "message": "エラーメッセージ"
  }
  ``` 