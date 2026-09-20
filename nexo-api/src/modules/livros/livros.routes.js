import { Router } from "express";
import { randomUUID } from "crypto";
import { Op } from "sequelize";
import { z } from "zod";
import { asyncHandler, HttpError } from "../../utils/asyncHandler.js";
import { requireFuncionario, requirePerfil } from "../../middlewares/auth.js";
import { Livro, Categoria, GrupoPrecificacao } from "../../models/index.js";

const router = Router();

const livroCreateSchema = z.object({
  titulo: z.string().min(1),
  isbn: z.string().min(1),
  id_autor: z.number().int(),
  id_editora: z.number().int(),
  ano_publicacao: z.number().int(),
  edicao: z.string().min(1),
  num_paginas: z.number().int().positive(),
  sinopse: z.string().min(1),
  altura: z.number(),
  largura: z.number(),
  peso: z.number(),
  profundidade: z.number(),
  codigo_barras: z.string().min(1),
  id_grupo_precificacao: z.number().int(),
  valor_custo: z.number().nonnegative(),
  categorias: z.array(z.number().int()).optional().default([]),
});

const livroUpdateSchema = z.object({
  titulo: z.string().optional(),
  sinopse: z.string().optional(),
  valor_custo: z.number().optional(),
  id_grupo_precificacao: z.number().int().optional(),
  categorias: z.array(z.number().int()).optional(),
});

const statusSchema = z.object({
  id_motivo: z.number().int(),
  justificativa: z.string().min(1),
});

// RF0015: consulta combinada/isolada por qualquer campo de identificação
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { titulo, isbn, id_autor, id_categoria, ativo } = req.query;
    const where = {};
    if (titulo) where.titulo = { [Op.like]: `%${titulo}%` };
    if (isbn) where.isbn = isbn;
    if (id_autor) where.id_autor = Number(id_autor);
    if (ativo !== undefined) where.ativo = ativo === "true";

    const include = [{ model: Categoria, through: { attributes: [] } }];
    if (id_categoria) {
      include[0].where = { id_categoria: Number(id_categoria) };
    }

    const livros = await Livro.findAll({ where, include });
    res.json(livros);
  })
);

router.get(
  "/:idLivro",
  asyncHandler(async (req, res) => {
    const livro = await Livro.findByPk(req.params.idLivro, { include: [Categoria] });
    if (!livro) throw new HttpError(404, "Livro não encontrado.");
    res.json(livro);
  })
);

// RN0011 / RN0013: dados obrigatórios e valor de venda calculado pela margem do grupo
router.post(
  "/",
  requireFuncionario,
  requirePerfil("ADMIN", "OPERADOR_ESTOQUE"),
  asyncHandler(async (req, res) => {
    const payload = livroCreateSchema.parse(req.body);

    if (await Livro.findOne({ where: { isbn: payload.isbn } })) {
      throw new HttpError(409, "ISBN já cadastrado.");
    }

    const grupo = await GrupoPrecificacao.findByPk(payload.id_grupo_precificacao);
    if (!grupo) throw new HttpError(400, "Grupo de precificação inválido.");

    const valorVenda = payload.valor_custo * (1 + Number(grupo.margem_lucro_percentual) / 100);

    const livro = await Livro.create({
      codigo_livro: `LIV-${randomUUID().slice(0, 8).toUpperCase()}`,
      ...payload,
      valor_venda: valorVenda,
    });

    if (payload.categorias.length) {
      const categorias = await Categoria.findAll({ where: { id_categoria: payload.categorias } });
      await livro.setCategorias(categorias);
    }

    res.status(201).json(livro);
  })
);

router.patch(
  "/:idLivro",
  requireFuncionario,
  requirePerfil("ADMIN", "OPERADOR_ESTOQUE"),
  asyncHandler(async (req, res) => {
    const payload = livroUpdateSchema.parse(req.body);
    const livro = await Livro.findByPk(req.params.idLivro);
    if (!livro) throw new HttpError(404, "Livro não encontrado.");

    const { categorias, ...dados } = payload;
    await livro.update(dados);

    if (categorias !== undefined) {
      const registros = await Categoria.findAll({ where: { id_categoria: categorias } });
      await livro.setCategorias(registros);
    }

    res.json(livro);
  })
);

// RF0012 / RN0015: inativação manual exige motivo e justificativa
router.patch(
  "/:idLivro/inativar",
  requireFuncionario,
  requirePerfil("ADMIN", "OPERADOR_ESTOQUE"),
  asyncHandler(async (req, res) => {
    const payload = statusSchema.parse(req.body);
    const livro = await Livro.findByPk(req.params.idLivro);
    if (!livro) throw new HttpError(404, "Livro não encontrado.");
    await livro.update({ ativo: false, id_motivo_status: payload.id_motivo, justificativa_status: payload.justificativa });
    res.json(livro);
  })
);

// RF0016 / RN0017: ativação exige motivo e justificativa
router.patch(
  "/:idLivro/ativar",
  requireFuncionario,
  requirePerfil("ADMIN", "OPERADOR_ESTOQUE"),
  asyncHandler(async (req, res) => {
    const payload = statusSchema.parse(req.body);
    const livro = await Livro.findByPk(req.params.idLivro);
    if (!livro) throw new HttpError(404, "Livro não encontrado.");
    await livro.update({ ativo: true, id_motivo_status: payload.id_motivo, justificativa_status: payload.justificativa });
    res.json(livro);
  })
);

export default router;
