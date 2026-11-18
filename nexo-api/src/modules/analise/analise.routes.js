import { Router } from "express";
import { Op } from "sequelize";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireFuncionario, requirePerfil } from "../../middlewares/auth.js";
import { listarCategorias, vendasPorCategoria } from "./analise.service.js";
import { Pedido, Cliente, ItemPedido } from "../../models/index.js";

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

// KPIs do painel administrativo (dashboard).
router.get(
  "/kpis",
  asyncHandler(async (req, res) => {
    const hoje = new Date();
    const inicioDoDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fimDoDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);

    const [pedidosHoje, receitaHoje, novosClientes, itensEmTransito] = await Promise.all([
      Pedido.count({
        where: { data_pedido: { [Op.gte]: inicioDoDia, [Op.lt]: fimDoDia } },
      }),
      Pedido.sum("valor_total", {
        where: { status: "ENTREGUE", data_entrega: { [Op.gte]: inicioDoDia, [Op.lt]: fimDoDia } },
      }),
      Cliente.count({
        where: { data_cadastro: { [Op.gte]: inicioDoDia, [Op.lt]: fimDoDia } },
      }),
      ItemPedido.count({
        include: [
          {
            model: Pedido,
            where: { status: "EM_TRANSITO" },
            required: true,
          },
        ],
      }),
    ]);

    res.json({
      pedidos_hoje: pedidosHoje,
      receita_dia: Number(receitaHoje || 0),
      novos_clientes: novosClientes,
      itens_em_transito: itensEmTransito,
    });
  })
);

export default router;
