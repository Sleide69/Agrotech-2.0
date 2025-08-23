// src/test/logSistemaController.test.ts
import * as LogSistemaController from '../controllers/LogSistema.controller';

describe('LogSistema.controller - getLogs', () => {
  let req: any;
  let res: any;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    req = { query: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    // Mockeamos el método getAll de la instancia exportada
    LogSistemaController.logService.getAll = jest.fn();

    // Mockear console.error para evitar impresión en tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restaurar console.error original
    consoleErrorSpy.mockRestore();
  });

  it('debe devolver logs sin filtros', async () => {
    (LogSistemaController.logService.getAll as jest.Mock).mockResolvedValue([{ id: 1, mensaje: 'log1' }]);

    await LogSistemaController.getLogs(req, res);

    expect(LogSistemaController.logService.getAll).toHaveBeenCalledWith({
      ciudad: undefined,
      resultadoConsulta: undefined,
      fuenteNombre: undefined,
    });

    expect(res.json).toHaveBeenCalledWith([{ id: 1, mensaje: 'log1' }]);
  });

  it('debe pasar los filtros al servicio', async () => {
    req.query = {
      ciudad: 'Bogotá',
      resultado: 'OK',
      fuente: 'API Clima',
    };

    (LogSistemaController.logService.getAll as jest.Mock).mockResolvedValue([]);

    await LogSistemaController.getLogs(req, res);

    expect(LogSistemaController.logService.getAll).toHaveBeenCalledWith({
      ciudad: 'Bogotá',
      resultadoConsulta: 'OK',
      fuenteNombre: 'API Clima',
    });
  });

  it('debe responder con 500 si hay error', async () => {
    (LogSistemaController.logService.getAll as jest.Mock).mockRejectedValue(new Error('fail'));

    await LogSistemaController.getLogs(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error del servidor' });
  });
});
