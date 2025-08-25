<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\NotificacionController;
use App\Http\Controllers\DeteccionController;
use App\Http\Controllers\CapturaController;

// Health/Readiness
Route::get('/health', fn() => response()->json(['status' => 'ok']));
Route::get('/readiness', function() {
    try {
        \DB::select('select 1');
        return response()->json(['ready' => true]);
    } catch (\Throwable $e) {
        return response()->json(['ready' => false, 'error' => $e->getMessage()], 503);
    }
});

// 🔐 Autenticación JWT (usado desde tu frontend JS)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Logout protegido por JWT
Route::post('/logout', [AuthController::class, 'logout'])->middleware('jwt.auth')->name('logout');

// 🔔 Notificaciones y detecciones (requieren JWT)
Route::middleware('jwt.auth')->group(function () {
    Route::get('/notificaciones', [NotificacionController::class, 'index']);
    Route::post('/notificaciones', [NotificacionController::class, 'store']);
    Route::post('/deteccion', [DeteccionController::class, 'store']);
    Route::get('/deteccion', [DeteccionController::class, 'index']);

    // Captura de imagen protegida (API)
    Route::post('/captura', [CapturaController::class, 'guardarImagen']);
});
