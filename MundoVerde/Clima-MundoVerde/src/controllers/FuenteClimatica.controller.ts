// controllers/fuente.controller.ts
import { Request, Response } from "express";
import { FuenteClimaticaService } from "../services/FuenteClimatica.service";

const fuenteService = new FuenteClimaticaService();

export const getAllFuentes = async (_req: Request, res: Response) => {
  const fuentes = await fuenteService.getAll();
  res.json(fuentes);
};
