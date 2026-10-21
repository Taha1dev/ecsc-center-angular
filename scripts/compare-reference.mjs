import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reference =
  process.env.REFERENCE_DIR || path.resolve(root, '../ecsc-center-migration-evidence/reference');
const output =
  process.env.VISUAL_OUTPUT || path.resolve(root, '../ecsc-center-migration-evidence/angular-live');
const live = process.env.VISUAL_LIVE_REFERENCE !== '0';
const cachedReference = process.env.VISUAL_REFERENCE_CACHE;
const cachedStates = new Map(
  cachedReference
    ? JSON.parse(fs.readFileSync(path.join(cachedReference, 'manifest.json'), 'utf8')).captures.map(
        (capture) => [capture.filename, capture.referenceState],
      )
    : [],
);
const baseline = JSON.parse(fs.readFileSync(path.join(reference, 'manifest.json'), 'utf8'));
const pages = process.env.VISUAL_PAGES?.split(',');
const widths = process.env.VISUAL_WIDTHS?.split(',').map(Number);
fs.mkdirSync(output, { recursive: true });
fs.mkdirSync(path.join(output, 'reference'), { recursive: true });
const results = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const inspect = (keys) => ({
  title: document.title,
  dir: document.documentElement.dir,
  center: document.documentElement.dataset.center,
  font: getComputedStyle(document.body).fontFamily,
  fontsLoaded: document.fonts.status === 'loaded',
  scrollWidth: document.documentElement.scrollWidth,
  width: innerWidth,
  headings: Array.from(document.querySelectorAll('h1,h2,h3')).map((e) => e.textContent?.trim()),
  text: document.body.innerText,
  tokens: Object.fromEntries(
    keys.map((k) => [k, getComputedStyle(document.documentElement).getPropertyValue(k).trim()]),
  ),
  assetsLoaded: Array.from(document.images).every((i) => i.complete && i.naturalWidth > 0),
});
async function prepare(page, capture, port) {
  await page.setViewportSize(capture.viewport);
  await page.goto(`http://127.0.0.1:${port}/login`);
  await page.evaluate(
    (shell) => localStorage.setItem('shell', shell === 'auth' ? 'sidebar' : shell),
    capture.shell,
  );
  const url = new URL(capture.url);
  await page.goto(`http://127.0.0.1:${port}${url.pathname}${url.search}`);
  await page.locator('h1').waitFor({ timeout: 60000 });
  await page.locator('main > app-loading').waitFor({ state: 'hidden' });
  await page.evaluate(() => document.fonts.ready);
  if (capture.page === 'dashboard') {
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll('app-chart')).every((chart) => {
        const svg = chart.querySelector('svg');
        return (
          svg?.querySelector('path') &&
          Math.abs(svg.getBoundingClientRect().height - chart.getBoundingClientRect().height) < 1
        );
      }),
    );
  }
  await page.mouse.move(0, 0);
}
const save = (completed) =>
  fs.writeFileSync(
    path.join(output, 'manifest.json'),
    JSON.stringify(
      {
        baseline: baseline.commit,
        browser: browser.version(),
        liveReference: live,
        referenceCache: cachedReference || null,
        completed,
        captures: results,
      },
      null,
      2,
    ),
  );
try {
  await Promise.all(
    ['ecsc', 'm3', 'jus'].map(async (center, index) => {
      const captures = baseline.captures.filter(
        (c) =>
          c.center === center &&
          (!pages || pages.includes(c.page)) &&
          (!widths || widths.includes(c.viewport.width)),
      );
      const context = await browser.newContext({
        timezoneId: 'Asia/Damascus',
        deviceScaleFactor: 1,
      });
      const page = await context.newPage();
      const referenceContext = live
        ? await browser.newContext({ timezoneId: 'Asia/Damascus', deviceScaleFactor: 1 })
        : null;
      const referencePage = referenceContext ? await referenceContext.newPage() : null;
      let errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      for (const capture of captures) {
        errors = [];
        try {
          await prepare(page, capture, 5300 + index);
        } catch (error) {
          console.error(
            'Capture failed',
            capture.center,
            capture.shell,
            capture.viewport,
            capture.page,
            page.url(),
            errors,
          );
          await page
            .screenshot({ path: path.join(output, 'failed-' + capture.filename) })
            .catch(() => {});
          save(false);
          throw error;
        }
        const state = await page.evaluate(inspect, Object.keys(capture.state.tokens));
        const filename = path.join(output, capture.filename);
        await page.screenshot({ path: filename, fullPage: true, animations: 'disabled' });
        let referenceState = cachedStates.get(capture.filename) || capture.state,
          referenceFile = cachedReference
            ? path.join(cachedReference, 'reference', capture.filename)
            : path.join(reference, capture.filename);
        if (referencePage) {
          await prepare(referencePage, capture, 4173 + index);
          referenceState = await referencePage.evaluate(inspect, Object.keys(capture.state.tokens));
          referenceFile = path.join(output, 'reference', capture.filename);
          await referencePage.screenshot({
            path: referenceFile,
            fullPage: true,
            animations: 'disabled',
          });
        }
        const before = PNG.sync.read(fs.readFileSync(referenceFile)),
          after = PNG.sync.read(fs.readFileSync(filename)),
          width = Math.max(before.width, after.width),
          height = Math.max(before.height, after.height);
        const pad = (png) => {
          const target = new PNG({ width, height });
          target.data.fill(255);
          PNG.bitblt(png, target, 0, 0, png.width, png.height, 0, 0);
          return target;
        };
        const a = pad(before),
          b = pad(after),
          diff = new PNG({ width, height });
        const changed = pixelmatch(a.data, b.data, diff.data, width, height, {
          threshold: 0.1,
          includeAA: false,
        });
        if (changed)
          fs.writeFileSync(
            path.join(output, capture.filename.replace('.png', '-diff.png')),
            PNG.sync.write(diff, { deflateLevel: 1 }),
          );
        results.push({
          center: capture.center,
          shell: capture.shell,
          page: capture.page,
          viewport: capture.viewport,
          reflow: capture.reflow,
          filename: capture.filename,
          dimensions: {
            reference: [before.width, before.height],
            angular: [after.width, after.height],
          },
          changedPixels: changed,
          pixelDifferencePercent: (changed / (width * height)) * 100,
          tokenDifferences: Object.keys(referenceState.tokens).filter(
            (k) => referenceState.tokens[k] !== state.tokens[k],
          ),
          errors,
          state,
          referenceState,
        });
        if (results.length % 20 === 0) {
          save(false);
          console.log('Compared', results.length);
        }
      }
      await context.close();
      await referenceContext?.close();
    }),
  );
  save(true);
  console.log(
    JSON.stringify(
      {
        captures: results.length,
        exact: results.filter((r) => r.changedPixels === 0).length,
        runtimeErrors: results.filter((r) => r.errors.length).length,
        overflow: results
          .filter((r) => r.state.scrollWidth > r.state.width + 1)
          .map((r) => r.filename),
        medianPixelDifference: results.map((r) => r.pixelDifferencePercent).sort((a, b) => a - b)[
          Math.floor(results.length / 2)
        ],
        largestDifferences: results
          .toSorted((a, b) => b.pixelDifferencePercent - a.pixelDifferencePercent)
          .slice(0, 10)
          .map((r) => ({
            file: r.filename,
            percent: r.pixelDifferencePercent,
            dimensions: r.dimensions,
          })),
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
