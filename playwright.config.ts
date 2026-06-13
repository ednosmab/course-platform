import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  snapshotDir: './tests/e2e/snapshots',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    baseURL: 'http://localhost:3000',
  },

  projects: [
    {
      name: 'Admin Web - Desktop Chrome',
      testMatch: /.*admin-.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3000' },
    },
    {
      name: 'Aluno Mobile - Web Mobile Chrome',
      testMatch: /.*2-aluno-player\.spec\.ts/,
      use: { ...devices['Pixel 5'], baseURL: 'http://localhost:8081' },
    },
  ],

  // Inicia os servidores de desenvolvimento antes de rodar os testes
  webServer: [
    {
      command: 'pnpm --filter admin dev',
      url: 'http://localhost:3000',
      reuseExistingServer: false,
      timeout: 120 * 1000,
      /**
       * TEST-ONLY: this is the ONLY place `E2E_BYPASS_AUTH` may be set.
       * The middleware short-circuits auth when it sees this var. Do not
       * propagate it to .env*, next.config.*, vercel.json, wrangler.toml,
       * netlify.toml or any deploy config. Enforced by
       * scripts/check-test-env-vars.sh. See docs/skills/e2e_testing.md.
       */
      env: {
        E2E_BYPASS_AUTH: '1',
      },
    },
    {
      command: 'pnpm --filter student web',
      url: 'http://localhost:8081',
      reuseExistingServer: false,
      timeout: 120 * 1000,
      env: {
        EXPO_PUBLIC_E2E_BYPASS_AUTH: '1',
      },
    }
  ],
});
