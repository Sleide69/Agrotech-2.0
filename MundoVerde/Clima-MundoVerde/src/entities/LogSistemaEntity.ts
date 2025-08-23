import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ConsultaClima } from './ConsultaClimaEntity';

@Entity()
export class LogSistema {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => ConsultaClima, consulta => consulta.logs)
    @JoinColumn({ name: 'consultaId' })
    consulta!: ConsultaClima;

    @Column()
    fuenteNombre!: string;

    @Column()
    ciudad!: string;

    @Column()
    resultadoConsulta!: string;

    @Column()
    mensaje!: string;

    @Column()
    fechaHora!: Date;
}
