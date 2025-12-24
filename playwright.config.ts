import { defineConfig } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: process.env.API_URL || "localhost:3000",
    trace: "on-first-retry",
    extraHTTPHeaders: {
      Accept: "application/json",
      "X-API-KEY": process.env.API_KEY_PRIMARY || "",
    },
  },
  projects: [
    {
      name: "client-api",
      testDir: "./apps/client-api/tests",
      testMatch: /.*\.spec\.ts$/,
      testIgnore: /rate-limiting\.spec\.ts$/,
    },
    {
      name: "rate-limiting",
      testDir: "./apps/client-api/tests",
      testMatch: /rate-limiting\.spec\.ts$/,
      dependencies: ["client-api"],
    },
  ],
});
