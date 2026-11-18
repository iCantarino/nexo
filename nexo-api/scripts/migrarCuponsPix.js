/**
 * Migração: cupons de catálogo (percentual / valor fixo) + pagamento via PIX.
 *
 * Uso (uma vez, pode repetir sem problema — é idempotente):
 *   npm run migrate:cupons-pix
 *
 * O que faz:
 *   1. pedido.valor_pix                       -> parcela do pedido paga via PIX
 *   2. tabela cupom_catalogo                  -> cupons reutilizáveis (TESTE, PRIMEIRACOMPRA, TESTETROCA)
 *   3. pedido_cupom.id_cupom vira NULL e ganha id_cupom_catalogo
 *   4. seed dos 3 cupons de catálogo
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

async function constraintExiste(nome) {
  const [rows] = await conn.query(
    "SELECT 1 FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND constraint_name = ?",
    [nome]
  );
  return rows.length > 0;
}

try {
  if (!(await colunaExiste("pedido", "valor_pix"))) {
    await conn.query("ALTER TABLE pedido ADD COLUMN valor_pix DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER valor_frete");
    console.log("pedido.valor_pix criada.");
  }

  await conn.query(`
    CREATE TABLE IF NOT EXISTS cupom_catalogo (
      id_cupom_catalogo       INT AUTO_INCREMENT PRIMARY KEY,
      codigo_cupom            VARCHAR(30) NOT NULL UNIQUE,
      descricao               VARCHAR(150) NOT NULL,
      tipo                    ENUM('PROMOCIONAL', 'TROCA') NOT NULL,
      percentual              DECIMAL(5,2) NULL,
      valor_fixo              DECIMAL(10,2) NULL,
      apenas_primeira_compra  BOOLEAN NOT NULL DEFAULT FALSE,
      uso_unico_por_cliente   BOOLEAN NOT NULL DEFAULT FALSE,
      ativo                   BOOLEAN NOT NULL DEFAULT TRUE,
      CONSTRAINT chk_catalogo_valor CHECK ((percentual IS NOT NULL) <> (valor_fixo IS NOT NULL))
    ) ENGINE=InnoDB
  `);

  if (!(await colunaExiste("pedido_cupom", "id_cupom_catalogo"))) {
    await conn.query("ALTER TABLE pedido_cupom MODIFY COLUMN id_cupom INT NULL");
    await conn.query("ALTER TABLE pedido_cupom ADD COLUMN id_cupom_catalogo INT NULL AFTER id_cupom");
    console.log("pedido_cupom.id_cupom_catalogo criada.");
  }
  if (!(await constraintExiste("fk_pedidocupom_catalogo"))) {
    await conn.query(
      "ALTER TABLE pedido_cupom ADD CONSTRAINT fk_pedidocupom_catalogo FOREIGN KEY (id_cupom_catalogo) " +
        "REFERENCES cupom_catalogo (id_cupom_catalogo) ON DELETE RESTRICT ON UPDATE CASCADE"
    );
  }

  await conn.query(`
    INSERT IGNORE INTO cupom_catalogo
      (codigo_cupom, descricao, tipo, percentual, valor_fixo, apenas_primeira_compra, uso_unico_por_cliente)
    VALUES
      ('TESTE',          'Cupom de teste: 15% de desconto nos itens',             'PROMOCIONAL', 15.00, NULL,  FALSE, FALSE),
      ('PRIMEIRACOMPRA', '20% de desconto nos itens da primeira compra',          'PROMOCIONAL', 20.00, NULL,  TRUE,  FALSE),
      ('TESTETROCA',     'Cupom de troca de teste: R$ 50,00 (uso único/cliente)', 'TROCA',       NULL,  50.00, FALSE, TRUE)
  `);

  console.log("Migração de cupons/PIX concluída.");
} finally {
  await conn.end();
}
