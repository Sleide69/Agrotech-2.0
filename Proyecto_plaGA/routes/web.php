<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PlagaController;
use App\Http\Controllers\CapturaController;
use App\Events\NuevaDeteccion;

// Página de bienvenida
Route::get('/', function () {
    return view('welcome');
});

// 🔐 Autenticación (formulario Blade)
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login'])->name('login.post');
Route::get('/register', [AuthController::class, 'showRegister'])->name('register.form');
Route::post('/register', [AuthController::class, 'register'])->name('register.post');
// Evitar colisión con la ruta API 'logout'
Route::post('/logout', [AuthController::class, 'logout'])->name('logout.web');

// 📸 Captura de imagen (vistas Blade) – nombres únicos y sin duplicados
Route::get('/captura', [PlagaController::class, 'mostrarFormulario'])
    ->middleware('auth')
    ->name('captura.form');

// Formulario GET
Route::get('/captura-imagen', [CapturaController::class, 'mostrarFormulario'])
    ->middleware('auth')
    ->name('captura.imagen'); // mantenemos este nombre para compatibilidad

// Envío POST
Route::post('/captura-imagen', [CapturaController::class, 'guardarImagen'])
    ->middleware('auth')
    ->name('captura.imagen.store');



// 🖼️ Servir imágenes de capturas
Route::get('/storage/capturas/{filename}', function ($filename) {
    $path = storage_path('app/public/capturas/' . $filename);
    if (!file_exists($path)) abort(404);
    return response()->file($path);
})->where('filename', '[A-Za-z0-9\-\.]+')->name('captura.imagen.show');

// 📊 Registrar detecciones (opcional desde IA externa)
Route::post('/plagas-detectadas', function (Request $request) {
    \App\Models\Captura::create([
        'plaga_detectada' => $request->plaga,
        'confianza' => $request->confianza,
        'solucion' => $request->solucion,
        'fecha_captura' => $request->capturado_en,
    ]);
    return response()->json(['mensaje' => 'Plaga registrada por IA']);
});