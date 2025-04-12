<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\Request;

class TodoController extends Controller
{
    public function index(Request $request)
    {
        $targetUserId = $request->get('target_user_id');
        
        $todos = Todo::where('user_id', $targetUserId)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($todos);
    }

    public function store(Request $request)
    {
        $targetUserId = $request->get('target_user_id');
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $todo = Todo::create([
            'title' => $validated['title'],
            'user_id' => $targetUserId,
            'completed' => false
        ]);

        return response()->json($todo);
    }

    public function update(Request $request, Todo $todo)
    {
        $targetUserId = $request->get('target_user_id');
        
        // 権限チェック
        if ($todo->user_id != $targetUserId) {
            return response()->json([
                'message' => '権限がありません'
            ], 403);
        }

        $validated = $request->validate([
            'completed' => 'required|boolean',
        ]);

        $todo->update($validated);

        return response()->json($todo);
    }

    public function destroy(Request $request, Todo $todo)
    {
        $targetUserId = $request->get('target_user_id');
        
        // 権限チェック
        if ($todo->user_id != $targetUserId) {
            return response()->json([
                'message' => '権限がありません'
            ], 403);
        }

        $todo->delete();

        return response()->json([
            'message' => 'Todoが削除されました'
        ]);
    }
} 