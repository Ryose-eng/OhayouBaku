<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vital;


class VitalController extends Controller
{
    public function store(Request $request)
    {
        $targetUserId = $request->get('target_user_id');
        
        $vital = new Vital([
            'systolic' => $request->systolic,
            'diastolic' => $request->diastolic,
            'pulse' => $request->pulse,
            'temperature' => $request->temperature,
            'oxygen' => $request->oxygen,
            'mood' => $request->mood,
            'note' => $request->note,
            'user_id' => $targetUserId
        ]);

        $vital->save();

        return response()->json([
            'message' => 'バイタルデータが保存されました',
            'vital' => $vital
        ]);
    }

    public function index(Request $request)
    {
        $targetUserId = $request->get('target_user_id');
        $user = \App\Models\User::findOrFail($targetUserId);
        
        $vitals = $user->vitals()
            ->orderBy('created_at', 'desc') // 作成日時の降順（最新が上）
            ->get();

        return response()->json([
            'user_id' => $user->id,
            'vitals' => $vitals,
        ]);
    }
    
}
