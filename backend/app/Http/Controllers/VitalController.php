<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Vital;


class VitalController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'systolic' => 'required|integer',
            'diastolic' => 'required|integer',
            'pulse' => 'required|integer',
            'temperature' => 'required|numeric',
            'oxygen' => 'required|integer',
            'mood' => 'required|in:happy,neutral,sad',
            'note' => 'nullable|string',
        ]);

        $vital = Vital::create([
            'user_id' => auth()->id(),
            ...$validated
        ]);

        return response()->json($vital);
    }

    public function index()
    {
        $user = auth()->user();
    
        if (!$user) {
            return response()->json(['error' => '認証エラー'], 401);
        }
    
        $vitals = $user->vitals()->get();
    
        return response()->json([
            'user_id' => $user->id,
            'vitals' => $vitals,
        ]);
    }
    
}
