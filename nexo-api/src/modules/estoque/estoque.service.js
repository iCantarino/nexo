import { Livro, MovimentacaoEstoque } from "../../models/index.js";

/**
 * RF0053 / RN0028: baixa de estoque — somente para compras aprovadas.
 * Retorna false (sem alterar nada) se algum item não tiver saldo.
 */
export async function baixarEstoque(idPedido, itens, transaction) {
  const livros = [];
  for (const item of itens) {
    const livro = await Livro.findByPk(item.id_livro, { transaction, lock: transaction.LOCK.UPDATE });
    if (!livro || livro.quantidade_estoque < item.quantidade) return false;
    livros.push({ livro, item });
  }
  for (const { livro, item } of livros) {
    await livro.update({ quantidade_estoque: livro.quantidade_estoque - item.quantidade }, { transaction });
    await MovimentacaoEstoque.create(
      { id_livro: livro.id_livro, tipo: "BAIXA", quantidade: item.quantidade, id_pedido: idPedido },
      { transaction }
    );
  }
  return true;
}

/** RF0054: reentrada no estoque dos itens trocados. */
export async function reentradaEstoque(idPedido, idTroca, itens, transaction) {
  for (const item of itens) {
    const livro = await Livro.findByPk(item.id_livro, { transaction, lock: transaction.LOCK.UPDATE });
    await livro.update({ quantidade_estoque: livro.quantidade_estoque + item.quantidade }, { transaction });
    await MovimentacaoEstoque.create(
      { id_livro: livro.id_livro, tipo: "REENTRADA", quantidade: item.quantidade, id_pedido: idPedido, id_troca: idTroca },
      { transaction }
    );
  }
}
