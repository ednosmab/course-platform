import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/ladle-vrt',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: './test-results-ladle' }]],
  snapshotDir: './tests/ladle-vrt/snapshots',
  outputDir: './tests/ladle-vrt/test-results',
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    baseURL: 'http://localhost:61000',
  },
  projects: [
    {
      name: 'Ladle VRT - Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm --filter @projeto/ui ladle',
    url: 'http://localhost:61000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
