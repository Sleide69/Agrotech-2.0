import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { mountGraphQL } from "./graphql";
import { registerRoutes } from "./routes";
import { getAllServices } from "./config";
import { wsManager } from "./websocket";
import { interceptorMiddleware, errorInterceptorMiddleware } from "./interceptor";
import { buildFoodAidRouter } from './foodAidRoutes';
import { buildIotRouter } from './iotRoutes';
import { buildCamerasRouter } from './cameras';
// OpenTelemetry (instrumentación mínima)
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
// Nota: evitamos crear Resource directamente para simplificar tipos en tsc
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';

(async () => {
// OTel setup (no-op si falla)
try {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);
  const sdk = new NodeSDK({
    resource: {
      attributes: {
        [SemanticResourceAttributes.SERVICE_NAME]: 'api-gateway-mundo-verde',
      }
    } as any,
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
    ],
  });
  // Exportador sencillo a consola (puede cambiarse a OTLP)
  (sdk as any)._tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  sdk.start();
} catch {}

  dotenv.config();

  const app = express();
  const server = createServer(app);

  console.log(`
  ╔══════════════════════════════════════════════════════════════╗
  ║                   🌱 API GATEWAY MUNDO VERDE                 ║
  ║                     Iniciando servidor...                    ║
  ╚══════════════════════════════════════════════════════════════╝
  `);

  // Middlewares básicos - CORS primero
  app.use(cors());
  
  // Configuración especial para GraphQL - NO aplicar body-parser
  app.use('/graphql', (req, res, next) => {
    // Apollo Server manejará su propio parsing del body
    next();
  });
  
  // Para todas las demás rutas (REST), aplicar body-parser e interceptor
  app.use((req: any, res, next) => {
    if (req.path === '/graphql' || req.originalUrl.includes('/graphql')) {
      // Saltamos el body-parser y el interceptor para GraphQL
      next();
    } else {
      // Para rutas REST, aplicamos body parsers
      bodyParser.json({ limit: '10mb' })(req, res, (err: any) => {
        if (err) return next(err);
        bodyParser.urlencoded({ extended: true, limit: '10mb' })(req, res, (err: any) => {
          if (err) return next(err);
          // Aplicamos el interceptor después del body-parser
          interceptorMiddleware(req, res, next);
        });
      });
    }
  });

  /* 1. GraphQL - Se monta ANTES de las rutas REST */
  await mountGraphQL(app);

  /* 2. Proxys REST */
  registerRoutes(app);

  // 3. Food Aid minimal CRUDs (opcional)
  app.use('/food-aid', buildFoodAidRouter());
  // 4. Cámaras (montar antes que IoT para evitar middleware globales en /api)
  const camRouter = buildCamerasRouter();
  app.use('/iot', camRouter);
  app.use('/api', camRouter);
  // 5. IoT Agrotech CRUDs
  const iotRouter = buildIotRouter();
  app.use('/iot', iotRouter);
  app.use('/api', iotRouter); // alias REST según requerimiento

  // Middleware específico para manejar errores de GraphQL
  app.use('/graphql', (err: any, req: any, res: any, next: any) => {
    console.error('❌ Error en GraphQL middleware:', {
      url: req.originalUrl,
      method: req.method,
      error: err.message,
      stack: err.stack
    });
    
    if (err.message === 'stream is not readable') {
      return res.status(400).json({
        errors: [{
          message: 'Error de parsing del request. Asegúrate de enviar un JSON válido.',
          extensions: {
            code: 'BAD_REQUEST'
          }
        }]
      });
    }
    
    next(err);
  });

  // Ruta para obtener estadísticas de WebSocket
  app.get('/gateway/websocket/stats', (req, res) => {
    res.json(wsManager.getStats());
  });

  // Middleware de manejo de errores - DEBE ir al final
  app.use(errorInterceptorMiddleware);

  const port = process.env.GATEWAY_PORT || 8088;
  const wsPort = process.env.WEBSOCKET_PORT || port;
  
  const allServices = getAllServices();
  
  server.listen(port, () => {
    // Inicializar WebSocket Server
    wsManager.initialize(server, Number(wsPort));
    
    console.log(`
  ╔══════════════════════════════════════════════════════════════╗
  ║ ✅ API Gateway MUNDO VERDE ejecutándose en puerto ${port}        ║
  ║ 📡 WebSocket Server ejecutándose en puerto ${wsPort}            ║
  ╠══════════════════════════════════════════════════════════════╣
  ║ 📊 MÓDULOS REGISTRADOS:                                      ║`);
    
    allServices.forEach(service => {
      console.log(`  ║ 🔌 ${service.name.padEnd(15)} | Puerto: ${service.port.toString().padEnd(4)} | ${service.description.padEnd(25)} ║`);
    });
    
    console.log(`  ╠══════════════════════════════════════════════════════════════╣
  ║ 🔗 RUTAS ÚTILES:                                            ║
  ║ 📋 Info módulos: http://localhost:${port}/gateway/info            ║
  ║ 💚 Health check: http://localhost:${port}/gateway/health          ║
  ║ 🟢 Readiness:    http://localhost:${port}/gateway/readiness       ║
  ║ 🚀 GraphQL:      http://localhost:${port}/graphql                ║
  ║ 📊 WS Stats:     http://localhost:${port}/gateway/websocket/stats ║
  ║ �️  WS Client:    http://localhost:${port}/gateway/websocket/client║
  ║ �📡 WebSocket:    ws://localhost:${wsPort}                        ║
  ╚══════════════════════════════════════════════════════════════╝
    `);
  });
})();
