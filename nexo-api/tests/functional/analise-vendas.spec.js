import { test, expect } from "@playwright/test";
import bcrypt from "bcryptjs";
import {
  r2, auth, addLivro, novoComprador, loginAdmin, comprarComCartao, despacharEEntregar, comBanco, definirEstoque,
} from "./vendas.helpers.js";

test.describe.configure({ mode: "serial" });

/**
 * Análise de vendas por categoria — gráfico de linhas (RF0055, RNF0043, RNF0011).
 * Critérios: comparação por categoria, só ADMIN, agrupado por mês, só ENTREGUE, valor total em R$.
 *
 * Isolamento: a suíte cria categorias próprias e pedidos em 2020 (via banco, com data controlada),
 * então os totais esperados independem da massa de seed e de outras suítes.
 */
test.describe("Análise de vendas por categoria", () => {
  const SUFIXO = Date.now().toString(36);
  let admin;
  let comprador;
  let livroBase; // livro existente do catálogo (usado na compra real do cenário 06)
  let estoqueLivro;
  const cat = {}; // { A: {id, nome}, B: {...}, C: {...} }
  let seq = 0;

  const consulta = (request, { inicio, fim, categorias }) => {
    const qs = new URLSearchParams({ data_inicio: inicio, data_fim: fim });
    categorias.forEach((c) => qs.append("categorias", String(c)));
    return request.get(`/api/v1/analise/vendas-por-categoria?${qs}`, { headers: auth(admin) });
  };
  const serie = (corpo, id) => corpo.series.find((s) => s.id_categoria === id).valores;

  /** Insere um pedido com um item, direto no banco, com status e data controlados. */
  async function pedidoDeTeste({ status, data, idCategoria, quantidade, valorUnitario }) {
    seq += 1;
    await comBanco(async (c) => {
      const codigo = `TA${SUFIXO}${seq}`.slice(0, 20);
      const [p] = await c.query(
        "INSERT INTO pedido (codigo_pedido, id_cliente, id_endereco_entrega, status, valor_total, data_pedido) VALUES (?, ?, ?, ?, ?, ?)",
        [codigo, comprador.idCliente, comprador.idEndereco, status, quantidade * valorUnitario, data]
      );
      const [l] = await c.query("SELECT id_livro FROM livro_categoria WHERE id_categoria = ? LIMIT 1", [idCategoria]);
      await c.query(
        "INSERT INTO item_pedido (id_pedido, id_livro, quantidade, valor_unitario, valor_total_item) VALUES (?, ?, ?, ?, ?)",
        [p.insertId, l[0].id_livro, quantidade, valorUnitario, quantidade * valorUnitario]
      );
    });
  }

  test.beforeAll(async ({ request }) => {
    admin = await loginAdmin(request);
    comprador = await novoComprador(request);
    const lista = await (await request.get("/api/v1/livros?ativo=true")).json();
    livroBase = lista[0];
    estoqueLivro = livroBase.quantidade_estoque;
    await definirEstoque(livroBase.id_livro, Math.max(estoqueLivro, 200));

    await comBanco(async (c) => {
      for (const k of ["A", "B", "C"]) {
        const nome = `TesteAnl${k}${SUFIXO}`;
        const [r] = await c.query("INSERT INTO categoria (nome) VALUES (?)", [nome]);
        cat[k] = { id: r.insertId, nome };
        const unico = `${Date.now()}${k.charCodeAt(0)}`;
        const [liv] = await c.query(
          `INSERT INTO livro (codigo_livro, titulo, isbn, id_autor, id_editora, ano_publicacao, edicao, num_paginas, sinopse,
                              altura, largura, peso, profundidade, codigo_barras, id_grupo_precificacao, valor_custo, valor_venda, quantidade_estoque, ativo)
           SELECT ?, ?, ?, id_autor, id_editora, 2020, '1a', 100, 'teste', 20, 14, 0.3, 2, ?, id_grupo_precificacao, 10, 10, 100, TRUE
             FROM livro WHERE id_livro = ?`,
          [`TL${SUFIXO}${k}`.slice(0, 20), `Livro ${nome}`, unico.slice(0, 20), unico.slice(0, 30), livroBase.id_livro]
        );
        await c.query("INSERT INTO livro_categoria (id_livro, id_categoria) VALUES (?, ?)", [liv.insertId, cat[k].id]);
      }
    });

    // Massa: categorias A e B, jan–mar/2020, com ENTREGUE e outros status.
    await pedidoDeTeste({ status: "ENTREGUE", data: "2020-01-10 10:00:00", idCategoria: cat.A.id, quantidade: 2, valorUnitario: 50 }); // A jan 100
    await pedidoDeTeste({ status: "ENTREGUE", data: "2020-01-25 10:00:00", idCategoria: cat.A.id, quantidade: 1, valorUnitario: 30.5 }); // A jan +30,50
    await pedidoDeTeste({ status: "ENTREGUE", data: "2020-03-05 10:00:00", idCategoria: cat.A.id, quantidade: 3, valorUnitario: 20 }); // A mar 60
    await pedidoDeTeste({ status: "ENTREGUE", data: "2020-02-14 10:00:00", idCategoria: cat.B.id, quantidade: 4, valorUnitario: 25 }); // B fev 100
    await pedidoDeTeste({ status: "ENTREGUE", data: "2020-03-20 10:00:00", idCategoria: cat.B.id, quantidade: 1, valorUnitario: 75 }); // B mar 75
    // Não ENTREGUE (6 pedidos de R$ 990 na categoria A): não podem aparecer.
    const outros = ["APROVADA", "EM_TRANSITO", "EM_PROCESSAMENTO", "REPROVADA", "CANCELADO", "EM_TROCA"];
    for (const [i, status] of outros.entries()) {
      await pedidoDeTeste({ status, data: `2020-0${1 + (i % 3)}-18 10:00:00`, idCategoria: cat.A.id, quantidade: 10, valorUnitario: 99 });
    }
  });

  test.afterAll(async () => {
    await comBanco(async (c) => {
      await c.query("DELETE FROM pedido WHERE id_cliente = ?", [comprador.idCliente]);
      await c.query("DELETE ic FROM item_carrinho ic JOIN carrinho ca ON ca.id_carrinho = ic.id_carrinho WHERE ca.id_cliente = ?", [comprador.idCliente]);
      await c.query("DELETE FROM livro WHERE codigo_livro LIKE ?", [`TL${SUFIXO}%`]);
      await c.query("DELETE FROM categoria WHERE id_categoria IN (?, ?, ?)", [cat.A.id, cat.B.id, cat.C.id]);
    });
    await definirEstoque(livroBase.id_livro, estoqueLivro);
  });

  test("01 consulta de uma categoria: valores mensais = soma das vendas ENTREGUE na base (RF0055, RN0071)", async ({ request }) => {
    const r = await consulta(request, { inicio: "2020-01-01", fim: "2020-03-31", categorias: [cat.A.id] });
    expect(r.status(), await r.text()).toBe(200);
    const corpo = await r.json();
    expect(corpo.meses).toEqual(["2020-01", "2020-02", "2020-03"]);
    expect(corpo.series).toHaveLength(1);
    expect(corpo.series[0].categoria).toBe(cat.A.nome);
    expect(serie(corpo, cat.A.id)).toEqual([130.5, 0, 60]); // RN0073: fevereiro sem vendas = 0

    // Confere contra a soma calculada direto no banco.
    const noBanco = await comBanco(async (c) => {
      const [rows] = await c.query(
        `SELECT DATE_FORMAT(p.data_pedido,'%Y-%m') m, SUM(ip.valor_total_item) v
           FROM pedido p JOIN item_pedido ip ON ip.id_pedido = p.id_pedido
           JOIN livro_categoria lc ON lc.id_livro = ip.id_livro
          WHERE p.status = 'ENTREGUE' AND lc.id_categoria = ? AND p.data_pedido BETWEEN '2020-01-01' AND '2020-03-31 23:59:59'
          GROUP BY m`,
        [cat.A.id]
      );
      return Object.fromEntries(rows.map((x) => [x.m, Number(x.v)]));
    });
    expect(corpo.meses.map((m) => noBanco[m] ?? 0)).toEqual(serie(corpo, cat.A.id));
  });

  test("02 comparação entre duas ou mais categorias no período (RF0055)", async ({ request }) => {
    const r = await consulta(request, { inicio: "2020-01-01", fim: "2020-03-31", categorias: [cat.A.id, cat.B.id, cat.C.id] });
    const corpo = await r.json();
    expect(corpo.series).toHaveLength(3);
    expect(serie(corpo, cat.A.id)).toEqual([130.5, 0, 60]);
    expect(serie(corpo, cat.B.id)).toEqual([0, 100, 75]);
    expect(serie(corpo, cat.C.id)).toEqual([0, 0, 0]); // sem vendas: linha contínua em R$ 0,00
  });

  test("03 resultado pronto para gráfico de linhas: um ponto por mês e por categoria, em reais (RNF0043)", async ({ request }) => {
    const corpo = await (await consulta(request, { inicio: "2019-11-01", fim: "2020-04-30", categorias: [cat.A.id, cat.B.id] })).json();
    expect(corpo.meses).toEqual(["2019-11", "2019-12", "2020-01", "2020-02", "2020-03", "2020-04"]);
    for (const s of corpo.series) {
      expect(s.valores).toHaveLength(corpo.meses.length);
      s.valores.forEach((v) => expect(typeof v).toBe("number"));
    }
    expect(serie(corpo, cat.B.id)).toEqual([0, 0, 0, 100, 75, 0]);
  });

  test("04 alterar data de início ou de fim gera novo resultado (RF0055)", async ({ request }) => {
    const completo = await (await consulta(request, { inicio: "2020-01-01", fim: "2020-03-31", categorias: [cat.A.id] })).json();
    const semInicio = await (await consulta(request, { inicio: "2020-03-01", fim: "2020-03-31", categorias: [cat.A.id] })).json();
    const semFim = await (await consulta(request, { inicio: "2020-01-01", fim: "2020-02-28", categorias: [cat.A.id] })).json();
    expect(serie(completo, cat.A.id)).toEqual([130.5, 0, 60]);
    expect(semInicio.meses).toEqual(["2020-03"]);
    expect(serie(semInicio, cat.A.id)).toEqual([60]);
    expect(serie(semFim, cat.A.id)).toEqual([130.5, 0]);
  });

  test("05 compras com status diferente de ENTREGUE não são contabilizadas", async ({ request }) => {
    // 6 pedidos não ENTREGUE de R$ 990 na categoria A; nenhum entra: total = 130,50 + 60.
    const corpo = await (await consulta(request, { inicio: "2020-01-01", fim: "2020-03-31", categorias: [cat.A.id] })).json();
    expect(r2(serie(corpo, cat.A.id).reduce((a, v) => a + v, 0))).toBe(190.5);
  });

  test("06 compra que passa a ENTREGUE dentro do período é refletida na consulta seguinte", async ({ request }) => {
    const hoje = new Date();
    const ym = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const inicio = `${ym(new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1))}-01`;
    const fim = `${ym(new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1))}-28`;

    // Vincula o livro do catálogo à categoria C (sem vendas) e compra de verdade pela API.
    await comBanco((c) => c.query("INSERT INTO livro_categoria (id_livro, id_categoria) VALUES (?, ?)", [livroBase.id_livro, cat.C.id]));
    await addLivro(request, comprador.token, livroBase.id_livro, 2);
    const pedido = await comprarComCartao(request, comprador);
    const soma = await comBanco(async (c) => (await c.query("SELECT SUM(valor_total_item) v FROM item_pedido WHERE id_pedido = ?", [pedido.id_pedido]))[0][0].v);
    const valor = r2(Number(soma));
    expect(valor).toBeGreaterThan(0);

    const total = async () =>
      serie(await (await consulta(request, { inicio, fim, categorias: [cat.C.id] })).json(), cat.C.id).reduce((a, v) => a + v, 0);
    expect(await total()).toBe(0); // APROVADA: não conta

    await despacharEEntregar(request, admin, pedido.id_pedido);
    expect(r2(await total())).toBe(valor); // ENTREGUE: passa a contar
  });

  test("07 acesso permitido ao administrador e negado a outros perfis (critério b)", async ({ request }) => {
    const url = `/api/v1/analise/vendas-por-categoria?data_inicio=2020-01-01&data_fim=2020-03-31&categorias=${cat.A.id}`;
    expect((await request.get(url, { headers: auth(admin) })).status()).toBe(200);
    expect((await request.get("/api/v1/analise/categorias", { headers: auth(admin) })).status()).toBe(200);

    // Sem autenticação e cliente comum.
    expect((await request.get(url)).status()).toBe(401);
    expect((await request.get(url, { headers: auth(comprador.token) })).status()).toBe(401);
    expect((await request.get("/api/v1/analise/categorias", { headers: auth(comprador.token) })).status()).toBe(401);

    // Funcionário que não é ADMIN.
    const email = `gerente.${SUFIXO}@nexo.com`;
    const hash = await bcrypt.hash("Gerente#123", 10);
    await comBanco((c) =>
      c.query("INSERT INTO funcionario (nome, email, senha_hash, perfil, ativo) VALUES ('Gerente Teste', ?, ?, 'GERENTE_VENDAS', TRUE)", [email, hash])
    );
    try {
      const login = await request.post("/api/v1/auth/funcionario/login", { data: { email, senha: "Gerente#123" } });
      const token = (await login.json()).access_token;
      expect((await request.get(url, { headers: auth(token) })).status()).toBe(403);
      expect((await request.get("/api/v1/analise/categorias", { headers: auth(token) })).status()).toBe(403);
    } finally {
      await comBanco((c) => c.query("DELETE FROM funcionario WHERE email = ?", [email]));
    }
  });

  test("08 tempo de resposta da consulta de até 1 segundo, com 24 meses e todas as categorias (RNF0011)", async ({ request }) => {
    const todas = await (await request.get("/api/v1/analise/categorias", { headers: auth(admin) })).json();
    expect(todas.length).toBeGreaterThan(2);
    for (let i = 0; i < 5; i++) {
      const t0 = Date.now();
      const r = await consulta(request, { inicio: "2019-01-01", fim: "2020-12-31", categorias: todas.map((c) => c.id_categoria) });
      const ms = Date.now() - t0;
      expect(r.status()).toBe(200);
      expect(ms, `consulta ${i + 1} levou ${ms} ms`).toBeLessThanOrEqual(1000);
    }
  });

  test("09 validações: categoria obrigatória, fim >= início e máximo de 24 meses (RN0072)", async ({ request }) => {
    expect((await consulta(request, { inicio: "2020-01-01", fim: "2020-03-31", categorias: [] })).status()).toBe(400);
    expect((await consulta(request, { inicio: "2020-03-01", fim: "2020-01-31", categorias: [cat.A.id] })).status()).toBe(400);
    expect((await consulta(request, { inicio: "2018-01-01", fim: "2020-12-31", categorias: [cat.A.id] })).status()).toBe(400);
    expect((await consulta(request, { inicio: "2019-01-01", fim: "2020-12-31", categorias: [cat.A.id] })).status()).toBe(200); // exatamente 24 meses
    expect((await consulta(request, { inicio: "xx", fim: "2020-12-31", categorias: [cat.A.id] })).status()).toBe(400);
  });
});
