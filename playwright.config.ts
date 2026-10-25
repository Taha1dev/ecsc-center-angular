import { defineConfig } from '@playwright/test';
import { workspaceApps, workspaceRootType } from './scripts/workspace-apps.mjs';
const production = !!process.env['E2E_PRODUCTION'];
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
  webServer: workspaceApps().map((app: workspaceRootType) => ({
    command: `npm run ${production ? 'preview' : 'dev'}:${app.id}`,
    url: `http://127.0.0.1:${production ? app.previewPort : app.devPort}`,
    reuseExistingServer: true,
    timeout: 120000,
  })),
});
