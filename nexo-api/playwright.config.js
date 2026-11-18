import { defineConfig } from "@playwright/test";

// Porta da API nos testes (padrão 8000). Use TEST_API_PORT se a 8000 estiver ocupada.
const PORTA = process.env.TEST_API_PORT ?? "8000";

export default defineConfig({
  testDir: "./tests/functional",
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${PORTA}`,
  },
  webServer: {
    command: "node src/server.js",
    env: { ...process.env, APP_PORT: PORTA },
    url: `http://127.0.0.1:${PORTA}/health`,
    timeout: 30000,
    reuseExistingServer: !process.env.CI,
  },
});
