import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
for (const [index, center] of ['ecsc', 'm3', 'jus'].entries()) {
  test(`${center}: accessible controls, dialogs, RTL and 200% reflow`, async ({ page }) => {
    test.setTimeout(120000);
    const origin = `http://127.0.0.1:${(process.env['E2E_PRODUCTION'] ? 5300 : 5200) + index}`,
      base = origin + '/centers/' + center;
    for (const route of [
      '/login',
      '/centers/' + center,
      '/centers/' + center + '/inbox/group',
      '/centers/' + center + '/transactions/1001?section=applicants',
    ]) {
      await page.goto(origin + route);
      await expect(page.locator('h1')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const result = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        result.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
    }
    await page.goto(base);
    await page.getByRole('button', { name: 'نطاق لوحة المؤشرات', exact: true }).click();
    const grid = page.getByRole('grid').first();
    const day = grid.locator('[role="gridcell"][tabindex="0"]').first();
    await day.focus();
    const date = await day.getAttribute('data-date');
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator(':focus')).not.toHaveAttribute('data-date', date!);
    await page.keyboard.press('Escape');
    await page.setViewportSize({ width: 768, height: 450 });
    await page.goto(base + '/transactions/1001?section=fields');
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    await page.getByRole('button', { name: 'فتح التنقل', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
  });
}
