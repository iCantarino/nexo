import { Router } from "express";
import { asyncHandler, HttpError } from "../../utils/asyncHandler.js";
import { requireCliente } from "../../middlewares/auth.js";
import { Notificacao } from "../../models/index.js";

const router = Router();

// RNF0046: o cliente consulta suas notificações (ex.: troca autorizada).
router.get(
  "/",
  requireCliente,
  asyncHandler(async (req, res) => {
    const where = { id_cliente: req.cliente.id_cliente };
    if (req.query.nao_lidas === "true") where.lida = false;
    res.json(await Notificacao.findAll({ where, order: [["id_notificacao", "DESC"]] }));
  })
);

router.patch(
  "/:idNotificacao/lida",
  requireCliente,
  asyncHandler(async (req, res) => {
    const n = await Notificacao.findByPk(req.params.idNotificacao);
    if (!n || n.id_cliente !== req.cliente.id_cliente) throw new HttpError(404, "Notificação não encontrada.");
    await n.update({ lida: true });
    res.json(n);
  })
);

export default router;
