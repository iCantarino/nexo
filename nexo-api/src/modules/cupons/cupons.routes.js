import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireCliente } from "../../middlewares/auth.js";
import { Cupom } from "../../models/index.js";

const router = Router();

// RN0033-36: consulta de cupons (promocionais e de troca) do cliente.
router.get(
  "/meus",
  requireCliente,
  asyncHandler(async (req, res) => {
    const cupons = await Cupom.findAll({ where: { id_cliente: req.cliente.id_cliente } });
    res.json(cupons);
  })
);

export default router;
