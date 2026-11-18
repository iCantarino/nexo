import { expect } from "@playwright/test";
import { config } from "dotenv";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

config();

export const r2 = (n) => Math.round(n * 100) / 100;
export const auth = (token) => ({ Authorization: `Bearer ${token}` });
export const freteDe = (qtd) => 5 + 2 * qtd; // critério do grupo: R$ 5,00 fixo + R$ 2,00 por item
export const CARTAO_RECUSADO = "4000000000000000"; // operadora simulada recusa números terminados em 0000
let seq = 0;

/** Acesso direto ao banco apenas para preparar cenários sem endpoint (expirar bloqueio, emitir cupom promocional). */
export async function comBanco(fn) {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? "3306"),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "nexo_db",
  });
  try {
    return await fn(conn);
  } finally {
    await conn.end();
  }
}

export const expirarBloqueio = (idItemCarrinho) =>
  comBanco((c) =>
    c.query("UPDATE item_carrinho SET data_expiracao_bloqueio = DATE_SUB(NOW(), INTERVAL 1 MINUTE) WHERE id_item_carrinho = ?", [
      idItemCarrinho,
    ])
  );

export const definirEstoque = (idLivro, quantidade) =>
  comBanco((c) => c.query("UPDATE livro SET quantidade_estoque = ? WHERE id_livro = ?", [quantidade, idLivro]));

/** Emite um cupom (PROMOCIONAL ou TROCA) para o cliente e devolve o código. */
export async function emitirCupom(idCliente, tipo, valor) {
  seq += 1;
  const codigo = `T${tipo[0]}${Date.now().toString(36)}${seq}`.toUpperCase();
  await comBanco((c) =>
    c.query(
      "INSERT INTO cupom (codigo_cupom, tipo, valor, id_cliente, valido_de, valido_ate) VALUES (?, ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR))",
      [codigo, tipo, valor, idCliente]
    )
  );
  return codigo;
}

const ADMIN_TESTE = { email: "admin.vendas.teste@nexo.com", senha: "AdminVendas#123" };

/**
 * Login do perfil administrador. O admin do seed (schema.sql) traz um hash de exemplo que não autentica,
 * então os testes garantem um administrador próprio, com hash bcrypt real (idempotente, sem tocar no seed).
 */
export async function loginAdmin(request) {
  await comBanco(async (c) => {
    const [rows] = await c.query("SELECT id_funcionario FROM funcionario WHERE email = ?", [ADMIN_TESTE.email]);
    if (rows.length === 0) {
      await c.query("INSERT INTO funcionario (nome, email, senha_hash, perfil, ativo) VALUES (?, ?, ?, 'ADMIN', TRUE)", [
        "Administrador de Testes (Vendas)", ADMIN_TESTE.email, await bcrypt.hash(ADMIN_TESTE.senha, 10),
      ]);
    }
  });
  const r = await request.post("/api/v1/auth/funcionario/login", { data: ADMIN_TESTE });
  expect(r.status(), await r.text()).toBe(200);
  return (await r.json()).access_token;
}

export async function novoComprador(request) {
  seq += 1;
  const base = Date.now();
  const d = String((base % 1e9) + seq).padStart(9, "0");
  const email = `vendas.${base}.${seq}@nexo.com`;
  const senha = "Cliente#123";
  const cadastro = await request.post("/api/v1/clientes", {
    data: {
      nome: `Vendas ${seq}`, genero: "Masculino", data_nascimento: "1990-01-01",
      cpf: `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${String(10 + (seq % 89))}`,
      telefone_tipo: "Celular", telefone_ddd: "11", telefone_numero: "999999999", email, senha,
    },
  });
  expect(cadastro.status()).toBe(201);
  const login = await request.post("/api/v1/auth/cliente/login", { data: { email, senha } });
  const token = (await login.json()).access_token;
  const me = await (await request.get("/api/v1/clientes/me", { headers: auth(token) })).json();
  const end = await request.post("/api/v1/enderecos", {
    headers: auth(token),
    data: {
      nome_identificador: "Casa", tipo: "ENTREGA", tipo_residencia: "Casa", tipo_logradouro: "Avenida",
      logradouro: "Paulista", numero: "1000", bairro: "Bela Vista", cep: "01310-100",
      cidade: "São Paulo", estado: "SP", pais: "Brasil", padrao: true,
    },
  });
  const cartao = async (idBandeira, numero) =>
    (
      await (
        await request.post("/api/v1/cartoes", {
          headers: auth(token),
          data: { id_bandeira: idBandeira, numero_cartao: numero, nome_impresso: `Vendas ${seq}`, codigo_seguranca: "123" },
        })
      ).json()
    ).id_cartao;
  return {
    token,
    idCliente: me.id_cliente,
    idEndereco: (await end.json()).id_endereco,
    idCartao: await cartao(1, "4111111111111111"),
    idCartao2: await cartao(2, "5111111111111111"),
    idCartaoRecusado: await cartao(1, CARTAO_RECUSADO),
  };
}

export const addLivro = (request, token, idLivro, quantidade) =>
  request.post("/api/v1/carrinho/itens", { headers: auth(token), data: { id_livro: idLivro, quantidade } });

export const pedir = (request, token, data) => request.post("/api/v1/pedidos", { headers: auth(token), data });

export async function lerCarrinho(request, token) {
  const c = await (await request.get("/api/v1/carrinho", { headers: auth(token) })).json();
  const itens = c.itens.filter((i) => !i.removido_por_expiracao);
  const qtd = itens.reduce((a, i) => a + i.quantidade, 0);
  const sub = r2(itens.reduce((a, i) => a + Number(i.livro.valor_venda) * i.quantidade, 0));
  return { bruto: c, itens, qtd, sub, frete: freteDe(qtd), total: r2(sub + freteDe(qtd)) };
}

export async function estoqueDe(request, idLivro) {
  const lista = await (await request.get("/api/v1/livros?ativo=true")).json();
  return lista.find((l) => l.id_livro === idLivro).quantidade_estoque;
}

export async function statusDe(request, token, idPedido) {
  return (await (await request.get(`/api/v1/pedidos/${idPedido}`, { headers: auth(token) })).json()).status;
}

/** Compra aprovada com um cartão (carrinho já preenchido pelo chamador). */
export async function comprarComCartao(request, B) {
  const c = await lerCarrinho(request, B.token);
  const r = await pedir(request, B.token, {
    id_endereco_entrega: B.idEndereco,
    cartoes: [{ id_cartao: B.idCartao, valor_pago: c.total }],
  });
  expect(r.status(), await r.text()).toBe(201);
  return r.json();
}

/** Leva um pedido APROVADA até ENTREGUE pelo perfil administrador. */
export async function despacharEEntregar(request, adminToken, idPedido) {
  const d = await request.patch(`/api/v1/pedidos/${idPedido}/despachar`, { headers: auth(adminToken) });
  expect(d.status(), await d.text()).toBe(200);
  const e = await request.patch(`/api/v1/pedidos/${idPedido}/confirmar-entrega`, { headers: auth(adminToken) });
  expect(e.status(), await e.text()).toBe(200);
}
