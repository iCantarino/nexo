import { defineConfig } from "@playwright/test";

// UI do fluxo de compra (carrinho + checkout), headless por padrão.
// Para demonstração: $env:HEADED='1'; npm run test:compra-ui
const API = process.env.TEST_API_PORT ?? "8010";
const UI = process.env.TEST_UI_PORT ?? "5174";
const HEADED = String(process.env.HEADED).toLowerCase() === "1" || String(process.env.HEADED).toLowerCase() === "true";

export default defineConfig({
  testDir: "./tests/ui",
  testMatch: /compra-ui\.spec\.js/,
  timeout: 90000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${UI}`,
    headless: !HEADED,
    channel: "chrome",
    viewport: { width: 1280, height: 900 },
    ...(HEADED ? { launchOptions: { slowMo: 600 } } : {}),
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