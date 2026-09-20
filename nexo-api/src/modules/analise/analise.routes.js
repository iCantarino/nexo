import { Router } from "express";
import { z } from "zod";
import { QueryTypes } from "sequelize";
import { asyncHandler, HttpError } from "../../utils/asyncHandler.js";
import { requireFuncionario, requirePerfil } from "../../middlewares/auth.js";
import { sequelize } from "../../config/database.js";

const router = Router();

const querySchema = z.object({
  data_inicio: z.string(),
  data_fim: z.string(),
  categorias: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((v) => (v === undefined ? [] : Array.isArray(v) ? v.map(Number) : [Number(v)])),
});

function toAnoMes(dataStr) {
  const d = new Date(dataStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// RF0055-58 / RN0071-74: dashboard de análise de vendas por categoria e período.
// RN0072: período de 1 a 24 meses. RN0074: a view já filtra pedidos
// com status APROVADA/EM_TRANSITO/ENTREGUE.
router.get(
  "/vendas-por-categoria",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const { data_inicio, data_fim, categorias } = querySchema.parse(req.query);

    const inicio = new Date(data_inicio);
    const fim = new Date(data_fim);
    if (fim < inicio) throw new HttpError(400, "Data de fim não pode ser anterior à data de início.");

    const mesesDiferenca = (fim.getFullYear() - inicio.getFullYear()) * 12 + (fim.getMonth() - inicio.getMonth());
    if (mesesDiferenca < 1 || mesesDiferenca > 24) {
      throw new HttpError(400, "O período deve ser entre 1 e 24 meses.");
    }

    let sql = `
      SELECT id_categoria, categoria, ano_mes, valor_total_vendas
      FROM vw_vendas_por_categoria_mes
      WHERE ano_mes BETWEEN :inicio AND :fim
    `;
    const replacements = { inicio: toAnoMes(data_inicio), fim: toAnoMes(data_fim) };
    if (categorias.length) {
      sql += " AND id_categoria IN (:categorias)";
      replacements.categorias = categorias;
    }

    const resultado = await sequelize.query(sql, { replacements, type: QueryTypes.SELECT });
    res.json(resultado);
  })
);

export default router;
