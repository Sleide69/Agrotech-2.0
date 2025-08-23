import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { ConsultaClima } from './ConsultaClimaEntity';

@Entity()
export class Clima {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(() => ConsultaClima, consulta => consulta.clima)
    @JoinColumn({ name: 'consultaId' })
    consulta!: ConsultaClima;

    @Column('real')
    temperatura!: number;

    @Column('real')
    humedad!: number;

    @Column()
    descripcion!: string;

    @Column('real')
    viento!: number;

    @Column('real')
    presion!: number;
}
