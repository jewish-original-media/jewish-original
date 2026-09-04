import { readFileSync } from "node:fs";

import { defineConfig } from "@playwright/test";

try {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const [name, value] = line.split("=", 2);
    if (!name || value === undefined || !/^[A-Z0-9_]+$/.test(name)) continue;
    if (process.env[name]) continue;
    process.env[name] = value.replace(/^["']|["']$/g, "");
  }
} catch {
  // Draft preview tests skip when local secrets are absent.
}

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const port = new URL(baseURL).port || "3000";

export default defineConfig({
  testDir: "./tests",
  testIgnore: /\.test\.ts$/,
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: executablePath ? { executablePath } : { channel: "chrome" },
  },
  webServer: {
    // Production start avoids next dev file-watchers (EMFILE) and matches
    // the published CSS/font output used for History visual QA.
    // PLAYWRIGHT_BASE_URL lets this worktree share a machine with other streams.
    command: `npx next start --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "desktop",
      use: { viewport: { width: 1440, height: 1000 } },
    },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
