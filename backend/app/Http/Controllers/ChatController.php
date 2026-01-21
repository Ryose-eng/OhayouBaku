<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
class ChatController extends Controller
{
    /**
     * チャットルームを作成
     */
    public function create(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|exists:users,email',
            ]);

            $currentUser = Auth::user();
            $partner = User::where('email', $request->email)->first();

            if ($currentUser->id === $partner->id) {
                return response()->json([
                    'success' => false,
                    'message' => '自分自身とチャットすることはできません。'
                ], 400);
            }

            // 介護者と被介護者の関係性チェック
            if (($currentUser->caregiver && $partner->caregiver) || 
                (!$currentUser->caregiver && !$partner->caregiver)) {
                return response()->json([
                    'success' => false,
                    'message' => '介護者と被介護者の組み合わせである必要があります。'
                ], 400);
            }

            // 既存のチャットルームを検索
            $existingChat = Chat::where(function($query) use ($currentUser, $partner) {
                    $query->where('user1_id', $currentUser->id)
                        ->where('user2_id', $partner->id);
                })
                ->orWhere(function($query) use ($currentUser, $partner) {
                    $query->where('user1_id', $partner->id)
                        ->where('user2_id', $currentUser->id);
                })
                ->first();

            if ($existingChat) {
                if ($existingChat->status === 'pending') {
                    $existingChat->update(['status' => 'active']);
                    
                    $caregiver = $currentUser->caregiver ? $currentUser : $partner;
                    $recipient = $currentUser->caregiver ? $partner : $currentUser;
                    
                    $caregiver->care_recipient_id = $recipient->id;
                    $caregiver->save();
                    
                    return response()->json([
                        'success' => true,
                        'chatId' => $existingChat->id,
                        'status' => 'active',
                        'message' => 'チャットルームが作成されました。'
                    ]);
                }
                
                return response()->json([
                    'success' => true,
                    'chatId' => $existingChat->id,
                    'status' => $existingChat->status,
                    'message' => $existingChat->status === 'active' 
                        ? 'チャットルームが作成されました。'
                        : '認証待ち中です。相手からの認証をお待ちください。'
                ]);
            }

            // 新しいチャットルームを作成（pending状態）
            $chat = Chat::create([
                'user1_id' => $currentUser->id,
                'user2_id' => $partner->id,
                'status' => 'pending'
            ]);

            return response()->json([
                'success' => true,
                'chatId' => $chat->id,
                'status' => 'pending',
                'message' => '認証待ち中です。相手からの認証をお待ちください。'
            ]);

        } catch (\Exception $e) {
            Log::error('Chat creation error:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'チャットルームの作成中にエラーが発生しました。'
            ], 500);
        }
    }

    /**
     * チャットルームと過去のメッセージを取得
     */
    public function show($chatId)
    {
        try {
            Log::info('Chat show attempt', [
                'chat_id' => $chatId,
                'user_id' => Auth::id()
            ]);

            $chat = Chat::findOrFail($chatId);
            Log::info('Chat found', ['chat' => $chat]);
            
            // チャットの参加者確認
            if ($chat->user1_id !== Auth::id() && $chat->user2_id !== Auth::id()) {
                Log::warning('Unauthorized chat access', [
                    'chat_id' => $chatId,
                    'user_id' => Auth::id(),
                    'user1_id' => $chat->user1_id,
                    'user2_id' => $chat->user2_id
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'アクセス権限がありません'
                ], 403);
            }

            // パートナー情報の取得
            $partner = User::find(
                $chat->user1_id === Auth::id() ? $chat->user2_id : $chat->user1_id
            );
            Log::info('Partner found', ['partner' => $partner]);

            // メッセージの取得
            $messages = Message::where('chat_id', $chatId)
                ->orderBy('created_at', 'asc')
                ->get()
                ->map(function ($message) {
                    return [
                        'id' => $message->id,
                        'content' => $message->content,
                        'created_at' => $message->created_at,
                        'read_at' => $message->read_at,
                        'is_mine' => $message->user_id === Auth::id()
                    ];
                });
            Log::info('Messages retrieved', ['count' => $messages->count()]);

            return response()->json([
                'success' => true,
                'chat' => $chat,
                'partner' => $partner,
                'messages' => $messages
            ]);

        } catch (\Exception $e) {
            Log::error('Chat show error: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString(),
                'chat_id' => $chatId,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'チャットルームの取得中にエラーが発生しました'
            ], 500);
        }
    }

    /**
     * メッセージを保存
     */
    public function storeMessage(Request $request)
    {
        $request->validate([
            'chat_id' => 'required|exists:chats,id',
            'content' => 'required|string'
        ]);
        
        $chat = Chat::findOrFail($request->chat_id);
        
        // 現在のユーザーがこのチャットに参加しているか確認
        if ($chat->user1_id !== Auth::id() && $chat->user2_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'アクセス権限がありません。'
            ], 403);
        }
        
        $message = new Message();
        $message->chat_id = $request->chat_id;
        $message->user_id = Auth::id();
        $message->content = $request->content;
        $message->save();
        
        return response()->json([
            'success' => true,
            'message' => $message
        ]);
    }

    /**
     * ユーザーのチャットリストを取得
     */
    public function index()
    {
        $chats = Chat::where('user1_id', Auth::id())
            ->orWhere('user2_id', Auth::id())
            ->get()
            ->map(function ($chat) {
                // チャット相手の情報を取得
                $partnerId = ($chat->user1_id === Auth::id()) ? $chat->user2_id : $chat->user1_id;
                $partner = User::find($partnerId);
                
                // 最新のメッセージを取得
                $latestMessage = Message::where('chat_id', $chat->id)
                    ->orderBy('created_at', 'desc')
                    ->first();
                
                return [
                    'id' => $chat->id,
                    'partner' => [
                        'id' => $partner->id,
                        'name' => $partner->name,
                        'email' => $partner->email,
                    ],
                    'latest_message' => $latestMessage ? [
                        'content' => $latestMessage->content,
                        'sent_at' => $latestMessage->created_at,
                        'is_mine' => $latestMessage->user_id === Auth::id()
                    ] : null,
                    'created_at' => $chat->created_at
                ];
            });
        
        return response()->json([
            'success' => true,
            'chats' => $chats
        ]);
    }

    /**
     * チャットルーム取得メソッド
     */
    public function getUserChat()
    {
        try {
            $currentUser = Auth::user();
            
            // ユーザーの全てのチャットを取得
            $chats = Chat::where(function($query) use ($currentUser) {
                    $query->where('user1_id', $currentUser->id)
                        ->orWhere('user2_id', $currentUser->id);
                })
                ->with(['user1', 'user2'])
                ->get();

            foreach ($chats as $chat) {
                // チャットの相手を特定
                $partner = $chat->user1_id === $currentUser->id ? $chat->user2 : $chat->user1;
                
                // activeなチャットがある場合
                if ($chat->status === 'active') {
                    // 介護者と被介護者の関係を確認
                    if (($currentUser->caregiver && !$partner->caregiver) || 
                        (!$currentUser->caregiver && $partner->caregiver)) {
                        
                        // 介護者側の場合、care_recipient_idを確認
                        if ($currentUser->caregiver && $currentUser->care_recipient_id === $partner->id) {
                            return response()->json([
                                'success' => true,
                                'chatId' => $chat->id,
                                'status' => 'active'
                            ]);
                        }
                        
                        // 被介護者側の場合、介護者のcare_recipient_idを確認
                        if (!$currentUser->caregiver && $partner->care_recipient_id === $currentUser->id) {
                            return response()->json([
                                'success' => true,
                                'chatId' => $chat->id,
                                'status' => 'active'
                            ]);
                        }
                    }
                }
                
                // pending状態のチャットがある場合
                if ($chat->status === 'pending') {
                    if ($chat->user1_id === $currentUser->id) {
                        return response()->json([
                            'success' => true,
                            'chatId' => $chat->id,
                            'status' => 'pending',
                            'message' => '認証待ち中です。相手からの認証をお待ちください。'
                        ]);
                    }
                    continue;
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'チャットルームが見つかりません'
            ]);

        } catch (\Exception $e) {
            Log::error('Error in getUserChat:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'エラーが発生しました'
            ], 500);
        }
    }
}