import { expect, test } from '@playwright/test';

for (const [index, center] of ['ecsc', 'm3', 'jus'].entries()) {
  test(`${center}: chart legends, table view, expansion, drill, notifications and reset`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    const base = `http://127.0.0.1:${(process.env['E2E_PRODUCTION'] ? 5300 : 5200) + index}/centers/${center}`;
    await page.setViewportSize({ width: 1536, height: 900 });
    await page.goto(base);
    const charts = page.locator('app-chart-workspace');
    await expect(charts).toHaveCount(4);
    const primary = charts.first();
    await expect(primary.getByRole('img').first()).toBeVisible();
    const legend = primary.getByRole('button', { name: /^إخفاء / }).first();
    const series = (await legend.getAttribute('aria-label'))!.replace('إخفاء ', '');
    await legend.click();
    await expect(
      primary.getByRole('button', { name: 'إظهار ' + series, exact: true }),
    ).toHaveAttribute('aria-pressed', 'false');
    await primary.getByRole('button', { name: 'عرض البيانات', exact: true }).click();
    await expect(primary.getByRole('table')).toBeVisible();
    await expect(primary.getByRole('columnheader', { name: series, exact: true })).toBeVisible();
    await primary.getByRole('button', { name: 'الرسم', exact: true }).click();
    await primary.getByRole('button', { name: /^توسيع / }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('img').first()).toBeVisible();
    const expectChartFits = async () => {
      await expect
        .poll(async () => {
          const host = await dialog.locator('app-chart').boundingBox();
          const svg = await dialog.locator('app-chart svg').boundingBox();
          return host && svg ? Math.abs(host.height - svg.height) : 1000;
        })
        .toBeLessThan(1);
    };
    await expectChartFits();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await page.setViewportSize({ width: 390, height: 900 });
    await primary.getByRole('button', { name: /^توسيع / }).click();
    await expectChartFits();
    await page.keyboard.press('Escape');
    await page.setViewportSize({ width: 1536, height: 900 });
    await charts
      .nth(1)
      .getByRole('button', { name: /^واردة ·/ })
      .click();
    await expect(page).toHaveURL(/inbox\/group\?.*status=received/);
    await expect(page.getByRole('combobox', { name: 'الحالة', exact: true })).toContainText(
      'واردة',
    );
    await page.getByRole('button', { name: 'الإشعارات', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'إشعارات المركز', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'حساب الموظف', exact: true }).click();
    await page.getByRole('menuitem', { name: 'إعادة ضبط بيانات المركز', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'تأكيد إعادة الضبط', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('data-center', center);
  });
}
