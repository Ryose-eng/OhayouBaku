<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    // 投稿一覧取得
    public function index()
    {
        return response()->json(Post::with('user')->latest()->get());
    }

    // 投稿作成
    public function store(Request $request)
    {
        $request->validate([
            'body' => 'required|string|max:255',
        ]);

        $post = Post::create([
            'user_id' => Auth::id(),
            'body' => $request->body,
        ]);

        return response()->json($post, 201);
    }
}
