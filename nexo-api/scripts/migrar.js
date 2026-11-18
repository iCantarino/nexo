/**
 * Aplica as migrations SQL versionadas de nexo-design/bdd/migrations (idempotente).
 *
 * Uso:  npm run migrate
 *
 * Mantém a tabela `schema_migracoes` com os arquivos já aplicados e executa apenas
 * os pendentes, em ordem alfabética. Funciona em qualquer máquina com o banco criado
 * por `npm run setup-db` (ou em bancos antigos que precisam ser atualizados).
 */
import { readdirSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { config } from "dotenv";
import mysql from "mysql2/promise";

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(__dirname, "..", "..", "nexo-design", "bdd", "migrations");

const conn = await mysql.createConnection({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? "3306"),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "nexo_db",
  multipleStatements: true,
});

try {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS schema_migracoes (
      arquivo       VARCHAR(150) PRIMARY KEY,
      data_aplicacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);
  const [aplicadas] = await conn.query("SELECT arquivo FROM schema_migracoes");
  const jaAplicadas = new Set(aplicadas.map((r) => r.arquivo));

  const arquivos = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
  let novas = 0;
  for (const arquivo of arquivos) {
    if (jaAplicadas.has(arquivo)) continue;
    console.log(`Aplicando ${arquivo} ...`);
    await conn.query(readFileSync(path.join(MIGRATIONS_DIR, arquivo), "utf-8"));
    await conn.query("INSERT INTO schema_migracoes (arquivo) VALUES (?)", [arquivo]);
    novas += 1;
  }
  console.log(novas ? `${novas} migration(s) aplicada(s).` : "Banco já está atualizado.");
} finally {
  await conn.end();
}
