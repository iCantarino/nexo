import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { requireCliente } from "../../middlewares/auth.js";
import { Cupom, CupomCatalogo } from "../../models/index.js";
import { motivoIndisponivel } from "./cupons.service.js";

const router = Router();

// RN0033-36: cupons do cliente (promocionais e de troca) + cupons de catálogo
// que ele ainda pode usar (TESTE, PRIMEIRACOMPRA, TESTETROCA).
router.get(
  "/meus",
  requireCliente,
  asyncHandler(async (req, res) => {
    const proprios = await Cupom.findAll({ where: { id_cliente: req.cliente.id_cliente } });
    const resposta = proprios.map((c) => ({ ...c.toJSON(), percentual: null, descricao: null, origem: "CLIENTE" }));

    const catalogo = await CupomCatalogo.findAll({ where: { ativo: true } });
    for (const c of catalogo) {
      if (await motivoIndisponivel(c, req.cliente.id_cliente)) continue;
      resposta.push({
        id_cupom: -c.id_cupom_catalogo,
        codigo_cupom: c.codigo_cupom,
        tipo: c.tipo,
        valor: c.valor_fixo ?? "0.00",
        percentual: c.percentual,
        descricao: c.descricao,
        origem: "CATALOGO",
        utilizado: false,
      });
    }
    res.json(resposta);
  })
);

export default router;
