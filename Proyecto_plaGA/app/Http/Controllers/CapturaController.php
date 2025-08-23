<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use App\Models\Deteccion;
use App\Models\Notificacion;

class CapturaController extends Controller
{
    public function guardarImagen(Request $request)
    {
        $dataUri = $request->input('imagen');
        if (!$dataUri || !str_starts_with($dataUri, 'data:image/jpeg;base64,')) {
            return response()->json(['error' => 'Formato de imagen inválido.'], 400);
        }

        $imgData = base64_decode(str_replace('data:image/jpeg;base64,', '', $dataUri));
        $filename = 'capturas/' . Str::uuid() . '.jpg';
        Storage::disk('public')->put($filename, $imgData);
        $rutaLocal = storage_path('app/public/' . $filename);

        $response = Http::attach(
            'image', file_get_contents($rutaLocal), 'captura.jpg'
        )->post('http://localhost:5000/detect');

        if ($response->failed()) {
            return response()->json(['error' => 'Microservicio de IA no respondió.'], 500);
        }

        $detecciones = $response->json();

        // Guarda la(s) detección(es) y una sola notificación con el resumen
        if (is_array($detecciones) && count($detecciones) > 0) {
            foreach ($detecciones as $det) {
                Deteccion::create([
                    'user_id' => auth('api')->id(),
                    'plaga' => $det['name'] ?? '',
                    'ubicacion' => 'Desconocida',
                    'hora_detectada' => now(),
                ]);
            }
            // Construye el mensaje resumen para la notificación
            $mensaje = 'Detección: ' . implode(', ', array_map(function($d) {
                return ($d['name'] ?? 'Desconocida') . ' (' . (isset($d['confidence']) ? number_format($d['confidence'] * 100, 2) : '??') . '%)';
            }, $detecciones));

            Notificacion::create([
                'user_id' => auth('api')->id(),
                'mensaje' => $mensaje,
            ]);
        }

        return response()->json([
            'imagenProcesada' => Storage::url($filename),
            'detecciones' => $detecciones,
        ]);
    }

    public function mostrarFormulario()
    {
        return view('captura');
    }
}