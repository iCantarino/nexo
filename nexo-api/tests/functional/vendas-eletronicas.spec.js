import { test, expect } from "@playwright/test";
import {
  r2, auth, addLivro, pedir, lerCarrinho, estoqueDe, novoComprador, loginAdmin,
  emitirCupom, expirarBloqueio, definirEstoque, comprarComCartao, despacharEEntregar, comBanco,
} from "./vendas.helpers.js";

test.describe.configure({ mode: "serial" });

/**
 * UC Gerenciar Vendas Eletrônicas — roteiro mínimo de demonstração (cenários 1 a 11).
 * Cada teste indica os requisitos do DRS que demonstra.
 */
test.describe("UC Gerenciar Vendas Eletrônicas", () => {
  let livros = [];
  let admin;
  const estoqueOriginal = new Map(); // id_livro -> estoque antes da suíte (restaurado ao final)

  test("00 prepara catálogo (estoque garantido) e administrador", async ({ request }) => {
    const r = await request.get("/api/v1/livros?ativo=true");
    expect(r.status()).toBe(200);
    const ativos = (await r.json()).filter((l) => l.ativo);
    expect(ativos.length).toBeGreaterThan(1);
    // As compras da suíte consomem estoque; garante saldo para todos os cenários e restaura no fim.
    for (const l of ativos) {
      estoqueOriginal.set(l.id_livro, l.quantidade_estoque);
      await definirEstoque(l.id_livro, Math.max(l.quantidade_estoque, 200));
    }
    livros = ativos.sort((a, b) => Number(b.valor_venda) - Number(a.valor_venda));
    admin = await loginAdmin(request);
  });

  test.afterAll(async () => {
    for (const [idLivro, quantidade] of estoqueOriginal) await definirEstoque(idLivro, quantidade);
    // Libera os bloqueios de carrinho deixados pelos compradores de teste.
    await comBanco((c) => c.query("DELETE ic FROM item_carrinho ic JOIN carrinho ca ON ca.id_carrinho = ic.id_carrinho JOIN cliente cl ON cl.id_cliente = ca.id_cliente WHERE cl.email LIKE 'vendas.%@nexo.com'"));
  });

  test("01 compra aprovada com um cartão: EM_PROCESSAMENTO -> APROVADA, com baixa de estoque (RF0037, RN0037, RN0038, RF0053)", async ({ request }) => {
    const B = await novoComprador(request);
    const livro = livros[0];
    const antes = await estoqueDe(request, livro.id_livro);
    await addLivro(request, B.token, livro.id_livro, 2);
    const c = await lerCarrinho(request, B.token);
    expect(c.bruto.pode_comprar).toBe(true);

    const pedido = await comprarComCartao(request, B);
    expect(pedido.status).toBe("APROVADA");
    expect(Number(pedido.valor_total)).toBeCloseTo(c.total, 2);

    expect(await estoqueDe(request, livro.id_livro)).toBe(antes - 2);
    expect((await lerCarrinho(request, B.token)).itens.length).toBe(0);

    // O histórico registra EM_PROCESSAMENTO -> APROVADA (RNF0012).
    const hist = await comBanco(
      async (cx) =>
        (await cx.query("SELECT status_novo FROM pedido_status_historico WHERE id_pedido = ? ORDER BY id_historico", [pedido.id_pedido]))[0]
    );
    expect(hist.map((h) => h.status_novo)).toEqual(["EM_PROCESSAMENTO", "APROVADA"]);
  });

  test("02 dois cartões: abaixo de R$ 10,00 em um deles é bloqueado (RN0034)", async ({ request }) => {
    const B = await novoComprador(request);
    await addLivro(request, B.token, livros[0].id_livro, 3);
    const c = await lerCarrinho(request, B.token);

    const abaixo = await pedir(request, B.token, {
      id_endereco_entrega: B.idEndereco,
      cartoes: [{ id_cartao: B.idCartao, valor_pago: 5 }, { id_cartao: B.idCartao2, valor_pago: r2(c.total - 5) }],
    });
    expect(abaixo.status()).toBe(400);
    expect((await abaixo.json()).detail).toMatch(/10,00/);

    const ok = await pedir(request, B.token, {
      id_endereco_entrega: B.idEndereco,
      cartoes: [{ id_cartao: B.idCartao, valor_pago: 10 }, { id_cartao: B.idCartao2, valor_pago: r2(c.total - 10) }],
    });
    expect(ok.status(), await ok.text()).toBe(201);
    expect((await ok.json()).status).toBe("APROVADA");
  });

  test("03 cupom promocional + cartão com menos de R$ 10,00 é permitido (RN0033, RN0035)", async ({ request }) => {
    const B = await novoComprador(request);
    await addLivro(request, B.token, livros[0].id_livro, 2);
    const c = await lerCarrinho(request, B.token);
    const promo = await emitirCupom(B.idCliente, "PROMOCIONAL", r2(c.total - 5));

    const r = await pedir(request, B.token, {
      id_endereco_entrega: B.idEndereco,
      codigos_cupom: [promo],
      cartoes: [{ id_cartao: B.idCartao, valor_pago: 5 }],
    });
    expect(r.status(), await r.text()).toBe(201);
    expect((await r.json()).status).toBe("APROVADA");

    // RN0033: dois cupons promocionais na mesma compra não são aceitos.
    await addLivro(request, B.token, livros[0].id_livro, 2);
    const p1 = await emitirCupom(B.idCliente, "PROMOCIONAL", 5);
    const p2 = await emitirCupom(B.idCliente, "PROMOCIONAL", 5);
    const c2 = await lerCarrinho(request, B.token);
    const dois = await pedir(request, B.token, {
      id_endereco_entrega: B.idEndereco, codigos_cupom: [p1, p2],
      cartoes: [{ id_cartao: B.idCartao, valor_pago: r2(c2.total - 10) }],
    });
    expect(dois.status()).toBe(400);
  });

  test("04 cupons de troca acima do valor da compra geram cupom com a diferença (RN0036)", async ({ request }) => {
    const B = await novoComprador(request);
    await addLivro(request, B.token, livros[0].id_livro, 2);
    const c = await lerCarrinho(request, B.token);
    const v = r2(c.total * 0.6);
    const cupomA = await emitirCupom(B.idCliente, "TROCA", v);
    const cupomB = await emitirCupom(B.idCliente, "TROCA", v);
    const cupomC = await emitirCupom(B.idCliente, "TROCA", v); // desnecessário: A + B já cobrem

    const desnecessario = await pedir(request, B.token, { id_endereco_entrega: B.idEndereco, codigos_cupom: [cupomA, cupomB, cupomC] });
    expect(desnecessario.status()).toBe(400);
    expect((await desnecessario.json()).detail).toMatch(/desnecess/i);

    const r = await pedir(request, B.token, { id_endereco_entrega: B.idEndereco, codigos_cupom: [cupomA, cupomB] });
    expect(r.status(), await r.text()).toBe(201);
    expect((await r.json()).status).toBe("APROVADA");

    const cupons = await (await request.get("/api/v1/cupons/meus", { headers: auth(B.token) })).json();
    const troco = cupons.find((x) => x.codigo_cupom.startsWith("TROCO-"));
    expect(troco, "cupom de diferença").toBeTruthy();
    expect(troco.tipo).toBe("TROCA");
    expect(Number(troco.valor)).toBeCloseTo(r2(v * 2 - c.total), 2);
    // Os cupons usados ficam consumidos; o que não foi usado continua disponível.
    expect(cupons.find((x) => x.codigo_cupom === cupomA).utilizado).toBe(true);
    expect(cupons.find((x) => x.codigo_cupom === cupomC).utilizado).toBe(false);
  });

  test("05 compra REPROVADA: sem baixa de estoque, itens desbloqueados e cupom preservado (RN0038, RN0028, RF0053)", async ({ request }) => {
    const B = await novoComprador(request);
    const livro = livros[0];
    const antes = await estoqueDe(request, livro.id_livro);
    await addLivro(request, B.token, livro.id_livro, 2);
    const c = await lerCarrinho(request, B.token);
    const cupom = await emitirCupom(B.idCliente, "TROCA", 8);

    const r = await pedir(request, B.token, {
      id_endereco_entrega: B.idEndereco,
      codigos_cupom: [cupom],
      cartoes: [{ id_cartao: B.idCartaoRecusado, valor_pago: r2(c.total - 8) }],
    });
    expect(r.status(), await r.text()).toBe(201);
    const pedido = await r.json();
    expect(pedido.status).toBe("REPROVADA");

    expect(await estoqueDe(request, livro.id_livro)).toBe(antes);
    expect((await lerCarrinho(request, B.token)).itens.length).toBe(0);
    const movs = await comBanco(
      async (cx) => (await cx.query("SELECT COUNT(*) n FROM movimentacao_estoque WHERE id_pedido = ?", [pedido.id_pedido]))[0][0].n
    );
    expect(movs).toBe(0);
    const cupons = await (await request.get("/api/v1/cupons/meus", { headers: auth(B.token) })).json();
    expect(cupons.find((x) => x.codigo_cupom === cupom).utilizado).toBe(false);

    // Compra reprovada não pode ser despachada.
    const d = await request.patch(`/api/v1/pedidos/${pedido.id_pedido}/despachar`, { headers: auth(admin) });
    expect(d.status()).toBe(400);
  });

  test("06 expiração do bloqueio: itens removidos, 'comprar' desabilitado e compra negada (RN0044, RN0045, RNF0045, RNF0042)", async ({ request }) => {
    const B = await novoComprador(request);
    await addLivro(request, B.token, livros[0].id_livro, 1);
    const resp = await addLivro(request, B.token, livros[1 % livros.length].id_livro, 1);
    const antes = await resp.json();
    expect(antes.pode_comprar).toBe(true);
    expect(antes.minutos_bloqueio).toBeGreaterThan(0);

    // O prazo é relativo ao último item incluído: todos os itens ativos compartilham o mesmo vencimento.
    const ativos = antes.itens.filter((i) => !i.removido_por_expiracao);
    expect(new Set(ativos.map((i) => new Date(i.data_expiracao_bloqueio).getTime())).size).toBe(1);

    await expirarBloqueio(ativos[0].id_item_carrinho);
    const depois = await (await request.get("/api/v1/carrinho", { headers: auth(B.token) })).json();
    expect(depois.pode_comprar).toBe(false);
    expect(depois.itens_expirados.length).toBeGreaterThan(0);
    // RN0045: todos os itens do mesmo produto saem do carrinho.
    const idsExpirados = new Set(depois.itens_expirados.map((i) => i.id_livro));
    expect(depois.itens.filter((i) => idsExpirados.has(i.id_livro)).every((i) => i.removido_por_expiracao)).toBe(true);

    const compra = await pedir(request, B.token, { id_endereco_entrega: B.idEndereco, cartoes: [{ id_cartao: B.idCartao, valor_pago: 50 }] });
    expect(compra.status()).toBe(409);

    // RNF0042: os itens voltam ao carrinho e a compra é reabilitada.
    const volta = await request.post("/api/v1/carrinho/reincluir-expirados", { headers: auth(B.token) });
    expect(volta.status()).toBe(200);
    const reaberto = await volta.json();
    expect(reaberto.pode_comprar).toBe(true);
    expect(reaberto.itens_expirados.length).toBe(0);
  });

  test("07 fluxo do administrador: APROVADA -> EM_TRANSITO -> ENTREGUE (RF0038, RN0039, RF0039, RN0040)", async ({ request }) => {
    const B = await novoComprador(request);
    await addLivro(request, B.token, livros[0].id_livro, 1);
    const pedido = await comprarComCartao(request, B);

    // Cliente não executa transições; entrega exige o pedido em transporte.
    const clienteTenta = await request.patch(`/api/v1/pedidos/${pedido.id_pedido}/despachar`, { headers: auth(B.token) });
    expect(clienteTenta.status()).toBe(401);
    const entregaCedo = await request.patch(`/api/v1/pedidos/${pedido.id_pedido}/confirmar-entrega`, { headers: auth(admin) });
    expect(entregaCedo.status()).toBe(400);

    const lista = await (await request.get("/api/v1/pedidos/admin/todos?status_filtro=APROVADA", { headers: auth(admin) })).json();
    expect(lista.some((p) => p.id_pedido === pedido.id_pedido)).toBe(true);

    const d = await request.patch(`/api/v1/pedidos/${pedido.id_pedido}/despachar`, { headers: auth(admin) });
    expect((await d.json()).status).toBe("EM_TRANSITO");
    const e = await request.patch(`/api/v1/pedidos/${pedido.id_pedido}/confirmar-entrega`, { headers: auth(admin) });
    expect((await e.json()).status).toBe("ENTREGUE");

    const meus = await (await request.get("/api/v1/pedidos/meus", { headers: auth(B.token) })).json();
    expect(meus.find((p) => p.id_pedido === pedido.id_pedido).status).toBe("ENTREGUE");
  });


  /** Compra de dois livros diferentes, aprovada, despachada e entregue. */
  async function pedidoEntregue(request, B) {
    await addLivro(request, B.token, livros[0].id_livro, 2);
    await addLivro(request, B.token, livros[1 % livros.length].id_livro, 1);
    const pedido = await comprarComCartao(request, B);
    await despacharEEntregar(request, admin, pedido.id_pedido);
    return (await (await request.get(`/api/v1/pedidos/${pedido.id_pedido}`, { headers: auth(B.token) })).json());
  }

  test("08 troca de pedido que não está ENTREGUE é bloqueada (RN0043, RN0041)", async ({ request }) => {
    const B = await novoComprador(request);
    await addLivro(request, B.token, livros[0].id_livro, 1);
    const aprovado = await comprarComCartao(request, B);
    const r = await request.post("/api/v1/trocas", {
      headers: auth(B.token),
      data: { id_pedido: aprovado.id_pedido, motivo: "Defeito", compra_inteira: true },
    });
    expect(r.status()).toBe(400);
    expect((await r.json()).detail).toMatch(/entregues/i);

    // Outro cliente também não enxerga o pedido.
    const C = await novoComprador(request);
    const alheio = await request.post("/api/v1/trocas", {
      headers: auth(C.token),
      data: { id_pedido: aprovado.id_pedido, motivo: "Teste", compra_inteira: true },
    });
    expect(alheio.status()).toBe(404);
  });

  test("09 troca de um item e troca da compra inteira (RF0040, RN0041)", async ({ request }) => {
    const B = await novoComprador(request);
    const pedido = await pedidoEntregue(request, B);
    const item = pedido.itens[0];

    // Quantidade acima da comprada é recusada.
    const demais = await request.post("/api/v1/trocas", {
      headers: auth(B.token),
      data: { id_pedido: pedido.id_pedido, motivo: "Erro", itens: [{ id_item_pedido: item.id_item_pedido, quantidade: item.quantidade + 1 }] },
    });
    expect(demais.status()).toBe(400);

    // Troca de UM item.
    const umItem = await request.post("/api/v1/trocas", {
      headers: auth(B.token),
      data: { id_pedido: pedido.id_pedido, motivo: "Página rasgada", itens: [{ id_item_pedido: item.id_item_pedido, quantidade: 1 }] },
    });
    expect(umItem.status(), await umItem.text()).toBe(201);
    const troca1 = await umItem.json();
    expect(troca1.status).toBe("SOLICITADA");
    expect(troca1.compra_inteira).toBe(false);
    expect(troca1.itens.length).toBe(1);
    const emTroca = await (await request.get(`/api/v1/pedidos/${pedido.id_pedido}`, { headers: auth(B.token) })).json();
    expect(emTroca.status).toBe("EM_TROCA");

    // Troca da COMPRA INTEIRA (em outro pedido entregue).
    const outro = await pedidoEntregue(request, B);
    const inteira = await request.post("/api/v1/trocas", {
      headers: auth(B.token),
      data: { id_pedido: outro.id_pedido, motivo: "Não era o que eu queria", compra_inteira: true },
    });
    expect(inteira.status(), await inteira.text()).toBe(201);
    const troca2 = await inteira.json();
    expect(troca2.compra_inteira).toBe(true);
    expect(troca2.itens.length).toBe(outro.itens.length);
    const somaTrocada = troca2.itens.reduce((a, i) => a + i.quantidade, 0);
    expect(somaTrocada).toBe(outro.itens.reduce((a, i) => a + i.quantidade, 0));

    const minhas = await (await request.get("/api/v1/trocas/minhas", { headers: auth(B.token) })).json();
    expect(minhas.length).toBe(2);
  });


  let trocaCupom; // dados do cenário 10, reaproveitados no 11

  test("10 fluxo da troca: solicitação, admin visualiza, autoriza com notificação, recebe, cupom e reentrada no estoque (RF0041-RF0044, RF0054, RNF0046)", async ({ request }) => {
    const B = await novoComprador(request);
    const pedido = await pedidoEntregue(request, B);
    const item = pedido.itens[0];
    const livroTrocado = item.id_livro;

    const sol = await request.post("/api/v1/trocas", {
      headers: auth(B.token),
      data: { id_pedido: pedido.id_pedido, motivo: "Defeito de impressão", itens: [{ id_item_pedido: item.id_item_pedido, quantidade: 1 }] },
    });
    expect(sol.status(), await sol.text()).toBe(201);
    const troca = await sol.json();

    // RF0042: o administrador visualiza o pedido de troca.
    const pendentes = await (await request.get("/api/v1/trocas/admin/pendentes", { headers: auth(admin) })).json();
    const visivel = pendentes.find((t) => t.id_troca === troca.id_troca);
    expect(visivel).toBeTruthy();
    expect(visivel.pedido.status).toBe("EM_TROCA");

    // Receber antes de autorizar não é permitido; o cliente não autoriza.
    const cedo = await request.patch(`/api/v1/trocas/${troca.id_troca}/receber`, { headers: auth(admin), data: {} });
    expect(cedo.status()).toBe(400);
    const clienteAut = await request.patch(`/api/v1/trocas/${troca.id_troca}/autorizar`, { headers: auth(B.token), data: {} });
    expect(clienteAut.status()).toBe(401);

    // RF0041 / RNF0046: autoriza e o cliente é notificado.
    const semNotif = await (await request.get("/api/v1/notificacoes", { headers: auth(B.token) })).json();
    expect(semNotif.length).toBe(0);
    const aut = await request.patch(`/api/v1/trocas/${troca.id_troca}/autorizar`, { headers: auth(admin), data: {} });
    expect(aut.status(), await aut.text()).toBe(200);
    const autorizado = await (await request.get(`/api/v1/pedidos/${pedido.id_pedido}`, { headers: auth(B.token) })).json();
    expect(autorizado.status).toBe("TROCA_AUTORIZADA");
    const notifs = await (await request.get("/api/v1/notificacoes?nao_lidas=true", { headers: auth(B.token) })).json();
    expect(notifs.length).toBe(1);
    expect(notifs[0].tipo).toBe("TROCA_AUTORIZADA");
    expect(notifs[0].id_pedido).toBe(pedido.id_pedido);
    const lida = await request.patch(`/api/v1/notificacoes/${notifs[0].id_notificacao}/lida`, { headers: auth(B.token) });
    expect((await lida.json()).lida).toBe(true);

    // RF0043 / RN0042 / RF0044 / RF0054: recebimento -> TROCADO, cupom e reentrada no estoque.
    const estoqueAntes = await estoqueDe(request, livroTrocado);
    const rec = await request.patch(`/api/v1/trocas/${troca.id_troca}/receber`, { headers: auth(admin), data: {} });
    expect(rec.status(), await rec.text()).toBe(200);
    expect((await rec.json()).status).toBe("PROCESSADA");

    const final = await (await request.get(`/api/v1/pedidos/${pedido.id_pedido}`, { headers: auth(B.token) })).json();
    expect(final.status).toBe("TROCADO");
    expect(await estoqueDe(request, livroTrocado)).toBe(estoqueAntes + 1);
    expect(final.itens.find((i) => i.id_item_pedido === item.id_item_pedido).quantidade_trocada).toBe(1);

    const cupons = await (await request.get("/api/v1/cupons/meus", { headers: auth(B.token) })).json();
    const cupom = cupons.find((c) => c.codigo_cupom.startsWith("TROCA-"));
    expect(cupom, "cupom de troca disponível ao cliente").toBeTruthy();
    expect(cupom.tipo).toBe("TROCA");
    expect(cupom.utilizado).toBe(false);
    expect(Number(cupom.valor)).toBeCloseTo(Number(item.valor_unitario), 2);

    const reentradas = await comBanco(
      async (cx) => (await cx.query("SELECT COUNT(*) n FROM movimentacao_estoque WHERE id_troca = ? AND tipo = 'REENTRADA'", [troca.id_troca]))[0][0].n
    );
    expect(reentradas).toBe(1);

    // Receber duas vezes não é permitido.
    const dup = await request.patch(`/api/v1/trocas/${troca.id_troca}/receber`, { headers: auth(admin), data: {} });
    expect(dup.status()).toBe(400);

    trocaCupom = { B, codigo: cupom.codigo_cupom, valor: Number(cupom.valor) };
  });


  test("11 cupom de troca gerado é usado em uma nova compra (RF0044, RF0037, RN0036)", async ({ request }) => {
    const { B, codigo, valor } = trocaCupom;
    expect((await addLivro(request, B.token, livros[0].id_livro, 1)).status()).toBe(201);
    const c = await lerCarrinho(request, B.token);
    const aPagar = r2(Math.max(c.total - valor, 0));

    const r = await pedir(request, B.token, {
      id_endereco_entrega: B.idEndereco,
      codigos_cupom: [codigo],
      cartoes: aPagar > 0 ? [{ id_cartao: B.idCartao, valor_pago: aPagar }] : [],
    });
    expect(r.status(), await r.text()).toBe(201);
    expect((await r.json()).status).toBe("APROVADA");

    const cupons = await (await request.get("/api/v1/cupons/meus", { headers: auth(B.token) })).json();
    expect(cupons.find((x) => x.codigo_cupom === codigo).utilizado).toBe(true);

    // O mesmo cupom não pode ser reutilizado.
    expect((await addLivro(request, B.token, livros[0].id_livro, 1)).status()).toBe(201);
    const denovo = await pedir(request, B.token, { id_endereco_entrega: B.idEndereco, codigos_cupom: [codigo] });
    expect(denovo.status()).toBe(400);
  });

  test("12 revalidação de estoque na finalização: ajusta, remove indisponíveis e alerta (RN0032, RN0031)", async ({ request }) => {
    const B = await novoComprador(request);
    const livro = livros[livros.length - 1];
    const original = await estoqueDe(request, livro.id_livro);
    try {
      await addLivro(request, B.token, livro.id_livro, 5);
      await definirEstoque(livro.id_livro, 3); // o estoque muda entre o carrinho e a compra
      const c = await lerCarrinho(request, B.token);
      const r = await pedir(request, B.token, {
        id_endereco_entrega: B.idEndereco, cartoes: [{ id_cartao: B.idCartao, valor_pago: c.total }],
      });
      expect(r.status()).toBe(409);
      expect((await r.json()).alertas.length).toBeGreaterThan(0);
      expect((await lerCarrinho(request, B.token)).itens[0].quantidade).toBe(3);

      await definirEstoque(livro.id_livro, 0);
      const semEstoque = await pedir(request, B.token, { id_endereco_entrega: B.idEndereco, pix: { valor_pago: 10 } });
      expect(semEstoque.status()).toBe(409);
      expect((await lerCarrinho(request, B.token)).itens.length).toBe(0);
    } finally {
      await definirEstoque(livro.id_livro, original);
    }
  });
});

