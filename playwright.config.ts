import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    baseURL: 'http://localhost:3000', // Padrão admin
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
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: 'pnpm --filter student web',
      url: 'http://localhost:8081',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    }
  ],
});
