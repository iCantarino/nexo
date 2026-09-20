import { Router } from "express";
import { randomUUID } from "crypto";
import { z } from "zod";
import { asyncHandler, HttpError } from "../../utils/asyncHandler.js";
import { requireCliente, requireFuncionario, requirePerfil } from "../../middlewares/auth.js";
import { sequelize } from "../../config/database.js";
import {
  Carrinho,
  ItemCarrinho,
  Endereco,
  Livro,
  Pedido,
  ItemPedido,
  PedidoStatusHistorico,
  PedidoCartao,
  Cupom,
  PedidoCupom,
} from "../../models/index.js";

const router = Router();

const VALOR_MINIMO_POR_CARTAO = 10.0;

const TRANSICOES_PERMITIDAS = {
  EM_PROCESSAMENTO: new Set(["APROVADA", "REPROVADA"]),
  APROVADA: new Set(["EM_TRANSITO"]),
  EM_TRANSITO: new Set(["ENTREGUE"]),
};

const finalizarPedidoSchema = z.object({
  id_endereco_entrega: z.number().int(),
  cartoes: z
    .array(z.object({ id_cartao: z.number().int(), valor_pago: z.number().positive() }))
    .optional()
    .default([]),
  codigos_cupom: z.array(z.string()).optional().default([]),
});

const alterarStatusSchema = z.object({ novo_status: z.string() });

// RF0033/RF0038: finaliza a compra a partir do carrinho, com endereço e
// pagamento combinado (cartões + cupons). RN0033-37 aplicados nas validações.
router.post(
  "/",
  requireCliente,
  asyncHandler(async (req, res) => {
    const payload = finalizarPedidoSchema.parse(req.body);
    const cliente = req.cliente;

    const result = await sequelize.transaction(async (t) => {
      const carrinho = await Carrinho.findOne({ where: { id_cliente: cliente.id_cliente }, transaction: t });
      const todosItens = carrinho
        ? await ItemCarrinho.findAll({ where: { id_carrinho: carrinho.id_carrinho }, transaction: t })
        : [];
      const itensValidos = todosItens.filter((item) => !item.removido_por_expiracao);
      if (itensValidos.length === 0) throw new HttpError(400, "Carrinho vazio.");

      const endereco = await Endereco.findByPk(payload.id_endereco_entrega, { transaction: t });
      if (!endereco || endereco.id_cliente !== cliente.id_cliente) {
        throw new HttpError(400, "Endereço de entrega inválido.");
      }

      let valorTotal = 0;
      const itensPedidoData = [];
      for (const item of itensValidos) {
        const livro = await Livro.findByPk(item.id_livro, { transaction: t });
        if (!livro || livro.quantidade_estoque < item.quantidade) {
          throw new HttpError(409, `Estoque insuficiente para o livro '${livro ? livro.titulo : item.id_livro}'.`);
        }
        const valorUnitario = Number(livro.valor_venda);
        valorTotal += valorUnitario * item.quantidade;
        itensPedidoData.push({
          id_livro: item.id_livro,
          quantidade: item.quantidade,
          valor_unitario: valorUnitario,
          valor_total_item: valorUnitario * item.quantidade,
        });
      }

      let cuponsValidos = [];
      if (payload.codigos_cupom.length) {
        cuponsValidos = await Cupom.findAll({
          where: { codigo_cupom: payload.codigos_cupom, id_cliente: cliente.id_cliente, utilizado: false },
          transaction: t,
        });
        if (cuponsValidos.length !== payload.codigos_cupom.length) {
          throw new HttpError(400, "Um ou mais cupons são inválidos ou já utilizados.");
        }
        const promocionais = cuponsValidos.filter((c) => c.tipo === "PROMOCIONAL");
        if (promocionais.length > 1) {
          throw new HttpError(400, "Apenas um cupom promocional é permitido por compra.");
        }
      }

      const valorCupons = cuponsValidos.reduce((acc, c) => acc + Number(c.valor), 0);
      const valorCartoes = payload.cartoes.reduce((acc, c) => acc + c.valor_pago, 0);
      const restanteAposCupom = Math.max(valorTotal - valorCupons, 0);

      for (const cartaoInput of payload.cartoes) {
        if (cartaoInput.valor_pago < VALOR_MINIMO_POR_CARTAO && restanteAposCupom >= VALOR_MINIMO_POR_CARTAO) {
          throw new HttpError(400, "Valor mínimo de R$ 10,00 por cartão, exceto quando cupons cobrem o restante.");
        }
      }

      if (valorCupons + valorCartoes < valorTotal) {
        throw new HttpError(400, "Forma de pagamento não cobre o valor total do pedido.");
      }

      const pedido = await Pedido.create(
        {
          codigo_pedido: `PED-${randomUUID().slice(0, 10).toUpperCase()}`,
          id_cliente: cliente.id_cliente,
          id_endereco_entrega: payload.id_endereco_entrega,
          status: "EM_PROCESSAMENTO",
          valor_total: valorTotal,
          data_processamento: new Date(),
        },
        { transaction: t }
      );

      for (const dadosItem of itensPedidoData) {
        await ItemPedido.create({ id_pedido: pedido.id_pedido, ...dadosItem }, { transaction: t });
      }

      await PedidoStatusHistorico.create(
        { id_pedido: pedido.id_pedido, status_anterior: "EM_ABERTO", status_novo: "EM_PROCESSAMENTO" },
        { transaction: t }
      );

      for (const cartaoInput of payload.cartoes) {
        await PedidoCartao.create(
          { id_pedido: pedido.id_pedido, id_cartao: cartaoInput.id_cartao, valor_pago: cartaoInput.valor_pago },
          { transaction: t }
        );
      }

      // RN0036: gera cupom de troco se o valor de cupons exceder o total da compra.
      const diferenca = valorCupons - valorTotal;
      for (const cupom of cuponsValidos) {
        await cupom.update({ utilizado: true }, { transaction: t });
        await PedidoCupom.create(
          { id_pedido: pedido.id_pedido, id_cupom: cupom.id_cupom, valor_utilizado: Number(cupom.valor) },
          { transaction: t }
        );
      }
      if (diferenca > 0) {
        const hoje = new Date();
        const validoAte = new Date(hoje);
        validoAte.setFullYear(validoAte.getFullYear() + 1);
        await Cupom.create(
          {
            codigo_cupom: `TROCO-${randomUUID().slice(0, 8).toUpperCase()}`,
            tipo: "TROCA",
            valor: diferenca,
            id_cliente: cliente.id_cliente,
            id_pedido_origem: pedido.id_pedido,
            valido_de: hoje,
            valido_ate: validoAte,
          },
          { transaction: t }
        );
      }

      for (const item of itensValidos) {
        const livro = await Livro.findByPk(item.id_livro, { transaction: t });
        await livro.update({ quantidade_estoque: livro.quantidade_estoque - item.quantidade }, { transaction: t });
        await item.destroy({ transaction: t });
      }

      return pedido;
    });

    const pedidoCompleto = await Pedido.findByPk(result.id_pedido, { include: [{ model: ItemPedido, as: "itens" }] });
    res.status(201).json(pedidoCompleto);
  })
);

router.get(
  "/meus",
  requireCliente,
  asyncHandler(async (req, res) => {
    const pedidos = await Pedido.findAll({
      where: { id_cliente: req.cliente.id_cliente },
      include: [{ model: ItemPedido, as: "itens" }],
    });
    res.json(pedidos);
  })
);

router.get(
  "/admin/todos",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const where = {};
    if (req.query.status_filtro) where.status = req.query.status_filtro;
    const pedidos = await Pedido.findAll({ where, include: [{ model: ItemPedido, as: "itens" }] });
    res.json(pedidos);
  })
);

router.get(
  "/:idPedido",
  requireCliente,
  asyncHandler(async (req, res) => {
    const pedido = await Pedido.findByPk(req.params.idPedido, { include: [{ model: ItemPedido, as: "itens" }] });
    if (!pedido || pedido.id_cliente !== req.cliente.id_cliente) throw new HttpError(404, "Pedido não encontrado.");
    res.json(pedido);
  })
);

// RF: cliente confirma recebimento do pedido entregue.
router.patch(
  "/:idPedido/confirmar-recebimento",
  requireCliente,
  asyncHandler(async (req, res) => {
    const pedido = await Pedido.findByPk(req.params.idPedido);
    if (!pedido || pedido.id_cliente !== req.cliente.id_cliente) throw new HttpError(404, "Pedido não encontrado.");
    if (pedido.status !== "EM_TRANSITO") throw new HttpError(400, "Pedido não está em trânsito.");

    await pedido.update({ status: "ENTREGUE", data_entrega: new Date() });
    await PedidoStatusHistorico.create({
      id_pedido: pedido.id_pedido,
      status_anterior: "EM_TRANSITO",
      status_novo: "ENTREGUE",
    });
    res.json(pedido);
  })
);

// RF: cliente cancela pedido ainda não processado/aprovado.
router.patch(
  "/:idPedido/cancelar",
  requireCliente,
  asyncHandler(async (req, res) => {
    const pedido = await Pedido.findByPk(req.params.idPedido, { include: [{ model: ItemPedido, as: "itens" }] });
    if (!pedido || pedido.id_cliente !== req.cliente.id_cliente) throw new HttpError(404, "Pedido não encontrado.");
    if (!["EM_ABERTO", "EM_PROCESSAMENTO"].includes(pedido.status)) {
      throw new HttpError(400, "Pedido não pode mais ser cancelado.");
    }

    const statusAnterior = pedido.status;
    await pedido.update({ status: "CANCELADO" });
    await PedidoStatusHistorico.create({
      id_pedido: pedido.id_pedido,
      status_anterior: statusAnterior,
      status_novo: "CANCELADO",
    });

    for (const item of pedido.itens) {
      const livro = await Livro.findByPk(item.id_livro);
      await livro.update({ quantidade_estoque: livro.quantidade_estoque + item.quantidade });
    }

    res.json(pedido);
  })
);

// RF0039/RF0040: EM_PROCESSAMENTO->APROVADA/REPROVADA->EM_TRANSITO->ENTREGUE (admin).
router.patch(
  "/:idPedido/status",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const { novo_status } = alterarStatusSchema.parse(req.body);
    const pedido = await Pedido.findByPk(req.params.idPedido);
    if (!pedido) throw new HttpError(404, "Pedido não encontrado.");

    const permitidos = TRANSICOES_PERMITIDAS[pedido.status] ?? new Set();
    if (!permitidos.has(novo_status)) {
      throw new HttpError(400, `Transição de '${pedido.status}' para '${novo_status}' não é permitida.`);
    }

    const statusAnterior = pedido.status;
    const atualizacoes = { status: novo_status };
    if (novo_status === "EM_TRANSITO") atualizacoes.data_transporte = new Date();
    await pedido.update(atualizacoes);

    await PedidoStatusHistorico.create({
      id_pedido: pedido.id_pedido,
      id_funcionario: req.funcionario.id_funcionario,
      status_anterior: statusAnterior,
      status_novo: novo_status,
    });

    res.json(pedido);
  })
);

export default router;
