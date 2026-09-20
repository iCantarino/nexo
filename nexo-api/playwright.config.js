import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/functional",
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:8000",
  },
  webServer: {
    command: "node src/server.js",
    url: "http://127.0.0.1:8000/health",
    timeout: 30000,
    reuseExistingServer: !process.env.CI,
  },
});
