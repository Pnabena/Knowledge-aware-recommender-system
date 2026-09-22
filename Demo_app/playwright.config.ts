import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  use: { baseURL: "http://127.0.0.1:4173", channel: "chrome", viewport: { width: 1440, height: 1000 } },
  webServer: {
    command: "node scripts/serve-static.mjs",
    env: { PORT: "4173" },
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
});
