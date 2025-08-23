<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class PlagaController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/plagas/detectar",
     *     summary="Detectar plagas en una imagen base64 usando YOLOv5",
     *     tags={"Plagas"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"imagen"},
     *             @OA\Property(
     *                 property="imagen",
     *                 type="string",
     *                 format="base64",
     *                 example="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Resultados de detección en JSON"
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Formato de imagen inválido o error en la detección"
     *     )
     * )
     */
    public function guardarImagen(Request $request)
    {
        $imagen = $request->input('imagen');

        if (!str_starts_with($imagen, 'data:image/jpeg;base64,')) {
            return response()->json(['error' => 'Formato de imagen inválido.'], 400);
        }

        $imagen = str_replace('data:image/jpeg;base64,', '', $imagen);
        $imagen = str_replace(' ', '+', $imagen);

        $nombreImagen = time() . '.jpg';
        $rutaLocal = storage_path('app/public/' . $nombreImagen);

        File::put($rutaLocal, base64_decode($imagen));

        try {
            $output = shell_exec("python3 scripts/detect_plaga.py " . escapeshellarg($rutaLocal));

            if (!$output) {
                return response()->json(['error' => 'No se recibió respuesta del script de detección.'], 500);
            }

            $detecciones = json_decode($output, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json(['error' => 'La respuesta del detector no es un JSON válido.'], 500);
            }

            if (!is_array($detecciones)) {
                return response()->json(['error' => 'El formato de las detecciones no es válido.'], 500);
            }

            $imagenProcesada = 'storage/' . $nombreImagen;
            return response()->json([
                'imagenProcesada' => $imagenProcesada,
                'detecciones' => $detecciones,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al ejecutar la detección: ' . $e->getMessage()], 500);
        }
    }

    public function mostrarFormulario()
    {
        return view('captura');
    }
}