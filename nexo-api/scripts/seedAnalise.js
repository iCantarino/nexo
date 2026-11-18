/**
 * Carrega a massa de dados da análise de vendas (RF0055) a partir de
 * nexo-design/bdd/seeds/*.sql. Idempotente: pode ser executado várias vezes.
 *
 * Uso:  npm run seed:analise
 *
 * Também garante que o administrador inicial (admin@nexo.com) possa autenticar:
 * o schema.sql traz um hash de exemplo, então aqui ele é trocado por um bcrypt real
 * (senha padrão `admin123`, ou ADMIN_SEED_SENHA do .env) somente se ainda for o exemplo.
 */
import { readdirSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { config } from "dotenv";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEEDS_DIR = path.resolve(__dirname, "..", "..", "nexo-design", "bdd", "seeds");

const conn = await mysql.createConnection({
  host: process.env.DB_HOST ?? "127.0.0.1",
  port: Number(process.env.DB_PORT ?? "3306"),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "nexo_db",
  multipleStatements: true,
});

try {
  const arquivos = readdirSync(SEEDS_DIR).filter((f) => f.endsWith(".sql")).sort();
  for (const arquivo of arquivos) {
    console.log(`Carregando ${arquivo} ...`);
    await conn.query(readFileSync(path.join(SEEDS_DIR, arquivo), "utf-8"));
  }

  const hash = await bcrypt.hash(process.env.ADMIN_SEED_SENHA ?? "admin123", 10);
  const [r] = await conn.query(
    "UPDATE funcionario SET senha_hash = ? WHERE email = 'admin@nexo.com' AND senha_hash LIKE '%examplehashvalueonly%'",
    [hash]
  );
  if (r.affectedRows) console.log("Senha do administrador inicial (admin@nexo.com) definida.");
  console.log("Massa de dados da análise carregada.");
} finally {
  await conn.end();
}
