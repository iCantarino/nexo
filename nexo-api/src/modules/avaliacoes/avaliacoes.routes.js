import { Router } from "express";
import { z } from "zod";
import { asyncHandler, HttpError } from "../../utils/asyncHandler.js";
import { requireCliente } from "../../middlewares/auth.js";
import { Avaliacao, Livro } from "../../models/index.js";

const router = Router({ mergeParams: true });

const avaliacaoSchema = z.object({
  estrelas: z.number().int().min(1).max(5),
  comentario: z.string().optional().nullable(),
});

// Avaliações (estrelas + comentário) exibidas na página de detalhe do livro.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const livro = await Livro.findByPk(req.params.idLivro);
    if (!livro) throw new HttpError(404, "Livro não encontrado.");
    const avaliacoes = await Avaliacao.findAll({ where: { id_livro: req.params.idLivro } });
    res.json(avaliacoes);
  })
);

router.post(
  "/",
  requireCliente,
  asyncHandler(async (req, res) => {
    const payload = avaliacaoSchema.parse(req.body);
    const livro = await Livro.findByPk(req.params.idLivro);
    if (!livro) throw new HttpError(404, "Livro não encontrado.");

    const existente = await Avaliacao.findOne({
      where: { id_livro: req.params.idLivro, id_cliente: req.cliente.id_cliente },
    });
    if (existente) throw new HttpError(409, "Você já avaliou este livro.");

    const avaliacao = await Avaliacao.create({
      id_livro: Number(req.params.idLivro),
      id_cliente: req.cliente.id_cliente,
      ...payload,
    });
    res.status(201).json(avaliacao);
  })
);

export default router;
