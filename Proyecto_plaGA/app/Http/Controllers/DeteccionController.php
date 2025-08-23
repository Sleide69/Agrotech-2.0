<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Deteccion;

class DeteccionController extends Controller
{
    /**
     * @OA\Post(
     *     path="/api/deteccion",
     *     summary="Registrar una detección de plaga",
     *     description="Registra una nueva detección de plaga asociada al usuario autenticado. Este endpoint requiere autenticación (JWT).",
     *     tags={"Detecciones"},
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"plaga", "ubicacion", "hora"},
     *             @OA\Property(property="plaga", type="string", example="Mosca blanca"),
     *             @OA\Property(property="ubicacion", type="string", example="Invernadero 3, sector norte"),
     *             @OA\Property(property="hora", type="string", format="date-time", example="2025-07-19T14:30:00Z")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Detección registrada exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="mensaje", type="string", example="Detectada y guardada"),
     *             @OA\Property(property="id", type="integer", example=42)
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="No autenticado"
     *     )
     * )
     */
    public function store(Request $request)
    {
        $user = auth('api')->user(); // JWT Auth

        $request->validate([
            'plaga' => 'required|string|max:255',
            'ubicacion' => 'required|string|max:255',
            'hora' => 'required|date',
        ]);

        $det = Deteccion::create([
            'user_id' => $user->id,
            'plaga' => $request->plaga,
            'ubicacion' => $request->ubicacion,
            'hora_detectada' => $request->hora,
        ]);

        // Opcional: lanzar evento si lo necesitas
        // event(new NuevaDeteccion($det));

        return response()->json(['mensaje' => 'Detectada y guardada', 'id' => $det->id], 201);
    }

    /**
     * @OA\Get(
     *     path="/api/deteccion",
     *     summary="Obtener las detecciones del usuario autenticado",
     *     tags={"Detecciones"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de detecciones"
     *     )
     * )
     */
    public function index(Request $request)
    {
        $user = auth('api')->user();

        $detecciones = Deteccion::where('user_id', $user->id)
                                ->orderBy('hora_detectada', 'desc')
                                ->get();

        return response()->json(['detecciones' => $detecciones], 200);
    }
}