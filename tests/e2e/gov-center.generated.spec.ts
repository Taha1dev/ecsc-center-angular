import { expect, test } from '@playwright/test';
const origin = 'http://127.0.0.1:' + (process.env['E2E_PRODUCTION'] ? 5306 : 5206);
for (const shell of ['sidebar', 'navbar']) {
  for (const width of [390, 768, 1280, 1536]) {
    test('gov-center' + ' generated center ' + shell + ' ' + width, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript((value) => localStorage.setItem('shell', value), shell);
      await page.goto(origin + '/login');
      await expect(page.locator('html')).toHaveAttribute('data-center', 'gov-center');
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      await page.getByRole('button', { name: 'تسجيل الدخول', exact: true }).click();
      await expect(page).toHaveURL(origin + '/centers/gov-center');
      for (const route of [
        '',
        '/inbox/group',
        '/inbox/personal',
        '/reports',
        ...[
          'overview',
          'applicants',
          'parties',
          'fields',
          'requirements',
          'attachments',
          'payments',
          'fees',
          'refunds',
          'decisions',
          'actions',
          'notes',
          'activity',
          'output',
        ].map((section) => '/transactions/1001?section=' + section),
      ]) {
        await page.goto(origin + '/centers/gov-center' + route);
        await expect(page.locator('main > app-loading')).toHaveCount(0);
        await expect(page.locator('h1')).toBeVisible();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
        ).toBe(false);
      }
      expect(errors).toEqual([]);
    });
  }
}
