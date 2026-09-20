import { Router } from "express";
import { randomUUID } from "crypto";
import { Op } from "sequelize";
import { z } from "zod";
import { asyncHandler, HttpError } from "../../utils/asyncHandler.js";
import { hashPassword, verifyPassword } from "../../utils/security.js";
import { requireCliente, requireFuncionario, requirePerfil } from "../../middlewares/auth.js";
import { Cliente, Endereco, CartaoCredito, BandeiraCartao } from "../../models/index.js";

// RNF0031: Senha forte — mínimo 8 chars, ao menos 1 maiúscula, 1 minúscula e 1 especial
const senhaForteRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
const senhaForteMsg = "A senha deve ter pelo menos 8 caracteres, letras maiúsculas, minúsculas e caracteres especiais.";

const router = Router();

const clienteCreateSchema = z.object({
  nome: z.string().min(1),
  genero: z.string().min(1),
  data_nascimento: z.string(),
  cpf: z.string().min(1),
  telefone_tipo: z.string().min(1),
  telefone_ddd: z.string().min(1),
  telefone_numero: z.string().min(1),
  email: z.string().email(),
  senha: z.string().min(8).regex(senhaForteRegex, senhaForteMsg),
});

const clienteUpdateSchema = z.object({
  nome: z.string().optional(),
  genero: z.string().optional(),
  telefone_tipo: z.string().optional(),
  telefone_ddd: z.string().optional(),
  telefone_numero: z.string().optional(),
  email: z.string().email().optional(),
  senha: z.string().min(8).regex(senhaForteRegex, senhaForteMsg).optional(),
});

const senhaUpdateSchema = z.object({
  senha_atual: z.string().min(1),
  nova_senha: z.string().min(8).regex(senhaForteRegex, senhaForteMsg),
});

const enderecoAdminSchema = z.object({
  nome_identificador: z.string().min(1),
  tipo: z.enum(["ENTREGA", "COBRANCA", "AMBOS"]),
  tipo_residencia: z.string().min(1),
  tipo_logradouro: z.string().min(1),
  logradouro: z.string().min(1),
  numero: z.string().min(1),
  bairro: z.string().min(1),
  cep: z.string().min(1),
  cidade: z.string().min(1),
  estado: z.string().min(1),
  pais: z.string().min(1),
  observacoes: z.string().optional().nullable(),
  padrao: z.boolean().optional().default(false),
});

const cartaoAdminSchema = z.object({
  id_bandeira: z.number().int(),
  numero_cartao: z.string().min(1),
  nome_impresso: z.string().min(1),
  codigo_seguranca: z.string().min(3).max(4),
  preferencial: z.boolean().optional().default(false),
});

function toResponse(cliente) {
  const { senha_hash, ...rest } = cliente.toJSON();
  return rest;
}

// RF0021: cadastrar cliente
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = clienteCreateSchema.parse(req.body);

    if (await Cliente.findOne({ where: { email: payload.email } })) {
      throw new HttpError(409, "E-mail já cadastrado.");
    }
    if (await Cliente.findOne({ where: { cpf: payload.cpf } })) {
      throw new HttpError(409, "CPF já cadastrado.");
    }

    const cliente = await Cliente.create({
      codigo_cliente: `CLI-${randomUUID().slice(0, 8).toUpperCase()}`,
      nome: payload.nome,
      genero: payload.genero,
      data_nascimento: payload.data_nascimento,
      cpf: payload.cpf,
      telefone_tipo: payload.telefone_tipo,
      telefone_ddd: payload.telefone_ddd,
      telefone_numero: payload.telefone_numero,
      email: payload.email,
      senha_hash: await hashPassword(payload.senha),
    });

    res.status(201).json(toResponse(cliente));
  })
);

// RF0024: consultar meu próprio perfil
router.get(
  "/me",
  requireCliente,
  asyncHandler(async (req, res) => {
    res.json(toResponse(req.cliente));
  })
);

// RF0022: alterar meus dados
router.patch(
  "/me",
  requireCliente,
  asyncHandler(async (req, res) => {
    const payload = clienteUpdateSchema.parse(req.body);
    await req.cliente.update(payload);
    res.json(toResponse(req.cliente));
  })
);

// RF0028: alteração apenas de senha
router.patch(
  "/me/senha",
  requireCliente,
  asyncHandler(async (req, res) => {
    const { senha_atual, nova_senha } = senhaUpdateSchema.parse(req.body);
    if (!(await verifyPassword(senha_atual, req.cliente.senha_hash))) {
      throw new HttpError(400, "Senha atual incorreta.");
    }
    await req.cliente.update({ senha_hash: await hashPassword(nova_senha) });
    res.status(204).send();
  })
);

// RF0024: consulta de clientes por filtro combinado/isolado (admin)
router.get(
  "/",
  requireFuncionario,
  requirePerfil("ADMIN", "GERENTE_VENDAS"),
  asyncHandler(async (req, res) => {
    const { nome, cpf, email } = req.query;
    const where = {};
    if (nome) where.nome = { [Op.like]: `%${nome}%` };
    if (cpf) where.cpf = cpf;
    if (email) where.email = email;

    const clientes = await Cliente.findAll({ where });
    res.json(clientes.map(toResponse));
  })
);

// Atualizar cliente (admin)
router.patch(
  "/:idCliente",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const cliente = await Cliente.findByPk(req.params.idCliente);
    if (!cliente) throw new HttpError(404, "Cliente não encontrado.");
    const payload = clienteUpdateSchema.parse(req.body);
    if (payload.senha) { payload.senha_hash = await hashPassword(payload.senha); delete payload.senha; }
    if (payload.email && payload.email !== cliente.email) {
      if (await Cliente.findOne({ where: { email: payload.email } })) {
        throw new HttpError(409, "E-mail já cadastrado.");
      }
    }
    await cliente.update(payload);
    res.json(toResponse(cliente));
  })
);

// Excluir cliente (hard delete - admin)
router.delete(
  "/:idCliente",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const cliente = await Cliente.findByPk(req.params.idCliente);
    if (!cliente) throw new HttpError(404, "Cliente não encontrado.");
    await cliente.destroy();
    res.status(204).send();
  })
);

// RF0023: inativar cadastro de cliente (admin)
router.patch(
  "/:idCliente/inativar",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const cliente = await Cliente.findByPk(req.params.idCliente);
    if (!cliente) throw new HttpError(404, "Cliente não encontrado.");
    await cliente.update({ ativo: false, data_inativacao: new Date() });
    res.status(204).send();
  })
);

// Reativar cadastro de cliente (admin)
router.patch(
  "/:idCliente/ativar",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const cliente = await Cliente.findByPk(req.params.idCliente);
    if (!cliente) throw new HttpError(404, "Cliente não encontrado.");
    await cliente.update({ ativo: true, data_inativacao: null });
    res.status(204).send();
  })
);

// ═══════════════════════════════════════════════════════════════
// Rotas Admin para Endereços (RF0026) — admin gerencia endereços de um cliente
// ═══════════════════════════════════════════════════════════════

// GET /clientes/:idCliente/enderecos — listar endereços de um cliente
router.get(
  "/:idCliente/enderecos",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const cliente = await Cliente.findByPk(req.params.idCliente);
    if (!cliente) throw new HttpError(404, "Cliente não encontrado.");
    const enderecos = await Endereco.findAll({ where: { id_cliente: req.params.idCliente } });
    res.json(enderecos);
  })
);

// POST /clientes/:idCliente/enderecos — criar endereço para um cliente
router.post(
  "/:idCliente/enderecos",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const cliente = await Cliente.findByPk(req.params.idCliente);
    if (!cliente) throw new HttpError(404, "Cliente não encontrado.");
    const payload = enderecoAdminSchema.parse(req.body);
    const endereco = await Endereco.create({ id_cliente: Number(req.params.idCliente), ...payload });
    res.status(201).json(endereco);
  })
);

// DELETE /clientes/:idCliente/enderecos/:idEndereco — remover endereço de um cliente
router.delete(
  "/:idCliente/enderecos/:idEndereco",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const endereco = await Endereco.findByPk(req.params.idEndereco);
    if (!endereco || endereco.id_cliente !== Number(req.params.idCliente)) {
      throw new HttpError(404, "Endereço não encontrado.");
    }
    await endereco.destroy();
    res.status(204).send();
  })
);

// ═══════════════════════════════════════════════════════════════
// Rotas Admin para Cartões de Crédito (RF0027)
// ═══════════════════════════════════════════════════════════════

// GET /clientes/:idCliente/cartoes — listar cartões de um cliente
router.get(
  "/:idCliente/cartoes",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const cliente = await Cliente.findByPk(req.params.idCliente);
    if (!cliente) throw new HttpError(404, "Cliente não encontrado.");
    const cartoes = await CartaoCredito.findAll({
      where: { id_cliente: req.params.idCliente },
      include: [{ model: BandeiraCartao, attributes: ["nome"] }],
    });
    res.json(cartoes);
  })
);

// POST /clientes/:idCliente/cartoes — criar cartão para um cliente
router.post(
  "/:idCliente/cartoes",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const cliente = await Cliente.findByPk(req.params.idCliente);
    if (!cliente) throw new HttpError(404, "Cliente não encontrado.");
    const payload = cartaoAdminSchema.parse(req.body);
    if (payload.preferencial) {
      await CartaoCredito.update({ preferencial: false }, { where: { id_cliente: req.params.idCliente } });
    }
    const cartao = await CartaoCredito.create({ id_cliente: Number(req.params.idCliente), ...payload });
    res.status(201).json(cartao);
  })
);

// DELETE /clientes/:idCliente/cartoes/:idCartao — remover cartão de um cliente
router.delete(
  "/:idCliente/cartoes/:idCartao",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const cartao = await CartaoCredito.findByPk(req.params.idCartao);
    if (!cartao || cartao.id_cliente !== Number(req.params.idCliente)) {
      throw new HttpError(404, "Cartão não encontrado.");
    }
    await cartao.destroy();
    res.status(204).send();
  })
);

export default router;

