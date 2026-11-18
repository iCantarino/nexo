import { config } from "dotenv";

config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Variável de ambiente obrigatória não definida: ${name}`);
  }
  return value;
}

function requiredNoFallback(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória não definida ou vazia: ${name}`);
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
    secret: requiredNoFallback("JWT_SECRET"),
    expiresIn: required("JWT_EXPIRES_IN", "1h"),
  },
  app: {
    nodeEnv: required("NODE_ENV", "development"),
    port: Number(required("APP_PORT", "8000")),
  },
  // RN0044 / RNF0045: prazo (em minutos) de bloqueio dos itens no carrinho, contado a partir do último item incluído.
  carrinho: {
    minutosBloqueio: Number(required("CART_LOCK_MINUTES", "15")),
  },
  // RNF0044: configuração do provedor de IA generativa (OpenRouter)
  ia: {
    openRouterApiKey: required("OPENROUTER_API_KEY"),
    openRouterModel: required("OPENROUTER_MODEL", "openai/gpt-5.6-luna"),
    openRouterUrl: required("OPENROUTER_URL", "https://openrouter.ai/api/v1/chat/completions"),
    openRouterReferer: required("OPENROUTER_REFERER", ""),
    openRouterTimeoutMs: Number(required("OPENROUTER_TIMEOUT_MS", "30000")),
  },
  corsOrigins: required("CORS_ORIGINS", "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
