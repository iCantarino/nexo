import { config } from "dotenv";
import mysql from "mysql2/promise";
import { API_URL } from "./servicos.js";

config();

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

/** Chamada HTTP à API (usada para preparar cenários e conferir permissões). */
export async function api(metodo, rota, { token, corpo } = {}) {
  const r = await fetch(`${API_URL}${rota}`, {
    method: metodo,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  return { status: r.status, corpo: await r.json().catch(() => null) };
}

/** Soma ENTREGUE de uma categoria por mês (AAAA-MM), direto no banco: referência independente da API. */
export async function somaEntregueNoBanco(idCategoria, de, ate) {
  return comBanco(async (c) => {
    const [rows] = await c.query(
      `SELECT DATE_FORMAT(p.data_pedido,'%Y-%m') m, SUM(ip.valor_total_item) v
         FROM pedido p JOIN item_pedido ip ON ip.id_pedido = p.id_pedido
         JOIN livro_categoria lc ON lc.id_livro = ip.id_livro
        WHERE p.status = 'ENTREGUE' AND lc.id_categoria = ? AND p.data_pedido >= ? AND p.data_pedido < ?
        GROUP BY m`,
      [idCategoria, de, ate]
    );
    return Object.fromEntries(rows.map((x) => [x.m, Number(x.v)]));
  });
}
