import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './apps',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: process.env.API_URL || 'localhost:3000',
    trace: 'on-first-retry',
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'X-API-KEY': process.env.API_KEY || '',
    },
  },
  projects: [
    {
      name: 'client-api',
      testDir: './apps/client-api/tests',
    },
  ],
});

