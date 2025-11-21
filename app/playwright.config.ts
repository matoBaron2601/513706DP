import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './test/frontend',
	use: {
		baseURL: 'http://localhost:5173'
	},

	webServer: {
		command: 'docker compose up -d && bun run dev',
		url: 'http://localhost:5173',
		reuseExistingServer: true,
		env: {
			E2E_AUTH_BYPASS: 'true'
		}
	}
});
