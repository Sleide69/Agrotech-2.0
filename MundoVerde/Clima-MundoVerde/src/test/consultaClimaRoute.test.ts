// src/tests/consultaClimaRoute.test.ts

// ⛔ Mock de auth para evitar token
jest.mock('../middlewares/auth.middleware', () => ({
  verificarToken: (req: any, res: any, next: any) => next(),
}));

// ✅ Mock del controlador ANTES de importar el router
const mockRespuesta = { clima: 'Nublado', ciudad: 'Medellín' };
jest.mock('../controllers/ConsultaClima.controller', () => {
  return {
    ConsultaClimaController: jest.fn().mockImplementation(() => ({
      obtenerClimaPorCiudad: (req: any, res: any) => {
        return res.status(200).json(mockRespuesta);
      },
    })),
  };
});

import request from 'supertest';
import express from 'express';
import ConsultaClimaRouter from '../routes/ConsultaClima.route';

describe('GET /consulta-clima', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/consulta-clima', ConsultaClimaRouter);
  });

  it('debe responder sin requerir token', async () => {
    const res = await request(app).get('/consulta-clima');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockRespuesta);
  });
});