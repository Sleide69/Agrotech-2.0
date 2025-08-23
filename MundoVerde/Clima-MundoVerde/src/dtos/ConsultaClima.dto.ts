import { ClimaDTO } from "./Clima.dto";
import { ErrorConsultaDTO } from "./ErrorConsulta.dto";

export class ConsultaClimaRequestDTO {
    ciudad!: string;
}

export class ConsultaClimaResponseDTO {
    id!: number;
    ciudad!: string;
    latitud!: number;
    longitud!: number;
    fechaConsulta!: Date;
    exito!: boolean;
    fuenteNombre!: string;
    clima?: ClimaDTO;
    error?: ErrorConsultaDTO;
}
