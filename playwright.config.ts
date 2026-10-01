import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    headless: false,
    baseURL: 'http://127.0.0.1:4327',
  },
  webServer: {
    command: 'npm run site:e2e:server',
    url: 'http://127.0.0.1:4327',
    reuseExistingServer: false,
  },
});
