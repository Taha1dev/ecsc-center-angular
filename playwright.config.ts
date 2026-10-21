import { defineConfig } from '@playwright/test';
const production = !!process.env['E2E_PRODUCTION'];
const port = production ? 5300 : 5200;
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90000,
  expect: { timeout: 15000 },
  fullyParallel: true,
  workers: 3,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/e2e.json' }]],
  use: {
    browserName: 'chromium',
    channel: 'chrome',
    timezoneId: 'Asia/Damascus',
    locale: 'ar-SY',
    trace: 'retain-on-failure',
  },
  webServer: ['ecsc', 'm3', 'jus'].map((center, i) => ({
    command: `npm run ${production ? 'preview' : 'dev'}:${center}`,
    url: `http://127.0.0.1:${port + i}`,
    reuseExistingServer: true,
    timeout: 120000,
  })),
});
