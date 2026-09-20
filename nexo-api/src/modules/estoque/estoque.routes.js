import { Router } from "express";
import { z } from "zod";
import { asyncHandler, HttpError } from "../../utils/asyncHandler.js";
import { requireFuncionario, requirePerfil } from "../../middlewares/auth.js";
import { EntradaEstoque, Livro, GrupoPrecificacao } from "../../models/index.js";

const router = Router();

const entradaSchema = z.object({
  id_livro: z.number().int(),
  id_fornecedor: z.number().int(),
  quantidade: z.number().int().positive(),
  valor_custo: z.number().nonnegative(),
  data_entrada: z.string().min(1),
});

// RN0061: quantidade > 0; RN0062: valor de custo obrigatório; RNF0064: data obrigatória
router.post(
  "/entradas",
  requireFuncionario,
  requirePerfil("ADMIN", "OPERADOR_ESTOQUE"),
  asyncHandler(async (req, res) => {
    const payload = entradaSchema.parse(req.body);

    const livro = await Livro.findByPk(payload.id_livro);
    if (!livro) throw new HttpError(404, "Livro não encontrado.");

    await EntradaEstoque.create({
      ...payload,
      id_funcionario: req.funcionario.id_funcionario,
    });

    // RN0051: quando há custos diferentes, usa-se o maior custo para recalcular o valor de venda.
    const novoCusto = Math.max(Number(livro.valor_custo), payload.valor_custo);
    const grupo = await GrupoPrecificacao.findByPk(livro.id_grupo_precificacao);
    const novoValorVenda = novoCusto * (1 + Number(grupo.margem_lucro_percentual) / 100);

    await livro.update({
      valor_custo: novoCusto,
      valor_venda: novoValorVenda,
      quantidade_estoque: livro.quantidade_estoque + payload.quantidade,
    });

    res.status(201).json({ mensagem: "Entrada registrada.", quantidade_estoque: livro.quantidade_estoque });
  })
);

export default router;
