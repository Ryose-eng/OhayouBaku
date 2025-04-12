<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckCaregiverAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user->caregiver && !$user->care_recipient_id) {
            return response()->json([
                'success' => false,
                'message' => 'チャットから被介護者との認証を行ってください',
                'needsAuth' => true
            ], 403);
        }

        // care_recipient_idのパラメータを追加
        if ($user->caregiver && $user->care_recipient_id) {
            $request->merge(['target_user_id' => $user->care_recipient_id]);
        } else {
            $request->merge(['target_user_id' => $user->id]);
        }

        return $next($request);
    }
}