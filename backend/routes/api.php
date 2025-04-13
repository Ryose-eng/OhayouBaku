<?php

use App\Http\Controllers\PostController;
use App\Http\Controllers\VitalController;
use App\Http\Controllers\ChatController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\TodoController;
use App\Http\Controllers\EventController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/posts', [PostController::class, 'index']);
Route::get('/posts/{id}', [PostController::class, 'show']); 
Route::middleware(['auth:sanctum'])->post('/posts', [PostController::class, 'store']);

Route::middleware(['auth:sanctum', 'caregiver.auth'])->group(function () {
    Route::get('/vitals', [VitalController::class, 'index']);
    Route::post('/vitals', [VitalController::class, 'store']);
    Route::apiResource('todos', TodoController::class);
    Route::apiResource('events', EventController::class);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/user-chat', [ChatController::class, 'getUserChat']);
    Route::post('/chat/create', [ChatController::class, 'create']);
    Route::get('/chat/{chatId}', [ChatController::class, 'show']);
    Route::post('/chat/message', [ChatController::class, 'storeMessage']);
    Route::get('/chats', [ChatController::class, 'index']);
});

Route::post('/login', [AuthenticatedSessionController::class, 'store']);
Route::post('/register', [RegisteredUserController::class, 'store']);
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy']);