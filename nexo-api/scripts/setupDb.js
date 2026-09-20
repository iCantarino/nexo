/**
 * Script para (re)criar o banco de dados Nexo a partir de nexo-design/bdd/schema.sql.
 *
 * Uso:
 *   npm run setup-db
 *
 * Lê as credenciais do arquivo .env (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD) e
 * executa o script SQL completo, criando o banco `nexo_db`, todas as tabelas,
 * a view de análise e os seeds de domínio.
 */
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import mysql from "mysql2/promise";
import { config } from "dotenv";

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = path.resolve(__dirname, "..", "..", "nexo-design", "bdd", "schema.sql");

async function main() {
  const sqlContent = readFileSync(SCHEMA_PATH, "utf-8");

  const dbHost = process.env.DB_HOST ?? "127.0.0.1";
  const dbPort = Number(process.env.DB_PORT ?? "3306");
  const dbUser = process.env.DB_USER ?? "root";
  const dbPassword = process.env.DB_PASSWORD ?? "";

  console.log(`Conectando em ${dbHost}:${dbPort} como '${dbUser}'...`);
  const connection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    multipleStatements: true,
  });

  try {
    console.log("Executando nexo-design/bdd/schema.sql ...");
    await connection.query(sqlContent);
    console.log(`Banco de dados '${process.env.DB_NAME ?? "nexo_db"}' criado/atualizado com sucesso.`);
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error("Erro ao executar o setup do banco:", err);
  process.exit(1);
});
