<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/hello', function () {
    return response()->json([
        'message' => 'Hello from LitRepo API!'
    ]);
});

Route::get('/posts', function () {
    return response()->json([
        [
            'id' => 1,
            'username' => 'Alice',
            'body' => 'これは最初の投稿です！',
            'created_at' => '2025-02-09 10:00:00'
        ],
        [
            'id' => 2,
            'username' => 'Bob',
            'body' => 'こんにちは、世界！',
            'created_at' => '2025-02-09 11:30:00'
        ]
    ]);
});