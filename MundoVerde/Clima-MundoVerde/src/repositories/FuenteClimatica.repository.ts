import { AppDataSource } from '../config/data-source';
import { FuenteClimatica } from '../entities/FuenteClimaticaEntity';

export const fuenteClimaticaRepository = AppDataSource.getRepository(FuenteClimatica);