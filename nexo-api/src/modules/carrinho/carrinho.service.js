import { Op } from "sequelize";
import { env } from "../../config/env.js";
import { Carrinho, ItemCarrinho, Livro } from "../../models/index.js";

/** RN0044 / RNF0045: prazo parametrizado (minutos) do bloqueio dos itens do carrinho. */
export const MINUTOS_BLOQUEIO = env.carrinho.minutosBloqueio;

export const novoPrazoBloqueio = () => new Date(Date.now() + MINUTOS_BLOQUEIO * 60 * 1000);

export async function getOrCreateCarrinho(idCliente, transaction) {
  let carrinho = await Carrinho.findOne({ where: { id_cliente: idCliente }, transaction });
  if (!carrinho) carrinho = await Carrinho.create({ id_cliente: idCliente }, { transaction });
  return carrinho;
}

/**
 * RN0044 / RN0045: itens cujo bloqueio venceu são desbloqueados e TODOS os itens do mesmo
 * produto são retirados do carrinho (marcados como removidos por expiração para exibição, RNF0042).
 */
export async function expirarItensVencidos(carrinho, transaction) {
  const itens = await ItemCarrinho.findAll({ where: { id_carrinho: carrinho.id_carrinho }, transaction });
  const agora = new Date();
  const livrosVencidos = new Set(
    itens.filter((i) => !i.removido_por_expiracao && i.data_expiracao_bloqueio < agora).map((i) => i.id_livro)
  );
  if (livrosVencidos.size === 0) return;
  for (const item of itens) {
    if (!item.removido_por_expiracao && livrosVencidos.has(item.id_livro)) {
      await item.update({ removido_por_expiracao: true }, { transaction });
    }
  }
}

/** RN0044: o prazo é relativo ao último item incluído — renova o bloqueio de todos os itens ativos. */
export async function renovarPrazoCarrinho(carrinho, transaction) {
  await ItemCarrinho.update(
    { data_expiracao_bloqueio: novoPrazoBloqueio(), data_bloqueio: new Date() },
    { where: { id_carrinho: carrinho.id_carrinho, removido_por_expiracao: false }, transaction }
  );
}

/** Quantidade do livro bloqueada (não expirada) nos carrinhos de OUTROS clientes. */
export async function quantidadeBloqueadaPorOutros(idLivro, idCarrinhoProprio, transaction) {
  const itens = await ItemCarrinho.findAll({
    where: {
      id_livro: idLivro,
      removido_por_expiracao: false,
      data_expiracao_bloqueio: { [Op.gt]: new Date() },
      id_carrinho: { [Op.ne]: idCarrinhoProprio },
    },
    transaction,
  });
  return itens.reduce((acc, i) => acc + i.quantidade, 0);
}

/** RN0031: estoque efetivamente disponível para o carrinho (estoque físico menos bloqueios alheios). */
export async function estoqueDisponivel(livro, idCarrinhoProprio, transaction) {
  const bloqueado = await quantidadeBloqueadaPorOutros(livro.id_livro, idCarrinhoProprio, transaction);
  return Math.max(livro.quantidade_estoque - bloqueado, 0);
}

export async function carregarItens(carrinho, transaction) {
  return ItemCarrinho.findAll({ where: { id_carrinho: carrinho.id_carrinho }, transaction });
}

/**
 * RN0032: revalida o estoque dos itens ativos. Ajusta quantidades, remove itens indisponíveis
 * e devolve a lista de alertas para o usuário.
 */
export async function revalidarEstoqueDoCarrinho(carrinho, transaction) {
  const alertas = [];
  const itens = (await carregarItens(carrinho, transaction)).filter((i) => !i.removido_por_expiracao);
  for (const item of itens) {
    const livro = await Livro.findByPk(item.id_livro, { transaction });
    const titulo = livro ? livro.titulo : `#${item.id_livro}`;
    if (!livro || !livro.ativo || livro.quantidade_estoque <= 0) {
      await item.destroy({ transaction });
      alertas.push(`O livro '${titulo}' não está mais disponível e foi removido do carrinho.`);
    } else if (livro.quantidade_estoque < item.quantidade) {
      const antes = item.quantidade;
      await item.update({ quantidade: livro.quantidade_estoque }, { transaction });
      alertas.push(
        `A quantidade de '${titulo}' foi ajustada de ${antes} para ${livro.quantidade_estoque} (estoque alterado).`
      );
    }
  }
  return alertas;
}
