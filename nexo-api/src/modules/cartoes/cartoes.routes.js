import { Router } from "express";
import { z } from "zod";
import { asyncHandler, HttpError } from "../../utils/asyncHandler.js";
import { requireCliente } from "../../middlewares/auth.js";
import { CartaoCredito } from "../../models/index.js";

const router = Router();

const cartaoSchema = z.object({
  id_bandeira: z.number().int(),
  numero_cartao: z.string().min(1),
  nome_impresso: z.string().min(1),
  codigo_seguranca: z.string().min(3).max(4),
  preferencial: z.boolean().optional().default(false),
});

router.get(
  "/",
  requireCliente,
  asyncHandler(async (req, res) => {
    const cartoes = await CartaoCredito.findAll({ where: { id_cliente: req.cliente.id_cliente } });
    res.json(cartoes);
  })
);

// RF0027: cadastro de cartões, com um marcado como preferencial
router.post(
  "/",
  requireCliente,
  asyncHandler(async (req, res) => {
    const payload = cartaoSchema.parse(req.body);
    if (payload.preferencial) {
      await CartaoCredito.update({ preferencial: false }, { where: { id_cliente: req.cliente.id_cliente } });
    }
    const cartao = await CartaoCredito.create({ id_cliente: req.cliente.id_cliente, ...payload });
    res.status(201).json(cartao);
  })
);

router.patch(
  "/:idCartao/preferencial",
  requireCliente,
  asyncHandler(async (req, res) => {
    const cartao = await CartaoCredito.findByPk(req.params.idCartao);
    if (!cartao || cartao.id_cliente !== req.cliente.id_cliente) {
      throw new HttpError(404, "Cartão não encontrado.");
    }
    await CartaoCredito.update({ preferencial: false }, { where: { id_cliente: req.cliente.id_cliente } });
    await cartao.update({ preferencial: true });
    res.json(cartao);
  })
);

router.delete(
  "/:idCartao",
  requireCliente,
  asyncHandler(async (req, res) => {
    const cartao = await CartaoCredito.findByPk(req.params.idCartao);
    if (!cartao || cartao.id_cliente !== req.cliente.id_cliente) {
      throw new HttpError(404, "Cartão não encontrado.");
    }
    await cartao.destroy();
    res.status(204).send();
  })
);

export default router;
