/**
 * Migração: UC Gerenciar Vendas Eletrônicas (idempotente, preserva os dados).
 *
 * Uso:  npm run migrate:vendas
 *
 *   1. item_pedido.quantidade_trocada   -> saldo já trocado de cada item (RN0042)
 *   2. troca.compra_inteira             -> troca de toda a compra (RF0040)
 *   3. tabela notificacao               -> notificação de troca autorizada (RNF0046)
 *   4. tabela movimentacao_estoque      -> baixa/reentrada de estoque (RF0053/RF0054)
 */
import { config } from "dotenv";
import mysql from "mysql2/promise";

config();

const conn = await mysql.createConnection({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? "3306"),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "nexo_db",
});

async function colunaExiste(tabela, coluna) {
  const [rows] = await conn.query(
    "SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?",
    [tabela, coluna]
  );
  return rows.length > 0;
}

try {
  if (!(await colunaExiste("item_pedido", "quantidade_trocada"))) {
    await conn.query("ALTER TABLE item_pedido ADD COLUMN quantidade_trocada INT NOT NULL DEFAULT 0");
    console.log("item_pedido.quantidade_trocada criada.");
  }
  if (!(await colunaExiste("troca", "compra_inteira"))) {
    await conn.query("ALTER TABLE troca ADD COLUMN compra_inteira BOOLEAN NOT NULL DEFAULT FALSE AFTER retorna_estoque");
    console.log("troca.compra_inteira criada.");
  }

  await conn.query(`
    CREATE TABLE IF NOT EXISTS notificacao (
      id_notificacao  INT AUTO_INCREMENT PRIMARY KEY,
      id_cliente      INT NOT NULL,
      tipo            VARCHAR(30) NOT NULL,
      mensagem        VARCHAR(255) NOT NULL,
      id_pedido       INT NULL,
      id_troca        INT NULL,
      lida            BOOLEAN NOT NULL DEFAULT FALSE,
      data_criacao    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_notificacao_cliente FOREIGN KEY (id_cliente)
          REFERENCES cliente (id_cliente) ON DELETE CASCADE ON UPDATE CASCADE,
      INDEX idx_notificacao_cliente (id_cliente)
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS movimentacao_estoque (
      id_movimentacao     INT AUTO_INCREMENT PRIMARY KEY,
      id_livro            INT NOT NULL,
      tipo                VARCHAR(20) NOT NULL,
      quantidade          INT NOT NULL,
      id_pedido           INT NULL,
      id_troca            INT NULL,
      data_movimentacao   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_movest_livro FOREIGN KEY (id_livro)
          REFERENCES livro (id_livro) ON DELETE RESTRICT ON UPDATE CASCADE,
      INDEX idx_movest_pedido (id_pedido)
    ) ENGINE=InnoDB
  `);

  console.log("Migração de vendas eletrônicas concluída.");
} finally {
  await conn.end();
}
