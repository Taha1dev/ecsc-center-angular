// Historical baseline tool only. See docs/archive/angular-migration.md.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = process.env.OVERLAY_OUTPUT || path.join(root, 'test-results/archive-overlays');
fs.mkdirSync(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const captures = [];
const requestedStates = process.env.OVERLAY_STATES?.split(',');
const caseKey = (c) => `${c.center}-${c.shell}-${c.width}-${c.state}`;
const retryCases = process.env.OVERLAY_RETRY_MANIFEST
  ? new Set(
      JSON.parse(fs.readFileSync(process.env.OVERLAY_RETRY_MANIFEST, 'utf8'))
        .captures.filter((c) => c.error)
        .map(caseKey),
    )
  : null;
const states = [
  {
    id: 'date-range',
    route: '',
    open: (p) => p.getByRole('button', { name: 'نطاق لوحة المؤشرات', exact: true }).click(),
  },
  {
    id: 'chart-expanded',
    route: '',
    open: (p) =>
      p
        .getByRole('button', { name: /^توسيع / })
        .first()
        .click(),
  },
  {
    id: 'account-menu',
    route: '/inbox/group',
    open: (p) => p.getByRole('banner').getByRole('button').filter({ hasText: 'ل' }).last().click(),
  },
  {
    id: 'notifications',
    route: '/inbox/group',
    open: (p) => p.getByRole('button', { name: 'الإشعارات', exact: true }).click(),
  },
  {
    id: 'note-dialog',
    route: '/transactions/1001?section=notes',
    open: (p) => p.getByRole('button', { name: 'إضافة ملاحظة', exact: true }).last().click(),
  },
  {
    id: 'report-parameters',
    route: '/reports',
    open: (p) => p.getByRole('button', { name: 'اختيار التقرير', exact: true }).first().click(),
  },
  {
    id: 'report-preview',
    route: '/reports',
    open: async (p) => {
      await p.getByRole('button', { name: 'اختيار التقرير', exact: true }).first().click();
      await p.getByRole('button', { name: 'إنشاء معاينة', exact: true }).click();
      await p.getByText('المعاينة جاهزة · بيانات توضيحية', { exact: true }).waitFor();
    },
  },
].filter((state) => !requestedStates || requestedStates.includes(state.id));
try {
  await Promise.all(
    ['ecsc', 'm3', 'jus'].map(async (center, index) => {
      for (const width of [390, 1536])
        for (const shell of ['sidebar', 'navbar']) {
          const contexts = await Promise.all(
            [0, 1].map(() =>
              browser.newContext({
                viewport: { width, height: 900 },
                timezoneId: 'Asia/Damascus',
                deviceScaleFactor: 1,
              }),
            ),
          );
          const pages = await Promise.all(contexts.map((context) => context.newPage()));
          for (const state of states) {
            if (retryCases && !retryCases.has(caseKey({ center, shell, width, state: state.id })))
              continue;
            const images = [];
            const result = { center, shell, width, state: state.id };
            try {
              for (const [side, port] of [4173 + index, 5300 + index].entries()) {
                const page = pages[side];
                await page.goto(`http://127.0.0.1:${port}/login`);
                await page.evaluate((value) => localStorage.setItem('shell', value), shell);
                await page.goto(`http://127.0.0.1:${port}/centers/${center}${state.route}`);
                await page.locator('h1').waitFor({ timeout: 60000 });
                await page.locator('main > app-loading').waitFor({ state: 'hidden' });
                await page.evaluate(() => document.fonts.ready);
                await state.open(page);
                if (state.id === 'chart-expanded') {
                  await page
                    .locator(
                      '[role="dialog"] app-chart svg path, [role="dialog"] svg.recharts-surface path',
                    )
                    .first()
                    .waitFor({ state: 'attached' });
                  await page.waitForFunction(() =>
                    Array.from(document.querySelectorAll('[role="dialog"] app-chart')).every(
                      (chart) => {
                        const svg = chart.querySelector('svg');
                        return (
                          svg &&
                          Math.abs(
                            svg.getBoundingClientRect().height -
                              chart.getBoundingClientRect().height,
                          ) < 1
                        );
                      },
                    ),
                  );
                }
                await page.mouse.move(0, 0);
                await page.evaluate(
                  () =>
                    new Promise((resolve) =>
                      requestAnimationFrame(() => requestAnimationFrame(resolve)),
                    ),
                );
                const filename = `${center}-${shell}-${width}-${state.id}-${side ? 'angular' : 'reference'}.png`;
                await page.screenshot({
                  path: path.join(output, filename),
                  animations: 'disabled',
                });
                images.push(PNG.sync.read(fs.readFileSync(path.join(output, filename))));
              }
              const diff = new PNG({ width, height: 900 });
              const changed = pixelmatch(images[0].data, images[1].data, diff.data, width, 900, {
                threshold: 0.1,
                includeAA: false,
              });
              result.pixelDifferencePercent = (changed / (width * 900)) * 100;
              fs.writeFileSync(
                path.join(output, `${center}-${shell}-${width}-${state.id}-diff.png`),
                PNG.sync.write(diff),
              );
            } catch (error) {
              result.error = error.message;
            }
            captures.push(result);
            console.log(
              center,
              shell,
              width,
              state.id,
              result.error || result.pixelDifferencePercent.toFixed(3),
            );
          }
          await Promise.all(contexts.map((context) => context.close()));
        }
    }),
  );
} finally {
  fs.writeFileSync(
    path.join(output, 'manifest.json'),
    JSON.stringify({ browser: browser.version(), captures }, null, 2),
  );
  await browser.close();
}
if (captures.some((capture) => capture.error)) process.exitCode = 1;
