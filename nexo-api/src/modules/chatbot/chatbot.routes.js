import { Router } from "express";
import { Op } from "sequelize";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireCliente } from "../../middlewares/auth.js";
import {
  gerarRespostaIA,
  registrarInteracao,
  registrarFeedback,
  gerarRecomendacoesPerfil,
  construirPerfilLeitura,
} from "./chatbot.service.js";
import { Livro, InteracaoChatbot } from "../../models/index.js";

const router = Router();

const mensagemSchema = z.object({ mensagem: z.string().min(1) });
const feedbackSchema = z.object({ feedback: z.enum(["UTIL", "NAO_UTIL"]) });

// RNF0044-2: interação via chatbot
router.post(
  "/mensagem",
  requireCliente,
  asyncHandler(async (req, res) => {
    const { mensagem } = mensagemSchema.parse(req.body);
    const { resposta, livrosIds } = await gerarRespostaIA(mensagem, req.cliente.id_cliente);

    const interacao = await registrarInteracao(req.cliente.id_cliente, mensagem, resposta, livrosIds);

    const livros = await Livro.findAll({
      where: { id_livro: { [Op.in]: livrosIds } },
      attributes: ["id_livro", "titulo", "valor_venda"],
    });

    res.json({
      id_interacao: interacao.id_interacao,
      resposta,
      livros_recomendados: livros,
    });
  })
);

// Histórico de conversas do cliente
router.get(
  "/historico",
  requireCliente,
  asyncHandler(async (req, res) => {
    const historico = await InteracaoChatbot.findAll({
      where: { id_cliente: req.cliente.id_cliente },
      order: [["data_interacao", "ASC"]],
    });
    res.json(historico);
  })
);

// RNF0044-3: avaliação da resposta como útil ou não útil
router.post(
  "/mensagem/:idInteracao/feedback",
  requireCliente,
  asyncHandler(async (req, res) => {
    const { idInteracao } = req.params;
    const { feedback } = feedbackSchema.parse(req.body);
    const interacao = await registrarFeedback(Number(idInteracao), req.cliente.id_cliente, feedback);
    res.json(interacao);
  })
);

// Perfil de leitura do cliente
router.get(
  "/perfil-leitura",
  requireCliente,
  asyncHandler(async (req, res) => {
    const perfil = await construirPerfilLeitura(req.cliente.id_cliente);
    res.json(perfil);
  })
);

// RNF0044-1: recomendações personalizadas
router.get(
  "/recomendacoes",
  requireCliente,
  asyncHandler(async (req, res) => {
    const { perfil, recomendacoes } = await gerarRecomendacoesPerfil(req.cliente.id_cliente, 5);
    res.json({ perfil, recomendacoes });
  })
);

export default router;

