import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { ConsultaClima } from './ConsultaClimaEntity';

@Entity()
export class ErrorConsulta {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(() => ConsultaClima, consulta => consulta.error)
    @JoinColumn({ name: 'consultaId' })
    consulta!: ConsultaClima;

    @Column()
    codigoError!: string;

    @Column()
    mensaje!: string;

    @Column()
    fechaError!: Date;
}
