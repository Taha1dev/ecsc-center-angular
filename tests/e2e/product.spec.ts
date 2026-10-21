import { expect, test, type Page } from '@playwright/test';
const offset = process.env['E2E_PRODUCTION'] ? 100 : 0;
const centers = [
  { id: 'ecsc', name: 'مركز البوابة', port: 5200 + offset },
  { id: 'm3', name: 'مركز المصالح العقارية', port: 5201 + offset },
  { id: 'jus', name: 'مركز العدل', port: 5202 + offset },
];
const sections = [
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
];
async function ready(page: Page, url: string) {
  await page.goto(url);
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('main > app-loading')).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
}
async function select(page: Page, label: string, option: string) {
  await page.getByRole('combobox', { name: label, exact: true }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}
for (const center of centers) {
  const origin = `http://127.0.0.1:${center.port}`,
    base = `${origin}/centers/${center.id}`;
  test.describe(center.id, () => {
    test('demo entry, password, foreign routes and invalid route recovery', async ({ page }) => {
      await page.goto(origin + '/login');
      await expect(page.getByRole('heading', { name: 'تسجيل الدخول', exact: true })).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      const password = page.locator('input[autocomplete="current-password"]');
      await page.getByRole('button', { name: 'إظهار كلمة المرور' }).click();
      await expect(password).toHaveAttribute('type', 'text');
      await page.getByRole('button', { name: 'تسجيل الدخول', exact: true }).click();
      await expect(page).toHaveURL(base);
      await page.goto(origin + '/centers/foreign/transactions/1001');
      await expect(page.getByText('الصفحة أو المركز غير موجود', { exact: true })).toBeVisible();
      await page.goto(origin + '/login?center=foreign');
      await expect(page.getByText('الصفحة أو المركز غير موجود', { exact: true })).toBeVisible();
      await page.goto(base + '/inbox/invalid');
      await expect(page.getByText('الصفحة أو المركز غير موجود', { exact: true })).toBeVisible();
      await ready(page, base + '/transactions/missing');
      await expect(
        page.getByText('المعاملة غير موجودة في هذا المركز', { exact: true }),
      ).toBeVisible();
      await ready(page, base + '/transactions/1001?section=invalid');
      await page.getByRole('button', { name: 'نظرة عامة', exact: true }).click();
      await expect(page).toHaveURL(/section=overview/);
    });
    for (const shell of ['sidebar', 'navbar'])
      for (const width of [390, 768, 1280, 1536])
        test(`all routes, RTL and responsive ${shell} ${width}`, async ({ page }) => {
          test.setTimeout(90000);
          await page.setViewportSize({ width, height: 900 });
          await page.addInitScript((value) => localStorage.setItem('shell', value), shell);
          const errors: string[] = [];
          page.on('pageerror', (e) => errors.push(e.message));
          for (const route of [
            '',
            '/inbox/group',
            '/inbox/personal',
            '/reports',
            '/design-system',
            ...sections.map((s) => '/transactions/1001?section=' + s),
          ]) {
            await ready(page, base + route);
            await expect(page.locator('h1')).toBeVisible();
            const overflow = await page.evaluate(
              () => document.documentElement.scrollWidth > window.innerWidth + 1,
            );
            expect(overflow, route).toBe(false);
            if (center.id === 'm3' && route.endsWith('section=fields'))
              await expect(page.locator('[data-center-section="property-fields"]')).toBeVisible();
          }
          expect(errors).toEqual([]);
        });
    test('table sorting, paging, visibility, selection, bulk claim and collection modes', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1536, height: 900 });
      await ready(page, base + '/inbox/group');
      await expect(page.locator('tbody tr')).toHaveCount(10);
      await page.getByRole('button', { name: 'الصفحة التالية', exact: true }).click();
      await expect(page.getByText('2 / 5', { exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'المعاملة', exact: true }).click();
      await expect(page.getByText('1 / 5', { exact: true })).toBeVisible();
      await expect(page.locator('tbody tr').first()).toContainText('#1001');
      await page.getByRole('button', { name: 'المعاملة', exact: true }).click();
      await expect(page.locator('tbody tr').first()).toContainText('#1048');
      await page.getByRole('button', { name: 'المعاملة', exact: true }).click();
      await page.getByRole('button', { name: 'إظهار الأعمدة' }).click();
      await page.getByRole('menuitem', { name: /مقدم الطلب/ }).click();
      await expect(page.getByRole('columnheader', { name: 'مقدم الطلب' })).toHaveCount(0);
      await page.getByRole('checkbox', { name: 'تحديد الصفحة', exact: true }).check();
      await page.getByRole('button', { name: 'استلام المحدد', exact: true }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'تأكيد الاستلام', exact: true }).click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await ready(page, base + '/transactions/1001?section=applicants');
      await page.getByRole('button', { name: 'عرض البطاقات', exact: true }).click();
      await expect(page.locator('app-collection-view app-entity-card').first()).toBeVisible();
      await page.getByRole('button', { name: 'عرض الجدول', exact: true }).click();
      await expect(page.locator('table')).toBeVisible();
    });
    test('dynamic dependent filters and date range draft/apply/cancel', async ({ page }) => {
      await ready(page, base + '/inbox/group');
      const group = page.getByRole('combobox', { name: 'مجموعة الخدمة', exact: true });
      await group.click();
      const options = page.getByRole('listbox').getByRole('option');
      const groupName = await options.nth(1).innerText();
      await options.nth(1).click();
      await page.getByRole('button', { name: 'تطبيق المرشحات', exact: true }).click();
      expect(await page.locator('tbody tr').count()).toBeGreaterThan(0);
      await page.getByRole('button', { name: 'إعادة ضبط', exact: true }).click();
      await ready(page, base);
      await page.getByRole('button', { name: 'نطاق لوحة المؤشرات', exact: true }).click();
      await expect(
        page.getByRole('dialog', { name: 'نطاق لوحة المؤشرات', exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('combobox', { name: 'اختر الشهر', exact: true }).first(),
      ).toHaveValue('9');
      await expect(
        page.getByRole('combobox', { name: 'اختر السنة', exact: true }).first(),
      ).toHaveValue('2026');
      const calendarMonth = page.getByRole('combobox', { name: 'اختر الشهر', exact: true }).first();
      const calendarYear = page.getByRole('combobox', { name: 'اختر السنة', exact: true }).first();
      await calendarYear.selectOption('2020');
      await calendarMonth.selectOption('0');
      await expect(
        page.getByRole('grid').first().locator('[role="gridcell"][tabindex="0"]'),
      ).toHaveCount(1);
      await expect(page.locator('button[aria-label="الشهر السابق"]')).toBeDisabled();
      await calendarYear.selectOption('2030');
      await calendarMonth.selectOption('11');
      await expect(page.locator('button[aria-label="الشهر التالي"]')).toBeDisabled();
      await calendarYear.selectOption('2026');
      await calendarMonth.selectOption('9');
      await page.getByRole('button', { name: 'اليوم', exact: true }).click();
      await page.getByRole('button', { name: 'إلغاء', exact: true }).click();
      await expect(
        page.getByRole('button', { name: 'نطاق لوحة المؤشرات', exact: true }),
      ).toContainText('١ تشرين الأول');
      await page.getByRole('button', { name: 'نطاق لوحة المؤشرات', exact: true }).click();
      await page.getByRole('button', { name: 'مسح', exact: true }).click();
      await expect(
        page.getByRole('dialog', { name: 'نطاق لوحة المؤشرات', exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'إلغاء', exact: true }).click();
      await expect(
        page.getByRole('button', { name: 'نطاق لوحة المؤشرات', exact: true }),
      ).toContainText('١ تشرين الأول');
      await page.getByRole('button', { name: 'نطاق لوحة المؤشرات', exact: true }).click();
      await page.getByRole('button', { name: 'مسح', exact: true }).click();
      await page.getByRole('grid').first().locator('[data-date="2026-10-08"]').click();
      await page.getByRole('grid').first().locator('[data-date="2026-10-10"]').click();
      await page.getByRole('button', { name: 'تطبيق الفترة', exact: true }).click();
      await expect(
        page.getByRole('button', { name: 'نطاق لوحة المؤشرات', exact: true }),
      ).toContainText('٨ تشرين الأول');
      await expect(
        page.getByRole('button', { name: 'نطاق لوحة المؤشرات', exact: true }),
      ).toContainText('١٠ تشرين الأول');
      await page.getByRole('button', { name: 'نطاق لوحة المؤشرات', exact: true }).click();
      await page.getByRole('button', { name: 'اليوم', exact: true }).click();
      await page.getByRole('button', { name: 'تطبيق الفترة', exact: true }).click();
      await expect(
        page.getByRole('button', { name: 'نطاق لوحة المؤشرات', exact: true }),
      ).toContainText('٦ تشرين الأول');
      expect(groupName).toBeTruthy();
    });
    test('action validation retains drafts, accepted mutation, Escape and focus restoration', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1536, height: 900 });
      await ready(page, base + '/transactions/1001?section=notes');
      const add = page.getByRole('button', { name: 'إضافة ملاحظة', exact: true }).last();
      await add.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await dialog.getByRole('textbox', { name: 'النص', exact: true }).fill('');
      await dialog.getByRole('button', { name: 'تأكيد التحديث المحلي' }).click();
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('alert')).toBeVisible();
      const text = `ملاحظة اختبار Angular ${center.id}`;
      await dialog.getByRole('textbox', { name: 'النص', exact: true }).fill(text);
      await dialog.getByRole('button', { name: 'تأكيد التحديث المحلي' }).click();
      await expect(dialog).toHaveCount(0);
      await expect(page.getByText(text, { exact: true })).toBeVisible();
      await add.click();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(add).toBeFocused();
    });
    test('reports, retries, empty results and real CSV/Excel downloads', async ({ page }) => {
      test.setTimeout(90000);
      await ready(page, base + '/reports');
      const buttons = page.getByRole('button', { name: 'اختيار التقرير', exact: true });
      const count = await buttons.count();
      expect(count).toBe(10);
      for (let i = 0; i < count; i++) {
        await page.getByRole('button', { name: 'اختيار التقرير', exact: true }).nth(i).click();
        if (i === 2) {
          await page.getByRole('combobox', { name: 'الموظف', exact: true }).click();
          await page.getByRole('listbox').getByRole('option').nth(1).click();
        }
        await page.getByRole('button', { name: 'إنشاء معاينة', exact: true }).click();
        if (await page.getByRole('button', { name: 'إعادة المحاولة', exact: true }).isVisible())
          await page.getByRole('button', { name: 'إعادة المحاولة', exact: true }).click();
        await expect(
          page.getByText('المعاينة جاهزة · بيانات توضيحية', { exact: true }),
        ).toBeVisible();
        if (i === 5)
          await expect(
            page.getByText('لا توجد نتائج لهذه المعايير', { exact: true }),
          ).toBeVisible();
        if (i === 0) {
          for (const format of ['CSV', 'Excel']) {
            await page.getByRole('button', { name: 'تعديل المعايير', exact: true }).first().click();
            await select(page, 'نوع ملف التقرير', format);
            await page.getByRole('button', { name: 'إنشاء معاينة', exact: true }).click();
            const download = page.waitForEvent('download');
            await page.getByRole('button', { name: new RegExp('تنزيل ملف ' + format) }).click();
            const file = await download;
            expect(file.suggestedFilename()).toMatch(format === 'CSV' ? /\.csv$/ : /\.xlsx$/);
            await file.saveAs(
              test.info().outputPath(center.id + '-report.' + (format === 'CSV' ? 'csv' : 'xlsx')),
            );
          }
        }
        await page.getByRole('button', { name: 'العودة إلى الدليل', exact: true }).click();
      }
    });
    test('shell switches preserve a form and mobile dialogs trap focus', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await ready(page, base + '/inbox/group');
      const query = page.getByRole('textbox').first();
      await query.fill('مسودة محفوظة');
      await page.getByRole('button', { name: 'حساب الموظف' }).click();
      await page.getByRole('menuitem', { name: /طريقة العرض/ }).click();
      await expect(query).toHaveValue('مسودة محفوظة');
      await page.setViewportSize({ width: 390, height: 844 });
      const account = page.getByRole('button', { name: 'حساب الموظف', exact: true });
      await account.click();
      const menu = page.getByRole('menu', { name: 'حساب الموظف', exact: true });
      await expect(menu).toBeVisible();
      const menuBox = (await menu.boundingBox())!;
      const accountBox = (await account.boundingBox())!;
      expect(menuBox.x).toBeGreaterThanOrEqual(12);
      expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(378);
      expect(menuBox.x).toBeCloseTo(Math.max(12, Math.min(accountBox.x, 378 - menuBox.width)), 0);
      await page.keyboard.press('Escape');
      await expect(account).toBeFocused();
      await page.keyboard.press('ArrowDown');
      await expect(menu.getByRole('menuitem').first()).toBeFocused();
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'فتح التنقل', exact: true }).click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press('Tab');
        expect(
          await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')),
        ).toBe(true);
      }
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
    });
  });
}
