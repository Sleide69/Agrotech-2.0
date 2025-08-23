import { AppDataSource } from '../config/data-source';
import { Clima } from '../entities/ClimaEntity';

export const climaRepository = AppDataSource.getRepository(Clima);