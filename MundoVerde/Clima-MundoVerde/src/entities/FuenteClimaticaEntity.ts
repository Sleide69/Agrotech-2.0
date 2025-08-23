import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ConsultaClima } from './ConsultaClimaEntity';

@Entity()
export class FuenteClimatica {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nombre!: string;

    @Column()
    urlBase!: string;

    @OneToMany(() => ConsultaClima, consulta => consulta.fuente)
    consultas!: ConsultaClima[];
}
