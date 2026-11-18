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
  CartaoCredito,
} from "../../models/index.js";
import { arred, buscarNoCatalogo, motivoIndisponivel, valorDoCupom } from "../cupons/cupons.service.js";
import {
  carregarItens,
  expirarItensVencidos,
  getOrCreateCarrinho,
  revalidarEstoqueDoCarrinho,
} from "../carrinho/carrinho.service.js";
import { baixarEstoque } from "../estoque/estoque.service.js";
import { validarPagamento } from "./pagamento.service.js";

const router = Router();

const VALOR_MINIMO_POR_CARTAO = 10.0;
const FRETE_BASE = 5.0;
const FRETE_POR_ITEM = 2.0;

async function registrarStatus(pedido, statusNovo, { transaction, idFuncionario = null } = {}) {
  const statusAnterior = pedido.status;
  await pedido.update({ status: statusNovo }, { transaction });
  await PedidoStatusHistorico.create(
    { id_pedido: pedido.id_pedido, id_funcionario: idFuncionario, status_anterior: statusAnterior, status_novo: statusNovo },
    { transaction }
  );
}

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
});

const cartaoInputSchema = z.object({
  id_cartao: z.number().int(),
  valor_pago: z.number().positive(),
});

const finalizarPedidoSchema = z.object({
  id_endereco_entrega: z.number().int().optional(),
  cartoes: z.array(cartaoInputSchema).optional().default([]),
  pix: z.object({ valor_pago: z.number().positive() }).optional(),
  codigos_cupom: z.array(z.string()).optional().default([]),
  // Novo endereço opcional (se não informar id_endereco_entrega, deve enviar novo_endereco)
  novo_endereco: enderecoSchema.optional(),
  salvar_endereco_perfil: z.boolean().optional().default(false),
  // Novo cartão opcional
  novo_cartao: z.object({
    id_bandeira: z.number().int(),
    numero_cartao: z.string().min(1),
    nome_impresso: z.string().min(1),
    codigo_seguranca: z.string().min(3).max(4),
  }).optional(),
  salvar_cartao_perfil: z.boolean().optional().default(false),
});

/**
 * Calcula o valor do frete com base na quantidade de itens e no endereço.
 * Critério adotado: R$ 5,00 fixo + R$ 2,00 por item.
 */
function calcularFrete(qtdeItens, endereco) {
  return FRETE_BASE + FRETE_POR_ITEM * qtdeItens;
}

// RF0034: cálculo do frete antes da finalização
router.post(
  "/calcular-frete",
  requireCliente,
  asyncHandler(async (req, res) => {
    const { id_endereco_entrega } = z.object({ id_endereco_entrega: z.number().int() }).parse(req.body);
    const endereco = await Endereco.findByPk(id_endereco_entrega);
    if (!endereco || endereco.id_cliente !== req.cliente.id_cliente) {
      throw new HttpError(400, "Endereço de entrega inválido.");
    }

    const carrinho = await Carrinho.findOne({ where: { id_cliente: req.cliente.id_cliente } });
    const itens = carrinho
      ? await ItemCarrinho.findAll({ where: { id_carrinho: carrinho.id_carrinho } })
      : [];
    const itensValidos = itens.filter((i) => !i.removido_por_expiracao);
    const qtdeItens = itensValidos.reduce((acc, i) => acc + i.quantidade, 0);
    const valorFrete = calcularFrete(qtdeItens, endereco);

    res.json({ valor_frete: valorFrete, qtde_itens: qtdeItens });
  })
);

// RF0033/RF0038: finaliza a compra a partir do carrinho, com endereço e
// pagamento combinado (cartões + cupons). RN0033-37 aplicados nas validações.
router.post(
  "/",
  requireCliente,
  asyncHandler(async (req, res) => {
    const payload = finalizarPedidoSchema.parse(req.body);
    const cliente = req.cliente;

    // RNF0042: com itens removidos por expiração do bloqueio, a compra fica desabilitada.
    const carrinhoAtual = await getOrCreateCarrinho(cliente.id_cliente);
    await expirarItensVencidos(carrinhoAtual);
    if ((await carregarItens(carrinhoAtual)).some((i) => i.removido_por_expiracao)) {
      throw new HttpError(409, "Há itens removidos por expiração do bloqueio. Reinclua-os no carrinho para comprar.");
    }
    // RN0032: revalida o estoque; havendo mudança, atualiza o carrinho e alerta o usuário.
    const alertas = await revalidarEstoqueDoCarrinho(carrinhoAtual);
    if (alertas.length > 0) {
      return res.status(409).json({ detail: alertas.join(" "), alertas });
    }

    const result = await sequelize.transaction(async (t) => {
      const carrinho = await Carrinho.findOne({ where: { id_cliente: cliente.id_cliente }, transaction: t });
      const todosItens = carrinho
        ? await ItemCarrinho.findAll({ where: { id_carrinho: carrinho.id_carrinho }, transaction: t })
        : [];
      const itensValidos = todosItens.filter((item) => !item.removido_por_expiracao);
      if (itensValidos.length === 0) throw new HttpError(400, "Carrinho vazio.");

      // Determina o endereço de entrega (existente ou novo)
      let idEnderecoEntrega = payload.id_endereco_entrega;
      if (!idEnderecoEntrega && payload.novo_endereco) {
        const enderecoCriado = await Endereco.create(
          { id_cliente: cliente.id_cliente, ...payload.novo_endereco },
          { transaction: t }
        );
        idEnderecoEntrega = enderecoCriado.id_endereco;
        // Se solicitado, o endereço já foi salvo no perfil ao criar acima
      } else if (!idEnderecoEntrega) {
        throw new HttpError(400, "Informe um endereço de entrega existente ou cadastre um novo.");
      }

      const endereco = await Endereco.findByPk(idEnderecoEntrega, { transaction: t });
      if (!endereco || endereco.id_cliente !== cliente.id_cliente) {
        throw new HttpError(400, "Endereço de entrega inválido.");
      }

      let valorTotal = 0;
      let qtdeTotalItens = 0;
      const itensPedidoData = [];
      for (const item of itensValidos) {
        const livro = await Livro.findByPk(item.id_livro, { transaction: t });
        if (!livro || livro.quantidade_estoque < item.quantidade) {
          throw new HttpError(409, `Estoque insuficiente para o livro '${livro ? livro.titulo : item.id_livro}'.`);
        }
        const valorUnitario = Number(livro.valor_venda);
        valorTotal += valorUnitario * item.quantidade;
        qtdeTotalItens += item.quantidade;
        itensPedidoData.push({
          id_livro: item.id_livro,
          quantidade: item.quantidade,
          valor_unitario: valorUnitario,
          valor_total_item: valorUnitario * item.quantidade,
        });
      }

      const valorFrete = calcularFrete(qtdeTotalItens, endereco);
      const valorTotalComFrete = arred(valorTotal + valorFrete);

      // Cupons: de catálogo (TESTE, PRIMEIRACOMPRA, TESTETROCA) ou emitidos para o cliente.
      const codigosCupom = [...new Set(payload.codigos_cupom.map((c) => c.trim().toUpperCase()).filter(Boolean))];
      const cuponsAplicados = [];
      for (const codigo of codigosCupom) {
        const catalogo = await buscarNoCatalogo(codigo, t);
        if (catalogo) {
          const motivo = await motivoIndisponivel(catalogo, cliente.id_cliente, t);
          if (motivo) throw new HttpError(400, motivo);
          cuponsAplicados.push({
            codigo_cupom: codigo,
            tipo: catalogo.tipo,
            valor: valorDoCupom(catalogo, valorTotal),
            catalogo,
            registro: null,
          });
          continue;
        }
        const registro = await Cupom.findOne({
          where: { codigo_cupom: codigo, id_cliente: cliente.id_cliente, utilizado: false },
          transaction: t,
        });
        if (!registro) throw new HttpError(400, `Cupom ${codigo} inválido ou já utilizado.`);
        cuponsAplicados.push({ codigo_cupom: codigo, tipo: registro.tipo, valor: Number(registro.valor), catalogo: null, registro });
      }

      // RN0033: apenas um cupom promocional por compra.
      if (cuponsAplicados.filter((c) => c.tipo === "PROMOCIONAL").length > 1) {
        throw new HttpError(400, "Apenas um cupom promocional é permitido por compra.");
      }
      const valorCupons = arred(cuponsAplicados.reduce((acc, c) => acc + c.valor, 0));
      // RN0036: não permite usar cupom desnecessário (os demais já cobrem a compra).
      if (cuponsAplicados.length > 1) {
        for (const c of cuponsAplicados) {
          if (arred(valorCupons - c.valor) >= valorTotalComFrete) {
            throw new HttpError(400, `O cupom ${c.codigo_cupom} é desnecessário: os demais cupons já cobrem a compra.`);
          }
        }
      }
      const restanteAposCupom = arred(Math.max(valorTotalComFrete - valorCupons, 0));

      // Cartões já cadastrados: precisam existir, estar ativos e pertencer ao cliente.
      const cartoesParaPagar = [];
      for (const c of payload.cartoes) {
        const cartao = await CartaoCredito.findByPk(c.id_cartao, { transaction: t });
        if (!cartao || cartao.id_cliente !== cliente.id_cliente || !cartao.ativo) {
          throw new HttpError(400, "Cartão de crédito inválido.");
        }
        cartoesParaPagar.push({ id_cartao: cartao.id_cartao, valor_pago: arred(c.valor_pago) });
      }
      const valorPix = payload.pix ? arred(payload.pix.valor_pago) : 0;

      // Novo cartão informado durante a compra: paga o que ainda falta.
      if (payload.novo_cartao) {
        const falta = arred(
          restanteAposCupom - cartoesParaPagar.reduce((acc, c) => acc + c.valor_pago, 0) - valorPix
        );
        if (falta <= 0) {
          throw new HttpError(400, "Os demais meios de pagamento já cobrem o pedido; remova o novo cartão.");
        }
        const cartaoCriado = await CartaoCredito.create(
          { id_cliente: cliente.id_cliente, ...payload.novo_cartao, ativo: true },
          { transaction: t }
        );
        cartoesParaPagar.push({ id_cartao: cartaoCriado.id_cartao, valor_pago: falta });
      }

      // RN0034/RN0035: mínimo de R$ 10,00 por cartão, exceto quando os cupons deixam menos que isso a pagar.
      for (const c of cartoesParaPagar) {
        if (c.valor_pago < VALOR_MINIMO_POR_CARTAO && restanteAposCupom >= VALOR_MINIMO_POR_CARTAO) {
          throw new HttpError(400, "Valor mínimo de R$ 10,00 por cartão, exceto quando cupons cobrem o restante.");
        }
      }

      // Cartões + PIX devem cobrir exatamente o que sobrou após os cupons.
      const valorCartoes = arred(cartoesParaPagar.reduce((acc, c) => acc + c.valor_pago, 0));
      const totalPago = arred(valorCartoes + valorPix);
      if (totalPago < restanteAposCupom) {
        throw new HttpError(400, "Forma de pagamento não cobre o valor total do pedido.");
      }
      if (totalPago > restanteAposCupom) {
        throw new HttpError(400, "Os valores de pagamento informados superam o total do pedido.");
      }

      const pedido = await Pedido.create(
        {
          codigo_pedido: `PED-${randomUUID().slice(0, 10).toUpperCase()}`,
          id_cliente: cliente.id_cliente,
          id_endereco_entrega: idEnderecoEntrega,
          status: "EM_PROCESSAMENTO",
          valor_total: valorTotalComFrete,
          valor_frete: valorFrete,
          valor_pix: valorPix,
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

      for (const cartaoInput of cartoesParaPagar) {
        await PedidoCartao.create(
          { id_pedido: pedido.id_pedido, id_cartao: cartaoInput.id_cartao, valor_pago: cartaoInput.valor_pago },
          { transaction: t }
        );
      }

      // RN0037 / RN0038 / RN0028: o pagamento é validado após a finalização (EM_PROCESSAMENTO).
      // Aprovado -> APROVADA, consome cupons, gera troco e dá baixa no estoque.
      // Reprovado -> REPROVADA, sem baixa de estoque; cupons preservados e itens desbloqueados.
      const validacao = await validarPagamento({
        idCliente: cliente.id_cliente,
        cuponsAplicados,
        cartoes: cartoesParaPagar,
        transaction: t,
      });
      let aprovado = validacao.aprovado;
      let motivoReprovacao = validacao.motivo;
      if (aprovado && !(await baixarEstoque(pedido.id_pedido, itensValidos, t))) {
        aprovado = false;
        motivoReprovacao = "Estoque insuficiente no momento da aprovação.";
      }

      // Itens desbloqueados: saem do carrinho em qualquer desfecho (o estoque só é baixado se aprovado).
      for (const item of itensValidos) await item.destroy({ transaction: t });

      if (!aprovado) {
        await registrarStatus(pedido, "REPROVADA", { transaction: t });
        await pedido.update({ observacao: String(motivoReprovacao).slice(0, 255) }, { transaction: t });
        return pedido;
      }
      await registrarStatus(pedido, "APROVADA", { transaction: t });

      // RN0036: gera cupom de troco se o valor de cupons exceder o total da compra.
      const diferenca = arred(valorCupons - valorTotalComFrete);
      for (const cupom of cuponsAplicados) {
        // Cupons do cliente são consumidos por inteiro; os de catálogo só registram o uso.
        if (cupom.registro) await cupom.registro.update({ utilizado: true }, { transaction: t });
        await PedidoCupom.create(
          {
            id_pedido: pedido.id_pedido,
            id_cupom: cupom.registro ? cupom.registro.id_cupom : null,
            id_cupom_catalogo: cupom.catalogo ? cupom.catalogo.id_cupom_catalogo : null,
            valor_utilizado: cupom.valor,
          },
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
      include: [
        {
          model: ItemPedido,
          as: "itens",
          include: [{ model: Livro }],
        },
      ],
      order: [["id_pedido", "DESC"]],
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
    const pedidos = await Pedido.findAll({
      where,
      include: [{ model: ItemPedido, as: "itens" }],
      order: [["id_pedido", "DESC"]],
    });
    res.json(pedidos);
  })
);

router.get(
  "/:idPedido",
  requireCliente,
  asyncHandler(async (req, res) => {
    const pedido = await Pedido.findByPk(req.params.idPedido, {
      include: [
        { model: Endereco },
        {
          model: ItemPedido,
          as: "itens",
          include: [{ model: Livro }],
        },
        {
          model: PedidoCupom,
          as: "cupons_utilizados",
          include: [{ model: Cupom }, { model: CupomCatalogo }],
        },
        {
          model: PedidoCartao,
          as: "pagamentos_cartao",
          include: [{ model: CartaoCredito, include: [{ model: BandeiraCartao }] }],
        },
        {
          model: PedidoStatusHistorico,
          as: "historico",
          include: [{ model: Funcionario }],
        },
      ],
    });
    if (!pedido || pedido.id_cliente !== req.cliente.id_cliente) throw new HttpError(404, "Pedido não encontrado.");
    res.json(pedido);
  })
);


// RF0038 / RN0039: o administrador despacha vendas APROVADAS -> EM_TRANSITO (exibido como "EM TRANSPORTE").
router.patch(
  "/:idPedido/despachar",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const pedido = await Pedido.findByPk(req.params.idPedido);
    if (!pedido) throw new HttpError(404, "Pedido não encontrado.");
    if (pedido.status !== "APROVADA") {
      throw new HttpError(400, `Somente vendas APROVADAS podem ser despachadas (status atual: ${pedido.status}).`);
    }
    await sequelize.transaction(async (t) => {
      await pedido.update({ data_transporte: new Date() }, { transaction: t });
      await registrarStatus(pedido, "EM_TRANSITO", { transaction: t, idFuncionario: req.funcionario.id_funcionario });
    });
    res.json(pedido);
  })
);

// RF0039 / RN0040: o administrador confirma a entrega: EM_TRANSITO -> ENTREGUE.
router.patch(
  "/:idPedido/confirmar-entrega",
  requireFuncionario,
  requirePerfil("ADMIN"),
  asyncHandler(async (req, res) => {
    const pedido = await Pedido.findByPk(req.params.idPedido);
    if (!pedido) throw new HttpError(404, "Pedido não encontrado.");
    if (pedido.status !== "EM_TRANSITO") {
      throw new HttpError(400, `Somente pedidos EM TRANSPORTE podem ser entregues (status atual: ${pedido.status}).`);
    }
    await sequelize.transaction(async (t) => {
      await pedido.update({ data_entrega: new Date() }, { transaction: t });
      await registrarStatus(pedido, "ENTREGUE", { transaction: t, idFuncionario: req.funcionario.id_funcionario });
    });
    res.json(pedido);
  })
);

export default router;

