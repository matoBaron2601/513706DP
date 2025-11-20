import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/frontend',

  use: {
    baseURL: 'http://127.0.0.1:5173', // Vite default
  },

  webServer: {
    command: 'docker compose up -d && bun run dev',
    url: 'http://127.0.0.1:5173',   
    reuseExistingServer: true,
  },
});
