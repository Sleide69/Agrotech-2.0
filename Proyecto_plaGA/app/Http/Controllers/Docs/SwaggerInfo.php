<?php

namespace App\Http\Controllers\Docs;

/**
 * @OA\Info(
 *     title="API de Detección de Plagas",
 *     version="1.0",
 *     description="Documentación de la API para el sistema de detección de plagas usando Laravel y YOLOv5"
 * )
 *
 * @OA\Server(
 *     url=L5_SWAGGER_CONST_HOST,
 *     description="Servidor local"
 * )
 *
 * @OA\SecurityScheme(
 *     securityScheme="bearerAuth",
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT"
 * )
 */
class SwaggerInfo {}
