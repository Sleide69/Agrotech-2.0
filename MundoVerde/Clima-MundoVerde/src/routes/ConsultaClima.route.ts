import { Router } from 'express';
import { ConsultaClimaController } from '../controllers/ConsultaClima.controller';

const router = Router();
const controller = new ConsultaClimaController();

const asyncWrapper = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn.call(controller, req, res, next)).catch(next);

/**
 * @swagger
 * /api/consulta-clima:
 *   get:
 *     summary: Consultar clima de una ciudad
 *     description: Obtiene información climática actual de una ciudad específica desde OpenWeather API
 *     tags: [Consulta Clima]
 *     parameters:
 *       - in: query
 *         name: ciudad
 *         required: true
 *         schema:
 *           type: string
 *           example: "Guayaquil"
 *         description: Nombre de la ciudad a consultar
 *     responses:
 *       200:
 *         description: Información climática obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     ciudad:
 *                       type: string
 *                       example: "Guayaquil"
 *                     temperatura:
 *                       type: number
 *                       example: 28.5
 *                     descripcion:
 *                       type: string
 *                       example: "cielo claro"
 *                     humedad:
 *                       type: number
 *                       example: 65
 *                     fechaConsulta:
 *                       type: string
 *                       example: "2025-07-21T10:30:00.000Z"
 *       400:
 *         description: Parámetro ciudad requerido
 *       404:
 *         description: Ciudad no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', asyncWrapper(controller.obtenerClimaPorCiudad));

export default router;
