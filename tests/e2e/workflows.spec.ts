import { expect, test, type Page } from '@playwright/test';
const port = process.env['E2E_PRODUCTION'] ? 5300 : 5200;
for (const [index, center] of ['ecsc', 'm3', 'jus'].entries())
  test(`${center}: transaction action forms and output preview`, async ({ page }) => {
    test.setTimeout(150000);
    const base = `http://127.0.0.1:${port + index}/centers/${center}/transactions/`;
    const open = async (section: string, id = '1001') => {
      await page.goto(base + id + '?section=' + section);
      await expect(page.locator('h1')).toBeVisible();
    };
    const confirm = async () => {
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'تأكيد التحديث المحلي', exact: true })
        .click();
      await expect(page.getByRole('dialog')).toHaveCount(0);
    };
    await page.setViewportSize({ width: 1280, height: 900 });
    await open('overview');
    await page.getByRole('button', { name: 'استلام المعاملة', exact: true }).click();
    await confirm();
    await expect(
      page.getByRole('button', { name: 'تحديث الحالة', exact: true }).first(),
    ).toBeVisible();
    await page.getByRole('button', { name: 'تحويل المعاملة', exact: true }).click();
    await confirm();
    await open('overview', '1002');
    await page.getByRole('button', { name: 'تحديث الحالة', exact: true }).first().click();
    await choose(page, 'الحالة الجديدة');
    await confirm();
    await open('applicants');
    await expect(page.getByRole('columnheader', { name: 'مقدم الطلب', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'إضافة مقدم طلب', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'الاسم الكامل', exact: true })
      .fill('مقدم طلب اختبار Angular');
    await page.getByRole('textbox', { name: 'رقم الإثبات', exact: true }).fill('01309998877');
    await confirm();
    await expect(page.getByText('مقدم طلب اختبار Angular', { exact: true }).first()).toBeVisible();
    await open('fields');
    await page.getByRole('button', { name: 'تعديل حقل', exact: true }).click();
    const field = page.getByRole('dialog').getByLabel('القيمة', { exact: true });
    const type = await field.getAttribute('type');
    if ((await field.getAttribute('role')) === 'combobox') await choose(page, 'القيمة');
    else
      await field.fill(
        type === 'number' ? '125' : type === 'date' ? '2026-10-07' : 'مرجع اختبار Angular',
      );
    await confirm();
    await open('attachments');
    await page.getByRole('button', { name: 'إضافة مرفق', exact: true }).first().click();
    await page.locator('input[type="file"]').setInputFiles({
      name: 'angular-reference.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('مرفق توضيحي'),
    });
    await confirm();
    await expect(page.getByText('angular-reference.txt', { exact: true }).first()).toBeVisible();
    await open('payments');
    await expect(page.getByRole('columnheader', { name: 'رقم الدفعة', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'تأكيد الحالة', exact: true }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'إنشاء دفعة', exact: true }).first().click();
    await page
      .getByRole('spinbutton', { name: 'المبلغ التوضيحي (ل.س)', exact: true })
      .fill('12500');
    await confirm();
    await open('fees');
    await page.getByRole('button', { name: 'تعديل توضيحي', exact: true }).first().click();
    await page
      .getByRole('spinbutton', { name: 'المبلغ التوضيحي (ل.س)', exact: true })
      .fill('42000');
    await confirm();
    await page.getByRole('button', { name: 'المبلغ', exact: true }).click();
    const readAmounts = async () =>
      (
        await page
          .locator('app-fees-section tbody tr')
          .evaluateAll((rows) => rows.map((row) => row.querySelectorAll('td')[1].textContent || ''))
      ).map((value) =>
        Number(
          value
            .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
            .replace(/[^0-9.-]/g, ''),
        ),
      );
    // TanStack's reference behavior sorts numeric columns descending first.
    const amounts = await readAmounts();
    expect(amounts).toEqual([...amounts].sort((a, b) => b - a));
    await page.getByRole('button', { name: 'المبلغ', exact: true }).click();
    await expect(page.getByRole('columnheader', { name: 'المبلغ', exact: true })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
    expect(await readAmounts()).toEqual([...amounts].sort((a, b) => a - b));
    await open('refunds');
    await page.getByRole('button', { name: 'إنشاء مبلغ معاد', exact: true }).first().click();
    await page.getByRole('textbox', { name: 'سبب الإعادة', exact: true }).fill('سبب إعادة توضيحي');
    await confirm();
    await expect(
      page.getByText('سبب إعادة توضيحي', { exact: true }).filter({ visible: true }).first(),
    ).toBeVisible();
    await open('decisions');
    await page.getByRole('button', { name: 'تسجيل قرار', exact: true }).first().click();
    await page.getByRole('textbox', { name: 'النص', exact: true }).fill('قرار اختبار محلي');
    await confirm();
    await expect(page.getByText('قرار اختبار محلي', { exact: true })).toBeVisible();
    await open('overview');
    await page.locator('app-page-header app-action-menu button').click();
    await page
      .getByRole('menuitem', { name: 'طلب استكمال البيانات والوثائق', exact: true })
      .click();
    await page
      .getByRole('textbox', { name: 'البيانات والوثائق المطلوب استكمالها', exact: true })
      .fill('يرجى استكمال الوثيقة التوضيحية');
    await confirm();
    await expect(page.getByText('بانتظار الاستكمال', { exact: true }).first()).toBeVisible();
    await page.addInitScript(() => {
      window.print = () => {
        document.body.dataset['printed'] = 'true';
      };
    });
    await open('output');
    await page.getByRole('button', { name: 'معاينة', exact: true }).first().click();
    await expect(page.getByRole('dialog')).toContainText('معاينة توضيحية — ليست وثيقة رسمية');
    await choose(page, 'قالب المخرج', 'بيان الرسوم');
    await page.getByRole('button', { name: 'طباعة المعاينة الحالية', exact: true }).click();
    await expect(page.locator('body')).toHaveAttribute('data-printed', 'true');
    await page.keyboard.press('Escape');
  });
async function choose(page: Page, label: string, value?: string) {
  await page.getByRole('combobox', { name: label, exact: true }).click();
  const options = page.getByRole('listbox').getByRole('option');
  await (value ? options.filter({ hasText: value }).first() : options.first()).click();
}
