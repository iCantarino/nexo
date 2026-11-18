import { Router } from "express";
import { randomUUID } from "crypto";
import { Op } from "sequelize";
import { z } from "zod";
import { asyncHandler, HttpError } from "../../utils/asyncHandler.js";
import { requireCliente, requireFuncionario, requirePerfil } from "../../middlewares/auth.js";
import { sequelize } from "../../config/database.js";
import {
  Pedido,
  ItemPedido,
  PedidoStatusHistorico,
  Troca,
  ItemTroca,
  Cupom,
  Notificacao,
} from "../../models/index.js";
import { reentradaEstoque } from "../estoque/estoque.service.js";

const router = Router();

// RF0040: troca de itens específicos ou de toda a compra (`compra_inteira`).
const trocaCreateSchema = z
  .object({
    id_pedido: z.number().int(),
    motivo: z.string().min(1),
    compra_inteira: z.boolean().optional().default(false),
    itens: z
      .array(z.object({ id_item_pedido: z.number().int(), quantidade: z.number().int().positive() }))
      .optional()
      .default([]),
  })
  .refine((d) => d.compra_inteira || d.itens.length > 0, {
    message: "Informe os itens a trocar ou marque a troca da compra inteira.",
  });

async function mudarStatusPedido(pedido, novoStatus, t, idFuncionario = null) {
  const anterior = pedido.status;
  await pedido.update({ status: novoStatus }, { transaction: t });
  await PedidoStatusHistorico.create(
    { id_pedido: pedido.id_pedido, id_funcionario: idFuncionario, status_anterior: anterior, status_novo: novoStatus },
    { transaction: t }
  );
}

const incluirItens = [{ model: ItemTroca, as: "itens" }];

// RF0040 / RN0041 / RN0043: somente pedidos ENTREGUE podem gerar troca; o pedido passa a EM_TROCA.
router.post(
  "/",
  requireCliente,
  asyncHandler(async (req, res) => {
    const payload = trocaCreateSchema.parse(req.body);

    const pedido = await Pedido.findByPk(payload.id_pedido, { include: [{ model: ItemPedido, as: "itens" }] });
    if (!pedido || pedido.id_cliente !== req.cliente.id_cliente) throw new HttpError(404, "Pedido não encontrado.");
    if (pedido.status !== "ENTREGUE") throw new HttpError(400, "Somente pedidos entregues podem gerar troca.");

    // Monta a lista (item, quantidade) validando o saldo ainda não trocado.
    let selecao;
    if (payload.compra_inteira) {
      selecao = pedido.itens.map((i) => ({ item: i, quantidade: i.quantidade - i.quantidade_trocada }));
    } else {
      selecao = payload.itens.map((entrada) => {
        const item = pedido.itens.find((i) => i.id_item_pedido === entrada.id_item_pedido);
        if (!item) throw new HttpError(400, "Item de pedido inválido.");
        return { item, quantidade: entrada.quantidade };
      });
      if (new Set(selecao.map((s) => s.item.id_item_pedido)).size !== selecao.length) {
        throw new HttpError(400, "Item de pedido repetido na solicitação.");
      }
    }
    for (const { item, quantidade } of selecao) {
      if (quantidade <= 0 || quantidade > item.quantidade - item.quantidade_trocada) {
        throw new HttpError(400, "Quantidade para troca superior à quantidade comprada.");
      }
    }

    const troca = await sequelize.transaction(async (t) => {
      const criada = await Troca.create(
        {
          id_pedido: pedido.id_pedido,
          id_cliente: req.cliente.id_cliente,
          motivo: payload.motivo,
          compra_inteira: payload.compra_inteira,
        },
        { transaction: t }
      );
      for (const { item, quantidade } of selecao) {
        await ItemTroca.create(
          { id_troca: criada.id_troca, id_item_pedido: item.id_item_pedido, quantidade },
          { transaction: t }
        );
      }
      await mudarStatusPedido(pedido, "EM_TROCA", t);
      return criada;
    });

    res.status(201).json(await Troca.findByPk(troca.id_troca, { include: incluirItens }));
  })
);

// RF0042: o administrador visualiza os pedidos de troca (pedido EM_TROCA) e os já autorizados.
router.get(
  "/admin/pendentes",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const trocas = await Troca.findAll({
      where: { status: { [Op.in]: ["SOLICITADA", "ACEITA"] } },
      include: [...incluirItens, { model: Pedido }],
      order: [["id_troca", "DESC"]],
    });
    res.json(trocas);
  })
);

router.get(
  "/minhas",
  requireCliente,
  asyncHandler(async (req, res) => {
    const trocas = await Troca.findAll({
      where: { id_cliente: req.cliente.id_cliente },
      include: incluirItens,
      order: [["id_troca", "DESC"]],
    });
    res.json(trocas);
  })
);

// RF0041: autoriza a troca (EM_TROCA -> TROCA_AUTORIZADA). RNF0046: notifica o cliente.
router.patch(
  "/:idTroca/autorizar",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const troca = await Troca.findByPk(req.params.idTroca);
    if (!troca) throw new HttpError(404, "Troca não encontrada.");
    if (troca.status !== "SOLICITADA") throw new HttpError(400, "Troca não está mais pendente de autorização.");
    const pedido = await Pedido.findByPk(troca.id_pedido);
    if (pedido.status !== "EM_TROCA") throw new HttpError(400, "O pedido não está com status EM TROCA.");

    await sequelize.transaction(async (t) => {
      await troca.update(
        { status: "ACEITA", id_funcionario_autorizacao: req.funcionario.id_funcionario, data_autorizacao: new Date() },
        { transaction: t }
      );
      await mudarStatusPedido(pedido, "TROCA_AUTORIZADA", t, req.funcionario.id_funcionario);
      await Notificacao.create(
        {
          id_cliente: troca.id_cliente,
          tipo: "TROCA_AUTORIZADA",
          mensagem: `A troca do pedido ${pedido.codigo_pedido} foi autorizada. Envie os itens para recebimento.`,
          id_pedido: pedido.id_pedido,
          id_troca: troca.id_troca,
        },
        { transaction: t }
      );
    });

    res.json(await Troca.findByPk(troca.id_troca, { include: incluirItens }));
  })
);

// RF0043 / RN0042: confirma o recebimento (TROCA_AUTORIZADA -> TROCADO).
// RF0044: gera e disponibiliza o cupom de troca. RF0054: reentrada dos itens no estoque.
router.patch(
  "/:idTroca/receber",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const troca = await Troca.findByPk(req.params.idTroca, { include: incluirItens });
    if (!troca) throw new HttpError(404, "Troca não encontrada.");
    if (troca.status !== "ACEITA") throw new HttpError(400, "Troca não está aguardando recebimento.");
    const pedido = await Pedido.findByPk(troca.id_pedido);

    await sequelize.transaction(async (t) => {
      let valorTotalTroca = 0;
      const paraEstoque = [];
      for (const itemTroca of troca.itens) {
        const itemPedido = await ItemPedido.findByPk(itemTroca.id_item_pedido, { transaction: t });
        valorTotalTroca += Number(itemPedido.valor_unitario) * itemTroca.quantidade;
        await itemPedido.update(
          { quantidade_trocada: itemPedido.quantidade_trocada + itemTroca.quantidade },
          { transaction: t }
        );
        paraEstoque.push({ id_livro: itemPedido.id_livro, quantidade: itemTroca.quantidade });
      }
      await reentradaEstoque(pedido.id_pedido, troca.id_troca, paraEstoque, t);

      const hoje = new Date();
      const validoAte = new Date(hoje);
      validoAte.setFullYear(validoAte.getFullYear() + 1);
      const cupom = await Cupom.create(
        {
          codigo_cupom: `TROCA-${randomUUID().slice(0, 8).toUpperCase()}`,
          tipo: "TROCA",
          valor: Math.round(valorTotalTroca * 100) / 100,
          id_cliente: troca.id_cliente,
          id_pedido_origem: troca.id_pedido,
          valido_de: hoje,
          valido_ate: validoAte,
        },
        { transaction: t }
      );

      await troca.update(
        { status: "PROCESSADA", retorna_estoque: true, data_processamento: new Date(), id_cupom_gerado: cupom.id_cupom },
        { transaction: t }
      );
      await mudarStatusPedido(pedido, "TROCADO", t, req.funcionario.id_funcionario);
      await Notificacao.create(
        {
          id_cliente: troca.id_cliente,
          tipo: "CUPOM_TROCA",
          mensagem: `Troca recebida: o cupom ${cupom.codigo_cupom} (R$ ${Number(cupom.valor).toFixed(2)}) já está disponível.`,
          id_pedido: pedido.id_pedido,
          id_troca: troca.id_troca,
        },
        { transaction: t }
      );
    });

    res.json(await Troca.findByPk(troca.id_troca, { include: incluirItens }));
  })
);

export default router;
