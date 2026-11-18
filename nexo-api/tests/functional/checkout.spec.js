import { test, expect } from "@playwright/test";

test.describe.configure({ mode: "serial" });

const r2 = (n) => Math.round(n * 100) / 100;
const auth = (token) => ({ Authorization: `Bearer ${token}` });
const freteDe = (qtd) => 5 + 2 * qtd; // critério do frete: R$ 5,00 fixo + R$ 2,00 por item
let seq = 0;

async function novoComprador(request) {
  seq += 1;
  const base = Date.now();
  const d = String((base % 1e9) + seq).padStart(9, "0");
  const email = `comprador.${base}.${seq}@nexo.com`;
  const senha = "Cliente#123";
  const cadastro = await request.post("/api/v1/clientes", {
    data: {
      nome: `Comprador ${seq}`, genero: "Masculino", data_nascimento: "1990-01-01",
      cpf: `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${String(10 + (seq % 89))}`,
      telefone_tipo: "Celular", telefone_ddd: "11", telefone_numero: "999999999", email, senha,
    },
  });
  expect(cadastro.status()).toBe(201);
  const login = await request.post("/api/v1/auth/cliente/login", { data: { email, senha } });
  const token = (await login.json()).access_token;
  const end = await request.post("/api/v1/enderecos", {
    headers: auth(token),
    data: {
      nome_identificador: "Casa", tipo: "ENTREGA", tipo_residencia: "Casa", tipo_logradouro: "Avenida",
      logradouro: "Paulista", numero: "1000", bairro: "Bela Vista", cep: "01310-100",
      cidade: "São Paulo", estado: "SP", pais: "Brasil", padrao: true,
    },
  });
  const cartao = (idBandeira, numero) =>
    request.post("/api/v1/cartoes", {
      headers: auth(token),
      data: { id_bandeira: idBandeira, numero_cartao: numero, nome_impresso: `Comprador ${seq}`, codigo_seguranca: "123" },
    });
  const c1 = await cartao(1, "4111111111111111");
  const c2 = await cartao(2, "5111111111111111");
  return {
    token,
    idEndereco: (await end.json()).id_endereco,
    idCartao: (await c1.json()).id_cartao,
    idCartao2: (await c2.json()).id_cartao,
  };
}

const addLivro = (request, token, idLivro, quantidade) =>
  request.post("/api/v1/carrinho/itens", { headers: auth(token), data: { id_livro: idLivro, quantidade } });

const pedir = (request, token, data) => request.post("/api/v1/pedidos", { headers: auth(token), data });

async function lerCarrinho(request, token) {
  const c = await (await request.get("/api/v1/carrinho", { headers: auth(token) })).json();
  const itens = c.itens.filter((i) => !i.removido_por_expiracao);
  const qtd = itens.reduce((a, i) => a + i.quantidade, 0);
  const sub = r2(itens.reduce((a, i) => a + Number(i.livro.valor_venda) * i.quantidade, 0));
  return { itens, qtd, sub, frete: freteDe(qtd), total: r2(sub + freteDe(qtd)) };
}

// Esvazia o carrinho para o teste começar de um estado conhecido.
async function limparCarrinho(request, token) {
  const { itens } = await lerCarrinho(request, token);
  for (const i of itens) {
    await request.delete(`/api/v1/carrinho/itens/${i.id_item_carrinho}`, { headers: auth(token) });
  }
}

test.describe("Carrinho e checkout - RF0031 a RF0038 / RN0031 a RN0036", () => {
  let livros = [];
  let A; // comprador principal
  let idPedido = 0;

  test("00 prepara livros ativos (rode seed-livros.sql se falhar) e o comprador", async ({ request }) => {
    const r = await request.get("/api/v1/livros?ativo=true");
    expect(r.status()).toBe(200);
    livros = (await r.json())
      .filter((l) => l.ativo && l.quantidade_estoque >= 10)
      .sort((a, b) => Number(b.valor_venda) - Number(a.valor_venda));
    expect(livros.length).toBeGreaterThan(0);
    A = await novoComprador(request);
  });

  test("01 carrinho: incluir mais de um livro, alterar, excluir e respeitar o estoque", async ({ request }) => {
    const l1 = livros[0];
    const l2 = livros[1] ?? livros[0];
    expect((await addLivro(request, A.token, l1.id_livro, 2)).status()).toBe(201);
    const resp = await addLivro(request, A.token, l2.id_livro, 1);
    expect(resp.status()).toBe(201);
    const carrinho = await resp.json();
    expect(carrinho.itens.length).toBeGreaterThanOrEqual(2);

    const primeiro = carrinho.itens[0];
    const alterado = await request.patch(`/api/v1/carrinho/itens/${primeiro.id_item_carrinho}`, {
      headers: auth(A.token), data: { quantidade: 3 },
    });
    expect(alterado.status()).toBe(200);
    const atualizado = (await alterado.json()).itens.find((i) => i.id_item_carrinho === primeiro.id_item_carrinho);
    expect(atualizado.quantidade).toBe(3);

    // RN0031: não aceita quantidade acima do estoque
    const alemDoEstoque = await addLivro(request, A.token, l1.id_livro, l1.quantidade_estoque + 1000);
    expect(alemDoEstoque.status()).toBe(400);

    const ultimo = carrinho.itens[carrinho.itens.length - 1];
    const excluir = await request.delete(`/api/v1/carrinho/itens/${ultimo.id_item_carrinho}`, { headers: auth(A.token) });
    expect(excluir.status()).toBe(204);
    expect((await lerCarrinho(request, A.token)).itens.length).toBe(carrinho.itens.length - 1);
  });

  test("02 compra com endereço e cartão cadastrados + cupom PRIMEIRACOMPRA (20%) -> APROVADA (validação automática)", async ({ request }) => {
    const c = await lerCarrinho(request, A.token);
    const aPagar = r2(c.total - r2((c.sub * 20) / 100));
    const r = await pedir(request, A.token, {
      id_endereco_entrega: A.idEndereco,
      codigos_cupom: ["primeiracompra"],
      cartoes: [{ id_cartao: A.idCartao, valor_pago: aPagar }],
    });
    expect(r.status(), await r.text()).toBe(201);
    const pedido = await r.json();
    expect(pedido.status).toBe("APROVADA");
    expect(pedido.id_endereco_entrega).toBe(A.idEndereco);
    expect(Math.abs(Number(pedido.valor_total) - c.total)).toBeLessThan(0.01);
    expect(Number(pedido.valor_frete)).toBe(c.frete);
    idPedido = pedido.id_pedido;
  });

  test("03 PRIMEIRACOMPRA não vale na segunda compra", async ({ request }) => {
    await limparCarrinho(request, A.token);
    await addLivro(request, A.token, livros[0].id_livro, 1);
    const c = await lerCarrinho(request, A.token);
    const r = await pedir(request, A.token, {
      id_endereco_entrega: A.idEndereco,
      codigos_cupom: ["PRIMEIRACOMPRA"],
      cartoes: [{ id_cartao: A.idCartao, valor_pago: r2(c.total - r2((c.sub * 20) / 100)) }],
    });
    expect(r.status()).toBe(400);
    expect((await r.json()).detail).toMatch(/primeira compra/i);
  });

  test("04 cupom TESTE (15%) e cartão da conta de outro cliente é rejeitado", async ({ request }) => {
    const outro = await novoComprador(request);
    const c = await lerCarrinho(request, A.token);
    const aPagar = r2(c.total - r2((c.sub * 15) / 100));

    const roubado = await pedir(request, A.token, {
      id_endereco_entrega: A.idEndereco, codigos_cupom: ["TESTE"],
      cartoes: [{ id_cartao: outro.idCartao, valor_pago: aPagar }],
    });
    expect(roubado.status()).toBe(400);

    const ok = await pedir(request, A.token, {
      id_endereco_entrega: A.idEndereco, codigos_cupom: ["TESTE"],
      cartoes: [{ id_cartao: A.idCartao, valor_pago: aPagar }],
    });
    expect(ok.status(), await ok.text()).toBe(201);
  });

  test("05 apenas um cupom promocional por compra (RN0033)", async ({ request }) => {
    await limparCarrinho(request, A.token);
    await addLivro(request, A.token, livros[0].id_livro, 1);
    const c = await lerCarrinho(request, A.token);
    const r = await pedir(request, A.token, {
      id_endereco_entrega: A.idEndereco, codigos_cupom: ["TESTE", "PRIMEIRACOMPRA"],
      cartoes: [{ id_cartao: A.idCartao, valor_pago: c.total }],
    });
    expect(r.status()).toBe(400);
  });

  test("06 pagamento com PIX: total, parcial com cartão e valores inconsistentes", async ({ request }) => {
    await limparCarrinho(request, A.token);
    await addLivro(request, A.token, livros[0].id_livro, 1);
    const c = await lerCarrinho(request, A.token);

    const insuficiente = await pedir(request, A.token, { id_endereco_entrega: A.idEndereco, pix: { valor_pago: 1 } });
    expect(insuficiente.status()).toBe(400);
    const excedente = await pedir(request, A.token, { id_endereco_entrega: A.idEndereco, pix: { valor_pago: c.total + 50 } });
    expect(excedente.status()).toBe(400);

    const metade = r2(c.total / 2);
    const misto = await pedir(request, A.token, {
      id_endereco_entrega: A.idEndereco,
      cartoes: [{ id_cartao: A.idCartao, valor_pago: metade }],
      pix: { valor_pago: r2(c.total - metade) },
    });
    expect(misto.status(), await misto.text()).toBe(201);
    const pedido = await misto.json();
    expect(pedido.status).toBe("APROVADA");
    expect(Math.abs(Number(pedido.valor_pix) - r2(c.total - metade))).toBeLessThan(0.01);

    await addLivro(request, A.token, livros[0].id_livro, 1);
    const soPix = await pedir(request, A.token, { id_endereco_entrega: A.idEndereco, pix: { valor_pago: c.total } });
    expect(soPix.status(), await soPix.text()).toBe(201);
  });

  test("07 novo endereço e novo cartão durante a compra", async ({ request }) => {
    const B = await novoComprador(request);
    await addLivro(request, B.token, livros[0].id_livro, 1);
    const r = await pedir(request, B.token, {
      novo_endereco: {
        nome_identificador: "Trabalho", tipo: "ENTREGA", tipo_residencia: "Comercial", tipo_logradouro: "Avenida",
        logradouro: "Faria Lima", numero: "1500", bairro: "Itaim Bibi", cep: "04538-132",
        cidade: "São Paulo", estado: "SP", pais: "Brasil",
      },
      novo_cartao: { id_bandeira: 3, numero_cartao: "6362970000457013", nome_impresso: "Comprador", codigo_seguranca: "789" },
    });
    expect(r.status(), await r.text()).toBe(201);
    expect((await r.json()).status).toBe("APROVADA");
    const enderecos = await (await request.get("/api/v1/enderecos", { headers: auth(B.token) })).json();
    const cartoes = await (await request.get("/api/v1/cartoes", { headers: auth(B.token) })).json();
    expect(enderecos.some((e) => e.nome_identificador === "Trabalho")).toBe(true);
    expect(cartoes.length).toBe(3);
  });

  test("08 dois cartões, mínimo de R$ 10,00 por cartão (RN0034)", async ({ request }) => {
    const B = await novoComprador(request);
    await addLivro(request, B.token, livros[0].id_livro, 1);
    const c = await lerCarrinho(request, B.token);

    const abaixo = await pedir(request, B.token, {
      id_endereco_entrega: B.idEndereco,
      cartoes: [{ id_cartao: B.idCartao, valor_pago: 5 }, { id_cartao: B.idCartao2, valor_pago: r2(c.total - 5) }],
    });
    expect(abaixo.status()).toBe(400);

    const ok = await pedir(request, B.token, {
      id_endereco_entrega: B.idEndereco,
      cartoes: [{ id_cartao: B.idCartao, valor_pago: 10 }, { id_cartao: B.idCartao2, valor_pago: r2(c.total - 10) }],
    });
    expect(ok.status(), await ok.text()).toBe(201);
  });

  test("09 cartão com menos de R$ 10,00 quando cupons cobrem quase tudo (RN0035)", async ({ request }) => {
    // O TESTETROCA vale R$ 50,00: numa compra de R$ 50,01 a R$ 59,99 sobra menos de R$ 10,00 para o cartão.
    const acha = (() => {
      for (const l of livros) {
        for (let q = 1; q <= 10; q++) {
          const total = r2(Number(l.valor_venda) * q + freteDe(q));
          if (total > 50 && total < 60) return { livro: l, q, total };
        }
      }
      return null;
    })();
    test.skip(!acha, "Nenhum livro/quantidade do catálogo gera um total entre R$ 50,01 e R$ 59,99.");

    const B = await novoComprador(request);
    await addLivro(request, B.token, acha.livro.id_livro, acha.q);
    const resto = r2(acha.total - 50);
    const r = await pedir(request, B.token, {
      id_endereco_entrega: B.idEndereco, codigos_cupom: ["TESTETROCA"],
      cartoes: [{ id_cartao: B.idCartao, valor_pago: resto }],
    });
    expect(resto).toBeLessThan(10);
    expect(r.status(), await r.text()).toBe(201);
  });

  test("10 cupom de troca acima do valor da compra gera cupom com a diferença (RN0036) e é de uso único", async ({ request }) => {
    const B = await novoComprador(request);
    const livro = livros[livros.length - 1]; // o mais barato do catálogo
    const preco = Number(livro.valor_venda);

    // Compra 1: TESTETROCA (R$ 50,00) cobre a compra inteira só se ela custar menos que isso.
    // Com livros mais caros, usamos o cupom como parte do pagamento; o troco só aparece quando ele supera a compra.
    await addLivro(request, B.token, livro.id_livro, 1);
    const c = await lerCarrinho(request, B.token);
    const cobreTudo = c.total < 50;
    const r = await pedir(request, B.token, {
      id_endereco_entrega: B.idEndereco,
      codigos_cupom: ["TESTETROCA"],
      cartoes: cobreTudo ? [] : [{ id_cartao: B.idCartao, valor_pago: r2(c.total - 50) }],
    });
    expect(r.status(), await r.text()).toBe(201);

    const cupons = await (await request.get("/api/v1/cupons/meus", { headers: auth(B.token) })).json();
    // TESTETROCA é de uso único por cliente: não é mais oferecido a quem já usou.
    expect(cupons.some((x) => x.codigo_cupom === "TESTETROCA")).toBe(false);
    const troco = cupons.find((x) => x.codigo_cupom.startsWith("TROCO-"));
    if (cobreTudo) {
      // RN0036: o que passou do valor da compra volta como cupom de troca.
      expect(troco, "cupom de troco gerado").toBeTruthy();
      expect(troco.tipo).toBe("TROCA");
      expect(Math.abs(Number(troco.valor) - r2(50 - c.total))).toBeLessThan(0.01);
    } else {
      expect(troco, "sem troco: o cupom não superou a compra").toBeFalsy();
      expect(preco + freteDe(1)).toBeGreaterThanOrEqual(50);
    }

    await addLivro(request, B.token, livro.id_livro, 1);
    const denovo = await pedir(request, B.token, { id_endereco_entrega: B.idEndereco, codigos_cupom: ["TESTETROCA"] });
    expect(denovo.status()).toBe(400);
  });

  test("11 pedido finalizado e validado pelo sistema consta como APROVADA (RF0037, RN0038)", async ({ request }) => {
    const r = await request.get(`/api/v1/pedidos/${idPedido}`, { headers: auth(A.token) });
    expect(r.status()).toBe(200);
    expect((await r.json()).status).toBe("APROVADA");
  });
});

