import { config } from "dotenv";

config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Variável de ambiente obrigatória não definida: ${name}`);
  }
  return value;
}

export const env = {
  db: {
    host: required("DB_HOST", "127.0.0.1"),
    port: Number(required("DB_PORT", "3306")),
    user: required("DB_USER", "root"),
    password: required("DB_PASSWORD", ""),
    name: required("DB_NAME", "nexo_db"),
  },
  jwt: {
    secret: required("JWT_SECRET", "change-this-secret"),
    expiresIn: required("JWT_EXPIRES_IN", "1h"),
  },
  app: {
    nodeEnv: required("NODE_ENV", "development"),
    port: Number(required("APP_PORT", "8000")),
  },
  corsOrigins: required("CORS_ORIGINS", "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
