import { AppDataSource } from "../config/data-source";
import { LogSistema } from "../entities/LogSistemaEntity";

export class LogSistemaService {
  private repo = AppDataSource.getRepository(LogSistema);

  async getAll(params: {
    ciudad?: string;
    resultadoConsulta?: string;
    fuenteNombre?: string;
  }) {
    const query = this.repo.createQueryBuilder("log");

    if (params.ciudad) query.andWhere("log.ciudad ILIKE :ciudad", { ciudad: `%${params.ciudad}%` });
    if (params.resultadoConsulta) query.andWhere("log.resultadoConsulta = :resultadoConsulta", { resultadoConsulta: params.resultadoConsulta });
    if (params.fuenteNombre) query.andWhere("log.fuenteNombre ILIKE :fuenteNombre", { fuenteNombre: `%${params.fuenteNombre}%` });

    query.orderBy("log.fechaHora", "DESC");

    return query.getMany();
  }
}
