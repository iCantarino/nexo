import { Router } from "express";
import { z } from "zod";
import { asyncHandler, HttpError } from "../../utils/asyncHandler.js";
import { requireCliente } from "../../middlewares/auth.js";
import { ItemCarrinho, Livro, Autor } from "../../models/index.js";
import {
  MINUTOS_BLOQUEIO,
  estoqueDisponivel,
  expirarItensVencidos,
  getOrCreateCarrinho,
  novoPrazoBloqueio,
  renovarPrazoCarrinho,
} from "./carrinho.service.js";

const router = Router();

const itemCreateSchema = z.object({
  id_livro: z.number().int(),
  quantidade: z.number().int().positive().default(1),
});

const itemUpdateSchema = z.object({
  quantidade: z.number().int().positive(),
});

/**
 * RF0031 / RNF0042: carrinho com os itens ativos e os removidos por expiração do bloqueio.
 * `pode_comprar` fica false enquanto houver itens expirados (botão "comprar" desabilitado).
 */
async function carregarCarrinhoComItens(idCliente) {
  const carrinho = await getOrCreateCarrinho(idCliente);
  await expirarItensVencidos(carrinho);
  const itens = await ItemCarrinho.findAll({
    where: { id_carrinho: carrinho.id_carrinho },
    include: [{ model: Livro, as: "livro", include: [{ model: Autor }] }],
  });
  const json = itens.map((i) => i.toJSON());
  const ativos = json.filter((i) => !i.removido_por_expiracao);
  const expirados = json.filter((i) => i.removido_por_expiracao);
  return {
    ...carrinho.toJSON(),
    itens: json,
    itens_expirados: expirados,
    minutos_bloqueio: MINUTOS_BLOQUEIO,
    pode_comprar: ativos.length > 0 && expirados.length === 0,
  };
}

router.get(
  "/",
  requireCliente,
  asyncHandler(async (req, res) => {
    res.json(await carregarCarrinhoComItens(req.cliente.id_cliente));
  })
);

// RF0031 / RN0031: valida estoque disponível antes de adicionar ao carrinho.
// RN0044: bloqueia o item; o prazo é relativo ao último item incluído.
router.post(
  "/itens",
  requireCliente,
  asyncHandler(async (req, res) => {
    const payload = itemCreateSchema.parse(req.body);

    const livro = await Livro.findByPk(payload.id_livro);
    if (!livro || !livro.ativo) throw new HttpError(404, "Livro não encontrado ou inativo.");

    const carrinho = await getOrCreateCarrinho(req.cliente.id_cliente);
    await expirarItensVencidos(carrinho);

    const existente = await ItemCarrinho.findOne({
      where: { id_carrinho: carrinho.id_carrinho, id_livro: payload.id_livro, removido_por_expiracao: false },
    });
    const quantidadeFinal = payload.quantidade + (existente ? existente.quantidade : 0);
    if ((await estoqueDisponivel(livro, carrinho.id_carrinho)) < quantidadeFinal) {
      throw new HttpError(400, "Quantidade solicitada indisponível em estoque.");
    }

    if (existente) {
      await existente.update({ quantidade: quantidadeFinal });
    } else {
      await ItemCarrinho.create({
        id_carrinho: carrinho.id_carrinho,
        id_livro: payload.id_livro,
        quantidade: payload.quantidade,
        data_expiracao_bloqueio: novoPrazoBloqueio(),
      });
    }
    await renovarPrazoCarrinho(carrinho);

    res.status(201).json(await carregarCarrinhoComItens(req.cliente.id_cliente));
  })
);

// RF0032: altera a quantidade de um item já adicionado.
router.patch(
  "/itens/:idItemCarrinho",
  requireCliente,
  asyncHandler(async (req, res) => {
    const payload = itemUpdateSchema.parse(req.body);
    const carrinho = await getOrCreateCarrinho(req.cliente.id_cliente);
    await expirarItensVencidos(carrinho);
    const item = await ItemCarrinho.findByPk(req.params.idItemCarrinho);
    if (!item || item.id_carrinho !== carrinho.id_carrinho) {
      throw new HttpError(404, "Item não encontrado no carrinho.");
    }
    if (item.removido_por_expiracao) {
      throw new HttpError(409, "O bloqueio deste item expirou; reinclua-o no carrinho.");
    }

    const livro = await Livro.findByPk(item.id_livro);
    if ((await estoqueDisponivel(livro, carrinho.id_carrinho)) < payload.quantidade) {
      throw new HttpError(400, "Quantidade solicitada indisponível em estoque.");
    }

    await item.update({ quantidade: payload.quantidade });
    await renovarPrazoCarrinho(carrinho);

    res.json(await carregarCarrinhoComItens(req.cliente.id_cliente));
  })
);

// RNF0042: itens removidos por expiração voltam ao carrinho (se ainda houver estoque), reabilitando a compra.
router.post(
  "/reincluir-expirados",
  requireCliente,
  asyncHandler(async (req, res) => {
    const carrinho = await getOrCreateCarrinho(req.cliente.id_cliente);
    await expirarItensVencidos(carrinho);
    const expirados = await ItemCarrinho.findAll({
      where: { id_carrinho: carrinho.id_carrinho, removido_por_expiracao: true },
    });

    const alertas = [];
    for (const item of expirados) {
      const livro = await Livro.findByPk(item.id_livro);
      const disponivel = livro && livro.ativo ? await estoqueDisponivel(livro, carrinho.id_carrinho) : 0;
      const titulo = livro ? livro.titulo : `#${item.id_livro}`;
      if (disponivel <= 0) {
        await item.destroy();
        alertas.push(`'${titulo}' não está mais disponível e foi removido do carrinho.`);
        continue;
      }
      const quantidade = Math.min(item.quantidade, disponivel);
      if (quantidade < item.quantidade) {
        alertas.push(`A quantidade de '${titulo}' foi ajustada para ${quantidade} (estoque disponível).`);
      }
      await item.update({ quantidade, removido_por_expiracao: false, notificado_expiracao: false });
    }
    await renovarPrazoCarrinho(carrinho);

    res.json({ ...(await carregarCarrinhoComItens(req.cliente.id_cliente)), alertas });
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
