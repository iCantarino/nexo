import { Router } from "express";
import { randomUUID } from "crypto";
import { Op } from "sequelize";
import { z } from "zod";
import { asyncHandler, HttpError } from "../../utils/asyncHandler.js";
import { requireCliente, requireFuncionario, requirePerfil } from "../../middlewares/auth.js";
import { Pedido, ItemPedido, Troca, ItemTroca, Cupom, Livro } from "../../models/index.js";

const router = Router();

const trocaCreateSchema = z.object({
  id_pedido: z.number().int(),
  motivo: z.string().min(1),
  itens: z.array(z.object({ id_item_pedido: z.number().int(), quantidade: z.number().int().positive() })).min(1),
});

const autorizarSchema = z.object({ aceitar: z.boolean() });
const receberSchema = z.object({ retorna_estoque: z.boolean() });

// RN0043: somente itens de pedidos ENTREGUE podem ser trocados.
router.post(
  "/",
  requireCliente,
  asyncHandler(async (req, res) => {
    const payload = trocaCreateSchema.parse(req.body);

    const pedido = await Pedido.findByPk(payload.id_pedido);
    if (!pedido || pedido.id_cliente !== req.cliente.id_cliente) throw new HttpError(404, "Pedido não encontrado.");
    if (pedido.status !== "ENTREGUE") throw new HttpError(400, "Somente pedidos entregues podem gerar troca.");

    const troca = await Troca.create({
      id_pedido: pedido.id_pedido,
      id_cliente: req.cliente.id_cliente,
      motivo: payload.motivo,
    });

    for (const itemInput of payload.itens) {
      const itemPedido = await ItemPedido.findByPk(itemInput.id_item_pedido);
      if (!itemPedido || itemPedido.id_pedido !== pedido.id_pedido) {
        throw new HttpError(400, "Item de pedido inválido.");
      }
      await ItemTroca.create({
        id_troca: troca.id_troca,
        id_item_pedido: itemInput.id_item_pedido,
        quantidade: itemInput.quantidade,
      });
    }

    await pedido.update({ status: "EM_TROCA" });

    const trocaCompleta = await Troca.findByPk(troca.id_troca, { include: [{ model: ItemTroca, as: "itens" }] });
    res.status(201).json(trocaCompleta);
  })
);

// RF0043: administrador visualiza pedidos de troca em aberto.
router.get(
  "/admin/pendentes",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const trocas = await Troca.findAll({
      where: { status: { [Op.in]: ["SOLICITADA", "ACEITA", "ITEM_ENVIADO"] } },
    });
    res.json(trocas);
  })
);

router.get(
  "/minhas",
  requireCliente,
  asyncHandler(async (req, res) => {
    const trocas = await Troca.findAll({ where: { id_cliente: req.cliente.id_cliente } });
    res.json(trocas);
  })
);

// RF0042: autoriza (ACEITA) ou nega (NEGADA) a troca. RN0046: notifica o cliente.
router.patch(
  "/:idTroca/autorizar",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const { aceitar } = autorizarSchema.parse(req.body);
    const troca = await Troca.findByPk(req.params.idTroca);
    if (!troca) throw new HttpError(404, "Troca não encontrada.");
    if (troca.status !== "SOLICITADA") throw new HttpError(400, "Troca não está mais pendente de autorização.");

    await troca.update({
      status: aceitar ? "ACEITA" : "NEGADA",
      id_funcionario_autorizacao: req.funcionario.id_funcionario,
      data_autorizacao: new Date(),
    });

    const pedido = await Pedido.findByPk(troca.id_pedido);
    await pedido.update({ status: aceitar ? "TROCA_AUTORIZADA" : "ENTREGUE" });

    res.json(troca);
  })
);

// RF0044: confirma recebimento; opcionalmente retorna ao estoque.
// RF0045: gera cupom de troca para o cliente.
router.patch(
  "/:idTroca/receber",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const { retorna_estoque } = receberSchema.parse(req.body);
    const troca = await Troca.findByPk(req.params.idTroca, { include: [{ model: ItemTroca, as: "itens" }] });
    if (!troca) throw new HttpError(404, "Troca não encontrada.");
    if (!["ACEITA", "ITEM_ENVIADO"].includes(troca.status)) {
      throw new HttpError(400, "Troca não está aguardando recebimento.");
    }

    let valorTotalTroca = 0;
    for (const itemTroca of troca.itens) {
      const itemPedido = await ItemPedido.findByPk(itemTroca.id_item_pedido);
      valorTotalTroca += Number(itemPedido.valor_unitario) * itemTroca.quantidade;
      if (retorna_estoque) {
        const livro = await Livro.findByPk(itemPedido.id_livro);
        await livro.update({ quantidade_estoque: livro.quantidade_estoque + itemTroca.quantidade });
      }
    }

    const hoje = new Date();
    const validoAte = new Date(hoje);
    validoAte.setFullYear(validoAte.getFullYear() + 1);

    const cupom = await Cupom.create({
      codigo_cupom: `TROCA-${randomUUID().slice(0, 8).toUpperCase()}`,
      tipo: "TROCA",
      valor: valorTotalTroca,
      id_cliente: troca.id_cliente,
      id_pedido_origem: troca.id_pedido,
      valido_de: hoje,
      valido_ate: validoAte,
    });

    await troca.update({
      status: "PROCESSADA",
      retorna_estoque,
      data_processamento: new Date(),
      id_cupom_gerado: cupom.id_cupom,
    });

    const pedido = await Pedido.findByPk(troca.id_pedido);
    await pedido.update({ status: "TROCADO" });

    res.json(troca);
  })
);

export default router;
