import { Router } from "express";
import { randomUUID } from "crypto";
import { Op } from "sequelize";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { asyncHandler, HttpError } from "../../utils/asyncHandler.js";
import { requireFuncionario, requirePerfil } from "../../middlewares/auth.js";
import { Livro, Categoria, GrupoPrecificacao, Autor, Editora, LivroImagem } from "../../models/index.js";
import { upload, UPLOAD_BASE_URL, uploadLivroDir } from "../../config/upload.js";

const router = Router();

const PERFIS_LIVRO = ["ADMIN", "OPERADOR_ESTOQUE", "GERENTE_VENDAS"];

const livroCreateSchema = z.object({
  titulo: z.string().min(1),
  isbn: z.string().min(1),
  id_autor: z.number().int().optional(),
  novo_autor: z.string().min(1).optional(),
  id_editora: z.number().int().optional(),
  nova_editora: z.string().min(1).optional(),
  ano_publicacao: z.number().int(),
  edicao: z.string().min(1),
  num_paginas: z.number().int().positive(),
  sinopse: z.string().min(1),
  altura: z.number().nonnegative(),
  largura: z.number().nonnegative(),
  peso: z.number().nonnegative(),
  profundidade: z.number().nonnegative(),
  codigo_barras: z.string().min(1),
  id_grupo_precificacao: z.number().int(),
  valor_custo: z.number().nonnegative(),
  categorias: z.array(z.number().int()).optional().default([]),
}).refine((d) => d.id_autor || d.novo_autor, { message: "Informe um autor ou crie um novo.", path: ["id_autor"] })
  .refine((d) => d.id_editora || d.nova_editora, { message: "Informe uma editora ou crie uma nova.", path: ["id_editora"] });

const livroUpdateSchema = z.object({
  titulo: z.string().min(1).optional(),
  isbn: z.string().min(1).optional(),
  id_autor: z.number().int().optional(),
  novo_autor: z.string().min(1).optional(),
  id_editora: z.number().int().optional(),
  nova_editora: z.string().min(1).optional(),
  ano_publicacao: z.number().int().optional(),
  edicao: z.string().min(1).optional(),
  num_paginas: z.number().int().positive().optional(),
  sinopse: z.string().min(1).optional(),
  altura: z.number().nonnegative().optional(),
  largura: z.number().nonnegative().optional(),
  peso: z.number().nonnegative().optional(),
  profundidade: z.number().nonnegative().optional(),
  codigo_barras: z.string().min(1).optional(),
  id_grupo_precificacao: z.number().int().optional(),
  valor_custo: z.number().nonnegative().optional(),
  categorias: z.array(z.number().int()).optional(),
});

const statusSchema = z.object({
  id_motivo: z.number().int(),
  justificativa: z.string().min(1),
});

const includeAdmin = [
  { model: Autor },
  { model: Editora },
  { model: GrupoPrecificacao },
  { model: Categoria, through: { attributes: [] } },
  { model: LivroImagem, as: "imagens" },
];

async function resolverAutorEditora(payload) {
  let id_autor = payload.id_autor;
  let id_editora = payload.id_editora;

  if (!id_autor && payload.novo_autor) {
    const [autor] = await Autor.findOrCreate({ where: { nome: payload.novo_autor } });
    id_autor = autor.id_autor;
  }

  if (!id_editora && payload.nova_editora) {
    const [editora] = await Editora.findOrCreate({ where: { nome: payload.nova_editora } });
    id_editora = editora.id_editora;
  }

  return { id_autor, id_editora };
}

async function calcularValorVenda(idGrupo, valorCusto) {
  const grupo = await GrupoPrecificacao.findByPk(idGrupo);
  if (!grupo) throw new HttpError(400, "Grupo de precificação inválido.");
  return valorCusto * (1 + Number(grupo.margem_lucro_percentual) / 100);
}

async function atualizarCategorias(livro, categorias) {
  if (categorias !== undefined) {
    const registros = await Categoria.findAll({ where: { id_categoria: categorias } });
    await livro.setCategorias(registros);
  }
}

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

    const include = [
      { model: Autor },
      { model: Editora },
      { model: Categoria, through: { attributes: [] } },
      { model: LivroImagem, as: "imagens", where: { tipo: "CAPA" }, required: false },
    ];
    if (id_categoria) {
      include[2].where = { id_categoria: Number(id_categoria) };
    }

    const livros = await Livro.findAll({ where, include, order: [["id_livro", "DESC"]] });
    res.json(livros);
  })
);

// Listagem completa para admin
router.get(
  "/admin/todos",
  requireFuncionario,
  requirePerfil(...PERFIS_LIVRO),
  asyncHandler(async (req, res) => {
    const { titulo, ativo } = req.query;
    const where = {};
    if (titulo) where.titulo = { [Op.like]: `%${titulo}%` };
    if (ativo !== undefined) where.ativo = ativo === "true";

    const livros = await Livro.findAll({ where, include: includeAdmin, order: [["id_livro", "DESC"]] });
    res.json(livros);
  })
);

router.get(
  "/:idLivro",
  asyncHandler(async (req, res) => {
    const livro = await Livro.findByPk(req.params.idLivro, { include: includeAdmin });
    if (!livro) throw new HttpError(404, "Livro não encontrado.");
    res.json(livro);
  })
);

// RN0011 / RN0013: dados obrigatórios e valor de venda calculado pela margem do grupo
router.post(
  "/",
  requireFuncionario,
  requirePerfil(...PERFIS_LIVRO),
  asyncHandler(async (req, res) => {
    const payload = livroCreateSchema.parse(req.body);

    if (await Livro.findOne({ where: { isbn: payload.isbn } })) {
      throw new HttpError(409, "ISBN já cadastrado.");
    }

    const { id_autor, id_editora } = await resolverAutorEditora(payload);
    const valorVenda = await calcularValorVenda(payload.id_grupo_precificacao, payload.valor_custo);

    const livro = await Livro.create({
      codigo_livro: `LIV-${randomUUID().slice(0, 8).toUpperCase()}`,
      ...payload,
      id_autor,
      id_editora,
      valor_venda: valorVenda,
    });

    const livroComCategorias = await Livro.findByPk(livro.id_livro, { include: [{ model: Categoria, through: { attributes: [] } }] });
    await atualizarCategorias(livroComCategorias, payload.categorias);

    res.status(201).json(await Livro.findByPk(livro.id_livro, { include: includeAdmin }));
  })
);

router.patch(
  "/:idLivro",
  requireFuncionario,
  requirePerfil(...PERFIS_LIVRO),
  asyncHandler(async (req, res) => {
    const payload = livroUpdateSchema.parse(req.body);
    const livro = await Livro.findByPk(req.params.idLivro);
    if (!livro) throw new HttpError(404, "Livro não encontrado.");

    const { id_autor, id_editora } = await resolverAutorEditora(payload);
    const { categorias, novo_autor, nova_editora, ...dados } = payload;

    if (dados.id_grupo_precificacao !== undefined || dados.valor_custo !== undefined) {
      dados.valor_venda = await calcularValorVenda(
        dados.id_grupo_precificacao ?? livro.id_grupo_precificacao,
        dados.valor_custo ?? livro.valor_custo
      );
    }

    await livro.update({ ...dados, id_autor, id_editora });
    const livroComCategorias = await Livro.findByPk(livro.id_livro, { include: [{ model: Categoria, through: { attributes: [] } }] });
    await atualizarCategorias(livroComCategorias, categorias);

    res.json(await Livro.findByPk(livro.id_livro, { include: includeAdmin }));
  })
);

// RF0012 / RN0015: inativação manual exige motivo e justificativa
router.patch(
  "/:idLivro/inativar",
  requireFuncionario,
  requirePerfil(...PERFIS_LIVRO),
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
  requirePerfil(...PERFIS_LIVRO),
  asyncHandler(async (req, res) => {
    const payload = statusSchema.parse(req.body);
    const livro = await Livro.findByPk(req.params.idLivro);
    if (!livro) throw new HttpError(404, "Livro não encontrado.");
    await livro.update({ ativo: true, id_motivo_status: payload.id_motivo, justificativa_status: payload.justificativa });
    res.json(livro);
  })
);

// Exclusão definitiva (hard delete) com remoção de arquivos
router.delete(
  "/:idLivro",
  requireFuncionario,
  requirePerfil(...PERFIS_LIVRO),
  asyncHandler(async (req, res) => {
    const livro = await Livro.findByPk(req.params.idLivro, { include: [{ model: LivroImagem, as: "imagens" }] });
    if (!livro) throw new HttpError(404, "Livro não encontrado.");

    for (const imagem of livro.imagens || []) {
      const caminho = path.join(uploadLivroDir(livro.id_livro), imagem.nome_arquivo);
      if (fs.existsSync(caminho)) fs.unlinkSync(caminho);
    }

    const dir = uploadLivroDir(livro.id_livro);
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });

    await livro.destroy();
    res.status(204).send();
  })
);

// Upload de imagem
router.post(
  "/:idLivro/imagens",
  requireFuncionario,
  requirePerfil(...PERFIS_LIVRO),
  upload.single("imagem"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, "Nenhuma imagem enviada.");
    const livro = await Livro.findByPk(req.params.idLivro);
    if (!livro) throw new HttpError(404, "Livro não encontrado.");

    const tipo = req.body.tipo === "CAPA" ? "CAPA" : "GALERIA";
    const url = `${UPLOAD_BASE_URL}/${req.params.idLivro}/${req.file.filename}`;

    if (tipo === "CAPA") {
      await LivroImagem.update({ tipo: "GALERIA" }, { where: { id_livro: livro.id_livro, tipo: "CAPA" } });
      await livro.update({ imagem_principal_url: url });
    }

    const imagem = await LivroImagem.create({
      id_livro: livro.id_livro,
      tipo,
      url_imagem: url,
      nome_arquivo: req.file.filename,
      ordem: Number(req.body.ordem) || 0,
    });

    res.status(201).json(imagem);
  })
);

// Remover imagem
router.delete(
  "/:idLivro/imagens/:idImagem",
  requireFuncionario,
  requirePerfil(...PERFIS_LIVRO),
  asyncHandler(async (req, res) => {
    const imagem = await LivroImagem.findOne({ where: { id_imagem: req.params.idImagem, id_livro: req.params.idLivro } });
    if (!imagem) throw new HttpError(404, "Imagem não encontrada.");

    const caminho = path.join(uploadLivroDir(req.params.idLivro), imagem.nome_arquivo);
    if (fs.existsSync(caminho)) fs.unlinkSync(caminho);

    if (imagem.tipo === "CAPA") {
      await Livro.update({ imagem_principal_url: null }, { where: { id_livro: req.params.idLivro } });
    }

    await imagem.destroy();
    res.status(204).send();
  })
);

// Rotas de apoio para selects
router.get("/opcoes/autores", asyncHandler(async (req, res) => res.json(await Autor.findAll({ order: [["nome", "ASC"]] }))));
router.get("/opcoes/editoras", asyncHandler(async (req, res) => res.json(await Editora.findAll({ order: [["nome", "ASC"]] }))));
router.get("/opcoes/categorias", asyncHandler(async (req, res) => res.json(await Categoria.findAll({ order: [["nome", "ASC"]] }))));
router.get("/opcoes/grupos-precificacao", asyncHandler(async (req, res) => res.json(await GrupoPrecificacao.findAll({ order: [["nome", "ASC"]] }))));

export default router;
