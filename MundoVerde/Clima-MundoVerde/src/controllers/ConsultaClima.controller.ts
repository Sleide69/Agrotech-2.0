import { Request, Response } from 'express';
import { ConsultaClimaService } from '../services/ConsultaClima.service';

const consultaClimaService = new ConsultaClimaService();

export class ConsultaClimaController {
    async obtenerClimaPorCiudad(req: Request, res: Response) {
        const ciudad = req.query.ciudad as string; // <-- Cambiar aquí

        if (!ciudad) {
            return res.status(400).json({ error: 'La ciudad es requerida' });
        }

        try {
            const resultado = await consultaClimaService.consultarPorCiudad(ciudad);
            return res.json(resultado);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Error interno del servidor' });
    }
}
}
