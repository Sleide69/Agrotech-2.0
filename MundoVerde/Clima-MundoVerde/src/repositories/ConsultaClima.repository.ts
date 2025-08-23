import { AppDataSource } from '../config/data-source';
import { ConsultaClima } from '../entities/ConsultaClimaEntity';

export const consultaClimaRepository = AppDataSource.getRepository(ConsultaClima);