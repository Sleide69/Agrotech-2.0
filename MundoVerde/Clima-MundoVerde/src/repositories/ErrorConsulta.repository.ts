import { AppDataSource } from '../config/data-source';
import { ErrorConsulta } from '../entities/ErrorConsultaEntity';

export const errorConsultaRepository = AppDataSource.getRepository(ErrorConsulta);