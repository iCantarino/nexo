import { decodeAccessToken } from "../utils/security.js";
import { HttpError, asyncHandler } from "../utils/asyncHandler.js";
import { Cliente, Funcionario } from "../models/index.js";

function extractToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

/** Exige um cliente autenticado; popula req.cliente. */
export const requireCliente = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw new HttpError(401, "Não foi possível validar as credenciais.");

  const payload = decodeAccessToken(token);
  if (!payload || payload.tipo !== "cliente") {
    throw new HttpError(401, "Não foi possível validar as credenciais.");
  }

  const cliente = await Cliente.findByPk(Number(payload.sub));
  if (!cliente || !cliente.ativo) {
    throw new HttpError(401, "Não foi possível validar as credenciais.");
  }

  req.cliente = cliente;
  next();
});

/** Exige um funcionário autenticado; popula req.funcionario. */
export const requireFuncionario = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw new HttpError(401, "Não foi possível validar as credenciais.");

  const payload = decodeAccessToken(token);
  if (!payload || payload.tipo !== "funcionario") {
    throw new HttpError(401, "Não foi possível validar as credenciais.");
  }

  const funcionario = await Funcionario.findByPk(Number(payload.sub));
  if (!funcionario || !funcionario.ativo) {
    throw new HttpError(401, "Não foi possível validar as credenciais.");
  }

  req.funcionario = funcionario;
  next();
});

/** Restringe a rota a determinados perfis de funcionário (ADMIN, GERENTE_VENDAS, ...). */
export function requirePerfil(...perfis) {
  return (req, res, next) => {
    if (!req.funcionario || !perfis.includes(req.funcionario.perfil)) {
      throw new HttpError(403, "Perfil sem permissão para esta operação.");
    }
    next();
  };
}
