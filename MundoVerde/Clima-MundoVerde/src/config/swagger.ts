import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Clima Mundo Verde API',
      version: '1.0.0',
      description: `
        API para consultar información climática de diferentes ciudades usando múltiples fuentes de datos.
        
      `,
    },
    servers: [
      {
        url: 'http://localhost:9000/clima',
        description: 'Servidor de producción',
      },
      {
        url: 'http://localhost:3000',
        description: 'Servidor directo del módulo',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Endpoints para verificar el estado de la aplicación',
      },
      {
        name: 'Autenticación',
        description: 'Endpoints para autenticación de usuarios (opcional - JWT desactivado)',
      },
      {
        name: 'Consulta Clima',
        description: 'Endpoints para consultar información climática',
      },
      {
        name: 'Fuentes Climáticas',
        description: 'Endpoints para gestionar fuentes de datos climáticos',
      },
      {
        name: 'Logs del Sistema',
        description: 'Endpoints para consultar logs del sistema',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            error: {
              type: 'string',
              example: 'Mensaje de error'
            }
          }
        }
      }
    },
    // Eliminamos security global ya que JWT está desactivado
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/dtos/*.ts',
  ]
};

export const swaggerSpec = swaggerJSDoc(options);
