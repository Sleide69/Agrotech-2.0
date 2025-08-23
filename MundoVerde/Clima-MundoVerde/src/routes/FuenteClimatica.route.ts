import { Router } from 'express';
import { getAllFuentes } from '../controllers/FuenteClimatica.controller';

const router = Router();

/**
 * @swagger
 * /api/fuentes:
 *   get:
 *     summary: Obtener todas las fuentes climáticas
 *     description: Obtiene la lista de todas las fuentes de datos climáticos disponibles en el sistema
 *     tags: [Fuentes Climáticas]
 *     responses:
 *       200:
 *         description: Lista de fuentes climáticas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                         example: 1
 *                       nombre:
 *                         type: string
 *                         example: "OpenWeatherMap"
 *                       descripcion:
 *                         type: string
 *                         example: "Servicio de datos meteorológicos globales"
 *                       url:
 *                         type: string
 *                         example: "https://api.openweathermap.org"
 *                       activo:
 *                         type: boolean
 *                         example: true
 *                       fechaCreacion:
 *                         type: string
 *                         example: "2025-07-21T10:30:00.000Z"
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', getAllFuentes);

export default router;