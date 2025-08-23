import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { FuenteClimatica } from './FuenteClimaticaEntity';
import { Clima } from './ClimaEntity';
import { ErrorConsulta } from './ErrorConsultaEntity';
import { LogSistema } from './LogSistemaEntity';

@Entity()
export class ConsultaClima {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => FuenteClimatica, fuente => fuente.consultas)
    @JoinColumn({ name: 'fuenteId' })
    fuente!: FuenteClimatica;

    @Column()
    ciudad!: string;

    @Column('real')
    latitud!: number;

    @Column('real')
    longitud!: number;

    @Column()
    fechaConsulta!: Date;

    @Column()
    exito!: boolean;

    @OneToOne(() => Clima, clima => clima.consulta)
    clima!: Clima;

    @OneToOne(() => ErrorConsulta, error => error.consulta)
    error!: ErrorConsulta;

    @OneToMany(() => LogSistema, log => log.consulta)
    logs!: LogSistema[];
}
