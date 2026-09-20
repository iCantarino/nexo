import { HttpError } from '../utils/asyncHandler.js';
import { ZodError } from 'zod';

export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) { return res.status(400).json({ detail: 'Erro de valida\u00e7\u00e3o.', erros: err.errors }); }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ detail: err.message });
  }

  if (err?.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({ detail: "Registro duplicado.", detalhes: err.errors?.map((e) => e.message) });
  }

  console.error(err);
  return res.status(500).json({ detail: "Erro interno do servidor." });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ detail: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
}

