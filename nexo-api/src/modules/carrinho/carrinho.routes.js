import { Router } from "express";
import { z } from "zod";
import { asyncHandler, HttpError } from "../../utils/asyncHandler.js";
import { requireCliente } from "../../middlewares/auth.js";
import { Carrinho, ItemCarrinho, Livro } from "../../models/index.js";

const router = Router();

const MINUTOS_BLOQUEIO_ITEM = 15; // parâmetro de bloqueio temporário (RN0044)

const itemCreateSchema = z.object({
  id_livro: z.number().int(),
  quantidade: z.number().int().positive().default(1),
});

const itemUpdateSchema = z.object({
  quantidade: z.number().int().positive(),
});

async function getOrCreateCarrinho(idCliente) {
  let carrinho = await Carrinho.findOne({ where: { id_cliente: idCliente } });
  if (!carrinho) {
    carrinho = await Carrinho.create({ id_cliente: idCliente });
  }
  return carrinho;
}

// RN0044-45: remove itens cujo bloqueio expirou.
async function expirarItensVencidos(carrinho) {
  const itens = await ItemCarrinho.findAll({ where: { id_carrinho: carrinho.id_carrinho } });
  const agora = new Date();
  for (const item of itens) {
    if (!item.removido_por_expiracao && item.data_expiracao_bloqueio < agora) {
      await item.update({ removido_por_expiracao: true });
    }
  }
}

async function carregarCarrinhoComItens(idCliente) {
  const carrinho = await getOrCreateCarrinho(idCliente);
  await expirarItensVencidos(carrinho);
  const itens = await ItemCarrinho.findAll({ where: { id_carrinho: carrinho.id_carrinho } });
  return { ...carrinho.toJSON(), itens: itens.map((i) => i.toJSON()) };
}

router.get(
  "/",
  requireCliente,
  asyncHandler(async (req, res) => {
    res.json(await carregarCarrinhoComItens(req.cliente.id_cliente));
  })
);

// RN0031: valida estoque disponível antes de adicionar ao carrinho.
router.post(
  "/itens",
  requireCliente,
  asyncHandler(async (req, res) => {
    const payload = itemCreateSchema.parse(req.body);

    const livro = await Livro.findByPk(payload.id_livro);
    if (!livro || !livro.ativo) throw new HttpError(404, "Livro não encontrado ou inativo.");
    if (livro.quantidade_estoque < payload.quantidade) {
      throw new HttpError(400, "Quantidade solicitada indisponível em estoque.");
    }

    const carrinho = await getOrCreateCarrinho(req.cliente.id_cliente);
    await ItemCarrinho.create({
      id_carrinho: carrinho.id_carrinho,
      id_livro: payload.id_livro,
      quantidade: payload.quantidade,
      data_expiracao_bloqueio: new Date(Date.now() + MINUTOS_BLOQUEIO_ITEM * 60 * 1000),
    });

    res.status(201).json(await carregarCarrinhoComItens(req.cliente.id_cliente));
  })
);

router.patch(
  "/itens/:idItemCarrinho",
  requireCliente,
  asyncHandler(async (req, res) => {
    const payload = itemUpdateSchema.parse(req.body);
    const carrinho = await getOrCreateCarrinho(req.cliente.id_cliente);
    const item = await ItemCarrinho.findByPk(req.params.idItemCarrinho);
    if (!item || item.id_carrinho !== carrinho.id_carrinho) {
      throw new HttpError(404, "Item não encontrado no carrinho.");
    }

    const livro = await Livro.findByPk(item.id_livro);
    if (livro.quantidade_estoque < payload.quantidade) {
      throw new HttpError(400, "Quantidade solicitada indisponível em estoque.");
    }

    await item.update({
      quantidade: payload.quantidade,
      data_expiracao_bloqueio: new Date(Date.now() + MINUTOS_BLOQUEIO_ITEM * 60 * 1000),
    });

    res.json(await carregarCarrinhoComItens(req.cliente.id_cliente));
  })
);

router.delete(
  "/itens/:idItemCarrinho",
  requireCliente,
  asyncHandler(async (req, res) => {
    const carrinho = await getOrCreateCarrinho(req.cliente.id_cliente);
    const item = await ItemCarrinho.findByPk(req.params.idItemCarrinho);
    if (!item || item.id_carrinho !== carrinho.id_carrinho) {
      throw new HttpError(404, "Item não encontrado no carrinho.");
    }
    await item.destroy();
    res.status(204).send();
  })
);

export default router;
