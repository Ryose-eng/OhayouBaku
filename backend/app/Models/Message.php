<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $table = 'message';

    protected $fillable = [
        'chat_id',
        'user_id',
        'content',
        'read_at'
    ];

    protected $casts = [
        'read_at' => 'datetime'
    ];

    /**
     * メッセージの送信者との関連
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * メッセージが属するチャットとの関連
     */
    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }
}