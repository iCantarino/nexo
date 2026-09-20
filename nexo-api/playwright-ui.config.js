import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/ui",
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    headless: false,
    channel: "chrome",
    launchOptions: {
      slowMo: 800,
    },
    viewport: { width: 1280, height: 720 },
  },
  webServer: [
    {
      command: "node src/server.js",
      cwd: ".",
      port: 8000,
      timeout: 30000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npx vite --port 5173",
      cwd: "../nexo-ui",
      port: 5173,
      timeout: 30000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
