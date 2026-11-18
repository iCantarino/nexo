import { API_URL } from "../../tests/selenium/helpers/servicos.js";

// Reusa o mesmo API_URL do Selenium (porta 8010) para não colidir com a API principal.
const API = process.env.TEST_API_PORT ?? "8010";
const BASE = `http://127.0.0.1:${API}/api/v1`;

export const r2 = (n) => Math.round(n * 100) / 100;
export const freteDe = (qtd) => 5 + 2 * qtd;

const auth = (token) => ({ Authorization: `Bearer ${token}` });

let seq = 0;

export async function novoComprador() {
  seq += 1;
  const base = Date.now();
  const d = String((base % 1e9) + seq).padStart(9, "0");
  const email = `compraui.${base}.${seq}@nexo.com`;
  const senha = "Cliente#123";

  const cad = await fetch(`${BASE}/clientes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: `CompraUI ${seq}`, genero: "Masculino", data_nascimento: "1990-01-01",
      cpf: `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${String(10 + (seq % 89))}`,
      telefone_tipo: "Celular", telefone_ddd: "11", telefone_numero: "999999999", email, senha,
    }),
  });
  if (!cad.ok) throw new Error(`Falha ao criar cliente: ${await cad.text()}`);

  const login = await fetch(`${BASE}/auth/cliente/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha }),
  });
  const token = (await login.json()).access_token;

  const end = await fetch(`${BASE}/enderecos`, {
    method: "POST",
    headers: { ...auth(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      nome_identificador: "Casa", tipo: "ENTREGA", tipo_residencia: "Casa", tipo_logradouro: "Avenida",
      logradouro: "Paulista", numero: "1000", bairro: "Bela Vista", cep: "01310-100",
      cidade: "São Paulo", estado: "SP", pais: "Brasil", padrao: true,
    }),
  });

  const criarCartao = (idBandeira, numero) =>
    fetch(`${BASE}/cartoes`, {
      method: "POST",
      headers: { ...auth(token), "Content-Type": "application/json" },
      body: JSON.stringify({ id_bandeira: idBandeira, numero_cartao: numero, nome_impresso: `CompraUI ${seq}`, codigo_seguranca: "123" }),
    });

  const c1 = await criarCartao(1, "4111111111111111");
  const c2 = await criarCartao(2, "5111111111111111");

  return {
    email,
    senha,
    token,
    idEndereco: (await end.json()).id_endereco,
    idCartao: (await c1.json()).id_cartao,
    idCartao2: (await c2.json()).id_cartao,
  };
}

/** Soma o valor total dos itens do carrinho via API. */
export async function totalCarrinho(token) {
  const r = await fetch(`${BASE}/carrinho`, { headers: auth(token) });
  const c = await r.json();
  const itens = c.itens.filter((i) => !i.removido_por_expiracao);
  const qtd = itens.reduce((a, i) => a + i.quantidade, 0);
  const sub = r2(itens.reduce((a, i) => a + Number(i.livro.valor_venda) * i.quantidade, 0));
  return { sub, frete: freteDe(qtd), total: r2(sub + freteDe(qtd)) };
}