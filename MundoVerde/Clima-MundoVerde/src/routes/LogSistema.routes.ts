import { Router } from 'express';
import { getLogs } from '../controllers/LogSistema.controller';

const router = Router();

/**
 * @swagger
 * /api/logs:
 *   get:
 *     summary: Obtener logs del sistema
 *     description: Obtiene los logs de consultas climáticas realizadas en el sistema con filtros opcionales
 *     tags: [Logs del Sistema]
 *     parameters:
 *       - in: query
 *         name: ciudad
 *         required: false
 *         schema:
 *           type: string
 *           example: "Quito"
 *         description: Filtrar logs por ciudad
 *       - in: query
 *         name: resultado
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["éxito", "error"]
 *           example: "éxito"
 *         description: Filtrar logs por resultado de la consulta
 *       - in: query
 *         name: fuente
 *         required: false
 *         schema:
 *           type: string
 *           example: "OpenWeatherMap"
 *         description: Filtrar logs por fuente de datos
 *     responses:
 *       200:
 *         description: Logs obtenidos exitosamente
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
 *                       tipoAccion:
 *                         type: string
 *                         example: "CONSULTA_CLIMA"
 *                       descripcion:
 *                         type: string
 *                         example: "Consulta climática exitosa para Guayaquil"
 *                       parametros:
 *                         type: string
 *                         example: "{\"ciudad\":\"Guayaquil\"}"
 *                       resultado:
 *                         type: string
 *                         example: "éxito"
 *                       fuente:
 *                         type: string
 *                         example: "OpenWeatherMap"
 *                       fechaCreacion:
 *                         type: string
 *                         example: "2025-07-21T10:30:00.000Z"
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', getLogs); 

export default router;
