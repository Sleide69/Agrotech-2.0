import { AppDataSource } from '../config/data-source';
import { LogSistema } from '../entities/LogSistemaEntity';

export const logSistemaRepository = AppDataSource.getRepository(LogSistema);