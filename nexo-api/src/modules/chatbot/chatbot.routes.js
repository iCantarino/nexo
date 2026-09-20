import { Router } from "express";
import { Op } from "sequelize";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireCliente } from "../../middlewares/auth.js";
import {
  InteracaoChatbot,
  RecomendacaoIA,
  Livro,
  Categoria,
  LivroCategoria,
  Avaliacao,
  ItemPedido,
  Pedido,
} from "../../models/index.js";

const router = Router();

const mensagemSchema = z.object({ mensagem: z.string().min(1) });

/** Deriva categorias preferidas a partir do histórico de compras e avaliações. */
async function categoriasPreferidas(idCliente) {
  // Livros comprados pelo cliente (via pedidos -> itens de pedido).
  const pedidos = await Pedido.findAll({ where: { id_cliente: idCliente }, attributes: ["id_pedido"] });
  const idsPedidos = pedidos.map((p) => p.id_pedido);
  const itensComprados = idsPedidos.length
    ? await ItemPedido.findAll({ where: { id_pedido: { [Op.in]: idsPedidos } }, attributes: ["id_livro"] })
    : [];
  const livroIdsComprados = itensComprados.map((i) => i.id_livro);

  // Livros bem avaliados (>=4 estrelas) pelo cliente.
  const avaliacoesBoas = await Avaliacao.findAll({
    where: { id_cliente: idCliente, estrelas: { [Op.gte]: 4 } },
    attributes: ["id_livro"],
  });
  const livroIdsAvaliados = avaliacoesBoas.map((a) => a.id_livro);

  const livroIds = Array.from(new Set([...livroIdsComprados, ...livroIdsAvaliados]));
  if (!livroIds.length) return [];

  const categoriasRelacionadas = await LivroCategoria.findAll({
    where: { id_livro: { [Op.in]: livroIds } },
    attributes: ["id_categoria"],
  });
  return Array.from(new Set(categoriasRelacionadas.map((c) => c.id_categoria)));
}

/** Ponto de extensão: plugue aqui a chamada a um modelo de IA generativa. */
async function gerarRespostaIA(mensagem, idCliente) {
  const categorias = await categoriasPreferidas(idCliente);
  const include = categorias.length ? [{ model: Categoria, where: { id_categoria: { [Op.in]: categorias } } }] : [];
  const livros = await Livro.findAll({ where: { ativo: true }, include, limit: 5 });

  if (!livros.length) {
    return {
      resposta:
        "Olá! Ainda não tenho histórico suficiente sobre você, mas posso sugerir os títulos mais bem avaliados do catálogo.",
      livrosIds: [],
    };
  }
  const titulos = livros.map((l) => l.titulo).join(", ");
  return {
    resposta: `Com base no seu perfil de leitura, recomendo: ${titulos}.`,
    livrosIds: livros.map((l) => l.id_livro),
  };
}

router.post(
  "/mensagem",
  requireCliente,
  asyncHandler(async (req, res) => {
    const { mensagem } = mensagemSchema.parse(req.body);
    const { resposta, livrosIds } = await gerarRespostaIA(mensagem, req.cliente.id_cliente);

    await InteracaoChatbot.create({
      id_cliente: req.cliente.id_cliente,
      mensagem_cliente: mensagem,
      resposta_ia: resposta,
    });

    for (const idLivro of livrosIds) {
      await RecomendacaoIA.create({
        id_cliente: req.cliente.id_cliente,
        id_livro: idLivro,
        score: 0.8,
        origem: "CHATBOT",
      });
    }

    res.json({ resposta, livros_recomendados: livrosIds });
  })
);

router.get(
  "/historico",
  requireCliente,
  asyncHandler(async (req, res) => {
    const historico = await InteracaoChatbot.findAll({
      where: { id_cliente: req.cliente.id_cliente },
      order: [["data_interacao", "DESC"]],
    });
    res.json(historico);
  })
);

// RNF0044-1: recomendações personalizadas com base em histórico e preferências.
router.get(
  "/recomendacoes",
  requireCliente,
  asyncHandler(async (req, res) => {
    const categorias = await categoriasPreferidas(req.cliente.id_cliente);
    const include = categorias.length ? [{ model: Categoria, where: { id_categoria: { [Op.in]: categorias } } }] : [];
    const livros = await Livro.findAll({ where: { ativo: true }, include, limit: 10 });

    const recomendacoes = [];
    for (const livro of livros) {
      const rec = await RecomendacaoIA.create({
        id_cliente: req.cliente.id_cliente,
        id_livro: livro.id_livro,
        score: 0.75,
        origem: "HISTORICO_COMPRA",
      });
      recomendacoes.push(rec);
    }
    res.json(recomendacoes);
  })
);

export default router;
