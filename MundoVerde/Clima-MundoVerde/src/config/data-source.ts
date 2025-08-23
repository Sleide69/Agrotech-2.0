import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

import { FuenteClimatica } from '../entities/FuenteClimaticaEntity';
import { ConsultaClima } from '../entities/ConsultaClimaEntity';
import { Clima } from '../entities/ClimaEntity';
import { ErrorConsulta } from '../entities/ErrorConsultaEntity';
import { LogSistema } from '../entities/LogSistemaEntity';

export const AppDataSource = new DataSource({
    type: 'sqlite',
    database: process.env.DB_PATH || './database.sqlite',
    synchronize: process.env.NODE_ENV !== 'production', // En desarrollo solo. En producción usar migraciones.
    logging: process.env.NODE_ENV === 'development',
    entities: [FuenteClimatica, ConsultaClima, Clima, ErrorConsulta, LogSistema],
    migrations: [],
    subscribers: [],
});
