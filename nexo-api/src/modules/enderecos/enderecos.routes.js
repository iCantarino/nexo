import { Router } from "express";
import { z } from "zod";
import { asyncHandler, HttpError } from "../../utils/asyncHandler.js";
import { requireCliente } from "../../middlewares/auth.js";
import { Endereco } from "../../models/index.js";

const router = Router();

const enderecoSchema = z.object({
  nome_identificador: z.string().min(1),
  tipo: z.enum(["ENTREGA", "COBRANCA", "AMBOS"]),
  tipo_residencia: z.string().min(1),
  tipo_logradouro: z.string().min(1),
  logradouro: z.string().min(1),
  numero: z.string().min(1),
  bairro: z.string().min(1),
  cep: z.string().min(1),
  cidade: z.string().min(1),
  estado: z.string().min(1),
  pais: z.string().min(1),
  observacoes: z.string().optional().nullable(),
  padrao: z.boolean().optional().default(false),
});

router.get(
  "/",
  requireCliente,
  asyncHandler(async (req, res) => {
    const enderecos = await Endereco.findAll({ where: { id_cliente: req.cliente.id_cliente } });
    res.json(enderecos);
  })
);

// RF0026: cadastro de endereço de entrega/cobrança
router.post(
  "/",
  requireCliente,
  asyncHandler(async (req, res) => {
    const payload = enderecoSchema.parse(req.body);
    const endereco = await Endereco.create({ id_cliente: req.cliente.id_cliente, ...payload });
    res.status(201).json(endereco);
  })
);

router.patch(
  "/:idEndereco",
  requireCliente,
  asyncHandler(async (req, res) => {
    const payload = enderecoSchema.parse(req.body);
    const endereco = await Endereco.findByPk(req.params.idEndereco);
    if (!endereco || endereco.id_cliente !== req.cliente.id_cliente) {
      throw new HttpError(404, "Endereço não encontrado.");
    }
    await endereco.update(payload);
    res.json(endereco);
  })
);

router.delete(
  "/:idEndereco",
  requireCliente,
  asyncHandler(async (req, res) => {
    const endereco = await Endereco.findByPk(req.params.idEndereco);
    if (!endereco || endereco.id_cliente !== req.cliente.id_cliente) {
      throw new HttpError(404, "Endereço não encontrado.");
    }
    await endereco.destroy();
    res.status(204).send();
  })
);

export default router;
