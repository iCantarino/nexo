import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireFuncionario, requirePerfil } from "../../middlewares/auth.js";
import { listarCategorias, vendasPorCategoria } from "./analise.service.js";

const router = Router();

const querySchema = z.object({
  data_inicio: z.string(),
  data_fim: z.string(),
  categorias: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (v === undefined ? [] : (Array.isArray(v) ? v : v.split(",")).map((x) => Number(x)))),
});

// Análise de vendas: acesso exclusivo do perfil ADMIN (critério b da atividade).
router.use(requireFuncionario, requirePerfil("ADMIN"));

// Categorias disponíveis para seleção na tela de análise.
router.get(
  "/categorias",
  asyncHandler(async (req, res) => {
    res.json(await listarCategorias());
  })
);

// RF0055 / RNF0043 / RN0071-74: vendas ENTREGUE por categoria, agrupadas por mês (R$).
router.get(
  "/vendas-por-categoria",
  asyncHandler(async (req, res) => {
    const { data_inicio, data_fim, categorias } = querySchema.parse(req.query);
    res.json(await vendasPorCategoria({ dataInicio: data_inicio, dataFim: data_fim, categorias }));
  })
);

export default router;
