import { AppDataSource } from "../config/data-source";
import { FuenteClimatica } from "../entities/FuenteClimaticaEntity";

export class FuenteClimaticaService {
  private repo = AppDataSource.getRepository(FuenteClimatica);

  async getAll() {
    return this.repo.find();
  }
}
