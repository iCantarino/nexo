import { Op } from "sequelize";
import { CupomCatalogo, Pedido, PedidoCupom } from "../../models/index.js";

export const arred = (n) => Math.round(n * 100) / 100;

export function buscarNoCatalogo(codigo, transaction) {
  return CupomCatalogo.findOne({ where: { codigo_cupom: codigo, ativo: true }, transaction });
}

/** Pedidos do cliente que contam como "compra feita" (cancelados não contam). */
async function idsPedidosValidos(idCliente, transaction) {
  const pedidos = await Pedido.findAll({
    where: { id_cliente: idCliente, status: { [Op.ne]: "CANCELADO" } },
    attributes: ["id_pedido"],
    transaction,
  });
  return pedidos.map((p) => p.id_pedido);
}

/**
 * Retorna o motivo pelo qual o cupom de catálogo não pode ser usado pelo cliente
 * (ou null se estiver disponível).
 */
export async function motivoIndisponivel(catalogo, idCliente, transaction) {
  const ids = await idsPedidosValidos(idCliente, transaction);
  if (catalogo.apenas_primeira_compra && ids.length > 0) {
    return `O cupom ${catalogo.codigo_cupom} é válido apenas na primeira compra.`;
  }
  if (catalogo.uso_unico_por_cliente && ids.length > 0) {
    const usos = await PedidoCupom.count({
      where: { id_cupom_catalogo: catalogo.id_cupom_catalogo, id_pedido: ids },
      transaction,
    });
    if (usos > 0) return `O cupom ${catalogo.codigo_cupom} já foi utilizado.`;
  }
  return null;
}

/** Percentual incide sobre o valor dos itens (não sobre o frete). */
export function valorDoCupom(catalogo, subtotalItens) {
  if (catalogo.percentual !== null && catalogo.percentual !== undefined) {
    return arred((subtotalItens * Number(catalogo.percentual)) / 100);
  }
  return Number(catalogo.valor_fixo);
}
