import mysql from "mysql2/promise";
import { config } from "dotenv";

config();

export const r2 = (n) => Math.round(n * 100) / 100;
export const freteDe = (qtd) => 5 + 2 * qtd;

let seq = 0;

/** Acesso direto ao banco para preparar cenários sem endpoint (expirar bloqueio, definir estoque). */
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
    c.query(
      "UPDATE item_carrinho SET data_expiracao_bloqueio = DATE_SUB(NOW(), INTERVAL 1 MINUTE) WHERE id_item_carrinho = ?",
      [idItemCarrinho]
    )
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

const API = process.env.TEST_API_PORT ?? "8011";
const BASE = `http://127.0.0.1:${API}/api/v1`;

const auth = (token) => ({ Authorization: `Bearer ${token}` });

/** Cria um comprador de teste (via API) com endereço e dois cartões. */
export async function novoComprador() {
  seq += 1;
  const base = Date.now();
  const d = String((base % 1e9) + seq).padStart(9, "0");
  const email = `vendasui.${base}.${seq}@nexo.com`;
  const senha = "Cliente#123";

  const cad = await fetch(`${BASE}/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: `VendasUI ${seq}`,
      genero: "Masculino",
      data_nascimento: "1990-01-01",
      cpf: `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${String(10 + (seq % 89))}`,
      telefone_tipo: "Celular",
      telefone_ddd: "11",
      telefone_numero: "999999999",
      email,
      senha,
    }),
  });
  if (!cad.ok) throw new Error(`Falha ao criar cliente: ${await cad.text()}`);

  const login = await fetch(`${BASE}/auth/cliente/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  const token = (await login.json()).access_token;

  const me = await (await fetch(`${BASE}/clientes/me`, { headers: auth(token) })).json();

  const end = await fetch(`${BASE}/enderecos`, {
    method: "POST",
    headers: { ...auth(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      nome_identificador: "Casa",
      tipo: "ENTREGA",
      tipo_residencia: "Casa",
      tipo_logradouro: "Avenida",
      logradouro: "Paulista",
      numero: "1000",
      bairro: "Bela Vista",
      cep: "01310-100",
      cidade: "São Paulo",
      estado: "SP",
      pais: "Brasil",
      padrao: true,
    }),
  });

  const criarCartao = (idBandeira, numero) =>
    fetch(`${BASE}/cartoes`, {
      method: "POST",
      headers: { ...auth(token), "Content-Type": "application/json" },
      body: JSON.stringify({ id_bandeira: idBandeira, numero_cartao: numero, nome_impresso: `VendasUI ${seq}`, codigo_seguranca: "123" }),
    });

  const c1 = await criarCartao(1, "4111111111111111");
  const c2 = await criarCartao(2, "5111111111111111");

  return {
    email,
    senha,
    token,
    idCliente: me.id_cliente,
    idEndereco: (await end.json()).id_endereco,
    idCartao: (await c1.json()).id_cartao,
    idCartao2: (await c2.json()).id_cartao,
  };
}

/** Total do carrinho (subtotal, frete, total) via API. */
export async function totalCarrinho(token) {
  const r = await fetch(`${BASE}/carrinho`, { headers: auth(token) });
  const c = await r.json();
  const itens = c.itens.filter((i) => !i.removido_por_expiracao);
  const qtd = itens.reduce((a, i) => a + i.quantidade, 0);
  const sub = r2(itens.reduce((a, i) => a + Number(i.livro.valor_venda) * i.quantidade, 0));
  return { sub, frete: freteDe(qtd), total: r2(sub + freteDe(qtd)) };
}

/** Estoque de um livro via API. */
export async function estoqueDe(idLivro) {
  const r = await fetch(`${BASE}/livros?ativo=true`);
  const lista = await r.json();
  return lista.find((l) => l.id_livro === idLivro).quantidade_estoque;
}