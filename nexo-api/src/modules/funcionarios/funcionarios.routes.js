import { Router } from "express";
import { randomUUID } from "crypto";
import { Op } from "sequelize";
import { z } from "zod";
import { asyncHandler, HttpError } from "../../utils/asyncHandler.js";
import { hashPassword } from "../../utils/security.js";
import { requireFuncionario, requirePerfil } from "../../middlewares/auth.js";
import { Funcionario } from "../../models/index.js";

const router = Router();

const funcionarioCreateSchema = z.object({
  nome: z.string().min(1),
  email: z.string().email(),
  senha: z.string().min(6),
  perfil: z.enum(["ADMIN", "GERENTE_VENDAS", "ESTOQUISTA", "ATENDENTE"]),
  ativo: z.boolean().default(true),
});

const funcionarioUpdateSchema = z.object({
  nome: z.string().min(1).optional(),
  email: z.string().email().optional(),
  perfil: z.enum(["ADMIN", "GERENTE_VENDAS", "ESTOQUISTA", "ATENDENTE"]).optional(),
  ativo: z.boolean().optional(),
});

function toResponse(funcionario) {
  const { senha_hash, ...rest } = funcionario.toJSON();
  return rest;
}

// Listar todos os funcionários (apenas ADMIN)
router.get(
  "/",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const { nome, email, perfil, ativo } = req.query;
    const where = {};
    
    if (nome) where.nome = { [Op.like]: `%${nome}%` };
    if (email) where.email = email;
    if (perfil) where.perfil = perfil;
    if (ativo !== undefined) where.ativo = ativo === "true";

    const funcionarios = await Funcionario.findAll({ 
      where,
      order: [["data_cadastro", "DESC"]]
    });
    res.json(funcionarios.map(toResponse));
  })
);

// Buscar funcionário por ID
router.get(
  "/:id",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const funcionario = await Funcionario.findByPk(req.params.id);
    if (!funcionario) throw new HttpError(404, "Funcionário não encontrado.");
    res.json(toResponse(funcionario));
  })
);

// Criar novo funcionário
router.post(
  "/",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const payload = funcionarioCreateSchema.parse(req.body);

    if (await Funcionario.findOne({ where: { email: payload.email } })) {
      throw new HttpError(409, "E-mail já cadastrado.");
    }

    const funcionario = await Funcionario.create({
      codigo_funcionario: `FUNC-${randomUUID().slice(0, 8).toUpperCase()}`,
      nome: payload.nome,
      email: payload.email,
      senha_hash: await hashPassword(payload.senha),
      perfil: payload.perfil,
      ativo: payload.ativo,
    });

    res.status(201).json(toResponse(funcionario));
  })
);

// Atualizar funcionário
router.patch(
  "/:id",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const funcionario = await Funcionario.findByPk(req.params.id);
    if (!funcionario) throw new HttpError(404, "Funcionário não encontrado.");

    const payload = funcionarioUpdateSchema.parse(req.body);

    if (payload.email && payload.email !== funcionario.email) {
      if (await Funcionario.findOne({ where: { email: payload.email } })) {
        throw new HttpError(409, "E-mail já cadastrado.");
      }
    }

    await funcionario.update(payload);
    res.json(toResponse(funcionario));
  })
);

// Inativar funcionário (soft delete)
router.patch(
  "/:id/inativar",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const funcionario = await Funcionario.findByPk(req.params.id);
    if (!funcionario) throw new HttpError(404, "Funcionário não encontrado.");
    
    // Não permite inativar a si mesmo
    if (funcionario.id_funcionario === req.funcionario.id_funcionario) {
      throw new HttpError(400, "Não é possível inativar seu próprio usuário.");
    }

    await funcionario.update({ ativo: false });
    res.status(204).send();
  })
);

// Ativar funcionário
router.patch(
  "/:id/ativar",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const funcionario = await Funcionario.findByPk(req.params.id);
    if (!funcionario) throw new HttpError(404, "Funcionário não encontrado.");

    await funcionario.update({ ativo: true });
    res.status(204).send();
  })
);

// Excluir funcionário (hard delete)
router.delete(
  "/:id",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const funcionario = await Funcionario.findByPk(req.params.id);
    if (!funcionario) throw new HttpError(404, "Funcionário não encontrado.");

    // Não permite excluir a si mesmo
    if (funcionario.id_funcionario === req.funcionario.id_funcionario) {
      throw new HttpError(400, "Não é possível excluir seu próprio usuário.");
    }

    await funcionario.destroy();
    res.status(204).send();
  })
);

export default router;
