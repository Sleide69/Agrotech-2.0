// src/tests/fuenteClimaticaService.test.ts
import { FuenteClimaticaService } from '../services/FuenteClimatica.service';
import { AppDataSource } from '../config/data-source';
import { FuenteClimatica } from '../entities/FuenteClimaticaEntity';

describe('FuenteClimaticaService', () => {
  let service: FuenteClimaticaService;
  let mockFind: jest.Mock;

  beforeEach(() => {
    // Crear mock para .find()
    mockFind = jest.fn().mockResolvedValue([
      { id: 1, nombre: 'OpenWeatherMap' },
      { id: 2, nombre: 'NOAA' },
    ]);

    // Mock del repositorio
    const mockRepo = {
      find: mockFind,
    };

    // Mock de AppDataSource.getRepository para devolver nuestro mockRepo
    jest.spyOn(AppDataSource, 'getRepository').mockReturnValue(mockRepo as any);

    service = new FuenteClimaticaService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debe retornar todas las fuentes climáticas', async () => {
    const result = await service.getAll();

    expect(AppDataSource.getRepository).toHaveBeenCalledWith(FuenteClimatica);
    expect(mockFind).toHaveBeenCalled();
    expect(result).toEqual([
      { id: 1, nombre: 'OpenWeatherMap' },
      { id: 2, nombre: 'NOAA' },
    ]);
  });
});
