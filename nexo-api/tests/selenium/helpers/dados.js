import bcrypt from "bcryptjs";
import { api, comBanco } from "./banco.js";

export const ADMIN = { email: "admin.selenium.analise@nexo.com", senha: "AdminSelenium#123" };
export const GERENTE = { email: "gerente.selenium.analise@nexo.com", senha: "Gerente#123" };
export const SUFIXO = Date.now().toString(36);
let seq = 0;

/** Garante os funcionários de teste (ADMIN e GERENTE_VENDAS) com hash bcrypt real. */
export async function garantirFuncionarios() {
  await comBanco(async (c) => {
    for (const [u, perfil, nome] of [[ADMIN, "ADMIN", "Admin Selenium"], [GERENTE, "GERENTE_VENDAS", "Gerente Selenium"]]) {
      const [rows] = await c.query("SELECT 1 FROM funcionario WHERE email = ?", [u.email]);
      if (!rows.length) {
        await c.query("INSERT INTO funcionario (nome, email, senha_hash, perfil, ativo) VALUES (?, ?, ?, ?, TRUE)", [
          nome, u.email, await bcrypt.hash(u.senha, 10), perfil,
        ]);
      }
    }
  });
}

export async function tokenFuncionario(usuario) {
  return (await api("POST", "/auth/funcionario/login", { corpo: usuario })).corpo.access_token;
}

/** Cadastra um cliente pela API (com endereço de entrega) e devolve credenciais e ids. */
export async function criarCliente() {
  seq += 1;
  const base = Date.now();
  const d = String((base % 1e9) + seq).padStart(9, "0");
  const email = `selenium.${base}.${seq}@nexo.com`;
  const senha = "Cliente#123";
  const cad = await api("POST", "/clientes", {
    corpo: {
      nome: `Selenium ${seq}`, genero: "Masculino", data_nascimento: "1990-01-01",
      cpf: `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${String(10 + (seq % 89))}`,
      telefone_tipo: "Celular", telefone_ddd: "11", telefone_numero: "999999999", email, senha,
    },
  });
  if (cad.status !== 201) throw new Error(`Falha ao criar cliente: ${JSON.stringify(cad.corpo)}`);
  const token = (await api("POST", "/auth/cliente/login", { corpo: { email, senha } })).corpo.access_token;
  const me = (await api("GET", "/clientes/me", { token })).corpo;
  const end = await api("POST", "/enderecos", {
    token,
    corpo: {
      nome_identificador: "Casa", tipo: "ENTREGA", tipo_residencia: "Casa", tipo_logradouro: "Avenida",
      logradouro: "Paulista", numero: "1000", bairro: "Bela Vista", cep: "01310-100",
      cidade: "São Paulo", estado: "SP", pais: "Brasil", padrao: true,
    },
  });
  return { email, senha, token, idCliente: me.id_cliente, idEndereco: end.corpo.id_endereco };
}

/** Cria 3 categorias de teste (A, B, C), cada uma com um livro próprio. */
export async function criarCategorias() {
  const cat = {};
  await comBanco(async (c) => {
    for (const k of ["A", "B", "C"]) {
      const nome = `TesteSel${k}${SUFIXO}`;
      const [r] = await c.query("INSERT INTO categoria (nome) VALUES (?)", [nome]);
      cat[k] = { id: r.insertId, nome };
      const unico = `${Date.now()}${k.charCodeAt(0)}`;
      const [liv] = await c.query(
        `INSERT INTO livro (codigo_livro, titulo, isbn, id_autor, id_editora, ano_publicacao, edicao, num_paginas, sinopse,
                            altura, largura, peso, profundidade, codigo_barras, id_grupo_precificacao, valor_custo, valor_venda, quantidade_estoque, ativo)
         SELECT ?, ?, ?, id_autor, id_editora, 2020, '1a', 100, 'teste', 20, 14, 0.3, 2, ?, id_grupo_precificacao, 10, 10, 100, TRUE
           FROM livro LIMIT 1`,
        [`TS${SUFIXO}${k}`.slice(0, 20), `Livro ${nome}`, unico.slice(0, 20), unico.slice(0, 30)]
      );
      await c.query("INSERT INTO livro_categoria (id_livro, id_categoria) VALUES (?, ?)", [liv.insertId, cat[k].id]);
    }
  });
  return cat;
}

/** Insere um pedido com um item da categoria, com status e data controlados. Devolve o id do pedido. */
export async function criarPedido(cliente, { status, data, idCategoria, quantidade, valorUnitario }) {
  seq += 1;
  return comBanco(async (c) => {
    const [p] = await c.query(
      "INSERT INTO pedido (codigo_pedido, id_cliente, id_endereco_entrega, status, valor_total, data_pedido) VALUES (?, ?, ?, ?, ?, ?)",
      [`SE${SUFIXO}${seq}`.slice(0, 20), cliente.idCliente, cliente.idEndereco, status, quantidade * valorUnitario, data]
    );
    const [l] = await c.query("SELECT id_livro FROM livro_categoria WHERE id_categoria = ? LIMIT 1", [idCategoria]);
    await c.query(
      "INSERT INTO item_pedido (id_pedido, id_livro, quantidade, valor_unitario, valor_total_item) VALUES (?, ?, ?, ?, ?)",
      [p.insertId, l[0].id_livro, quantidade, valorUnitario, quantidade * valorUnitario]
    );
    return p.insertId;
  });
}

/** Leva um pedido APROVADA a ENTREGUE pelos endpoints do administrador (fluxo real: despachar e confirmar entrega). */
export async function despacharEEntregar(tokenAdmin, idPedido) {
  const d = await api("PATCH", `/pedidos/${idPedido}/despachar`, { token: tokenAdmin });
  const e = await api("PATCH", `/pedidos/${idPedido}/confirmar-entrega`, { token: tokenAdmin });
  if (d.status !== 200 || e.status !== 200) throw new Error(`Falha ao entregar o pedido: ${d.status}/${e.status}`);
}

export async function limpar(cliente, cat) {
  await comBanco(async (c) => {
    if (cliente) await c.query("DELETE FROM pedido WHERE id_cliente = ?", [cliente.idCliente]);
    await c.query("DELETE FROM livro WHERE codigo_livro LIKE ?", [`TS${SUFIXO}%`]);
    if (cat) await c.query("DELETE FROM categoria WHERE id_categoria IN (?, ?, ?)", [cat.A.id, cat.B.id, cat.C.id]);
    await c.query("DELETE FROM funcionario WHERE email IN (?, ?)", [ADMIN.email, GERENTE.email]);
  });
}
