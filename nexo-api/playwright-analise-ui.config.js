import { defineConfig } from "@playwright/test";

// UI da análise de vendas, headless. Portas próprias para não colidir com outros serviços locais.
// Pré-requisito: `npm run migrate` e `npm run seed:analise` (massa de 2025).
const API = process.env.TEST_API_PORT ?? "8010";
const UI = process.env.TEST_UI_PORT ?? "5174";

export default defineConfig({
  testDir: "./tests/ui",
  testMatch: /analise-ui\.spec\.js/,
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${UI}`,
    headless: true,
    channel: "chrome", // usa o Chrome instalado (evita `npx playwright install`)
    viewport: { width: 1280, height: 900 },
  },
  webServer: [
    {
      command: "node src/server.js",
      cwd: ".",
      env: { ...process.env, APP_PORT: API, CORS_ORIGINS: `http://localhost:${UI}` },
      url: `http://127.0.0.1:${API}/health`,
      timeout: 30000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `npx vite --port ${UI} --strictPort`,
      cwd: "../nexo-ui",
      env: { ...process.env, VITE_API_URL: `http://localhost:${API}/api/v1` },
      url: `http://localhost:${UI}`,
      timeout: 60000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
