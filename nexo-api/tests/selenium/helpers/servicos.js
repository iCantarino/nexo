import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_DIR = path.resolve(__dirname, "..", "..", "..");
const UI_DIR = path.resolve(API_DIR, "..", "nexo-ui");

// Portas próprias (a 8000 pode estar ocupada por outro serviço local).
export const API_PORT = process.env.TEST_API_PORT ?? "8010";
export const UI_PORT = process.env.TEST_UI_PORT ?? "5174";
export const API_URL = `http://127.0.0.1:${API_PORT}/api/v1`;
export const UI_URL = `http://localhost:${UI_PORT}`;

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function responde(url) {
  try {
    return (await fetch(url, { signal: AbortSignal.timeout(1500) })).ok;
  } catch {
    return false;
  }
}

async function esperar(url, ms) {
  const fim = Date.now() + ms;
  while (Date.now() < fim) {
    if (await responde(url)) return;
    await dormir(300);
  }
  throw new Error(`Serviço não respondeu a tempo: ${url}`);
}

/** Sobe API e UI (se ainda não estiverem no ar) e devolve a função que as encerra. */
export async function subirServicos() {
  const filhos = [];
  if (!(await responde(`http://127.0.0.1:${API_PORT}/health`))) {
    filhos.push(
      spawn(process.execPath, ["src/server.js"], {
        cwd: API_DIR,
        env: { ...process.env, APP_PORT: API_PORT, CORS_ORIGINS: UI_URL },
        stdio: "ignore",
      })
    );
    await esperar(`http://127.0.0.1:${API_PORT}/health`, 30000);
  }
  if (!(await responde(UI_URL))) {
    const vite = path.join(UI_DIR, "node_modules", "vite", "bin", "vite.js");
    filhos.push(
      spawn(process.execPath, [vite, "--port", UI_PORT, "--strictPort"], {
        cwd: UI_DIR,
        env: { ...process.env, VITE_API_URL: `http://localhost:${API_PORT}/api/v1` },
        stdio: "ignore",
      })
    );
    await esperar(UI_URL, 60000);
  }
  return () => filhos.forEach((p) => p.kill());
}
