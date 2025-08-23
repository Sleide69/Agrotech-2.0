// src/routes/health.route.ts
import { Router, Request, Response } from 'express';

const router = Router();

/**
 * swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Verificar el estado de la aplicación
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Aplicación funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   example: "2025-07-21T05:50:00.000Z"
 *                 uptime:
 *                   type: number
 *                   example: 12345.67
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 */
router.get('/', (req: Request, res: Response) => {
  const healthInfo = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    database: 'connected', // Podrías hacer una verificación real aquí
    websocket: 'active'
  };

  res.status(200).json(healthInfo);
});

/**
 * swagger
 * /health/readiness:
 *   get:
 *     summary: Readiness probe
 *     description: Verificar si la aplicación está lista para recibir tráfico
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Aplicación lista
 *       503:
 *         description: Aplicación no está lista
 */
router.get('/readiness', (req: Request, res: Response) => {
  // Aquí puedes agregar verificaciones más específicas
  // como conectividad a la base de datos, APIs externas, etc.
  
  try {
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
        api: 'ok'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable'
    });
  }
});

/**
 * swagger
 * /health/liveness:
 *   get:
 *     summary: Liveness probe
 *     description: Verificar si la aplicación está viva
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Aplicación viva
 */
router.get('/liveness', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid
  });
});

export default router;
