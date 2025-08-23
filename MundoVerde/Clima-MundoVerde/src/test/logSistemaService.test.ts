// tests/logSistemaService.test.ts
import { LogSistemaService } from '../services/LogSistema.service';
import { AppDataSource } from '../config/data-source';
import { LogSistema } from '../entities/LogSistemaEntity';

describe('LogSistemaService', () => {
  let service: LogSistemaService;
  let mockGetMany: jest.Mock;

  beforeEach(() => {
    // mock para getMany
    mockGetMany = jest.fn().mockResolvedValue([
      { id: 1, ciudad: 'Buenos Aires', resultadoConsulta: 'OK', fuenteNombre: 'Fuente1', fechaHora: new Date() },
    ]);

    // mock de createQueryBuilder que retorna métodos encadenables
    const mockQueryBuilder = {
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: mockGetMany,
    };

    // mockear getRepository para que retorne el mockQueryBuilder
    const mockRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    // mockear AppDataSource.getRepository para que devuelva mockRepo
    jest.spyOn(AppDataSource, 'getRepository').mockReturnValue(mockRepo as any);

    service = new LogSistemaService();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debe retornar logs sin filtros', async () => {
    const result = await service.getAll({});

    expect(AppDataSource.getRepository).toHaveBeenCalledWith(LogSistema);
    expect(result).toHaveLength(1);
    expect(result[0].ciudad).toBe('Buenos Aires');
  });

  it('debe aplicar filtro ciudad', async () => {
    await service.getAll({ ciudad: 'Buenos' });

    const repo = AppDataSource.getRepository(LogSistema);
    expect(repo.createQueryBuilder).toHaveBeenCalled();

    const qb = repo.createQueryBuilder();

    expect(qb.andWhere).toHaveBeenCalledWith("log.ciudad ILIKE :ciudad", { ciudad: '%Buenos%' });
    expect(qb.orderBy).toHaveBeenCalledWith("log.fechaHora", "DESC");
    expect(qb.getMany).toHaveBeenCalled();
  });

  it('debe aplicar filtro resultadoConsulta', async () => {
    await service.getAll({ resultadoConsulta: 'OK' });

    const qb = AppDataSource.getRepository(LogSistema).createQueryBuilder();

    expect(qb.andWhere).toHaveBeenCalledWith("log.resultadoConsulta = :resultadoConsulta", { resultadoConsulta: 'OK' });
  });

  it('debe aplicar filtro fuenteNombre', async () => {
    await service.getAll({ fuenteNombre: 'Fuentes' });

    const qb = AppDataSource.getRepository(LogSistema).createQueryBuilder();

    expect(qb.andWhere).toHaveBeenCalledWith("log.fuenteNombre ILIKE :fuenteNombre", { fuenteNombre: '%Fuentes%' });
  });
});
