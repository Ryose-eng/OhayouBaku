<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Carbon\Carbon;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $targetUserId = $request->get('target_user_id');
        
        $events = Event::where('user_id', $targetUserId)->get();
        
        return response()->json($events);
    }

    public function store(Request $request)
    {
        $targetUserId = $request->get('target_user_id');
        
        $validated = $request->validate([
            'title' => 'required|string',
            'start' => 'required|date',
            'end' => 'required|date|after_or_equal:start',
            'all_day' => 'boolean'
        ]);

        if ($validated['all_day']) {
            $start = Carbon::createFromFormat('Y-m-d', $validated['start'])->startOfDay();
            $end = Carbon::createFromFormat('Y-m-d', $validated['end'])->endOfDay();
        } else {
            $start = Carbon::createFromFormat('Y-m-d H:i:s', $validated['start']);
            $end = Carbon::createFromFormat('Y-m-d H:i:s', $validated['end']);
        }

        $event = Event::create([
            'user_id' => $targetUserId,
            'title' => $validated['title'],
            'start' => $start,
            'end' => $end,
            'all_day' => $validated['all_day']
        ]);

        return response()->json($event);
    }

    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'start' => 'sometimes|required|date',
            'end' => 'sometimes|required|date|after:start'
        ]);

        $event->update($validated);
        return $event;
    }

    public function destroy(Event $event)
    {
        try {
            // イベントが存在し、かつ現在のユーザーに関連付けられているか確認
            if ($event && $event->user_id === request()->get('target_user_id')) {
                $event->delete();
                return response()->json([
                    'success' => true,
                    'message' => 'イベントが正常に削除されました'
                ]);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'イベントの削除権限がありません'
            ], 403);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'イベントの削除中にエラーが発生しました'
            ], 500);
        }
    }
} 