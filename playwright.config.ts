import { defineConfig, devices } from "@playwright/test";

/**
 * Tests run against the deployed site, so BASE_URL can be pointed at a
 * preview deployment without touching the specs.
 */
const BASE_URL = process.env.BASE_URL ?? "https://kalenday.com";

export default defineConfig({
  testDir: "./tests",
  // Production is a shared target: keep the request rate civil.
  workers: process.env.CI ? 2 : 4,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: BASE_URL,
    // Traces only on a retry: enough to debug a CI failure, no cost otherwise.
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
});
