import { expect, test } from '@playwright/test';
import { workspaceApps } from '../../scripts/workspace-apps.mjs';
import AxeBuilder from '@axe-core/playwright';

const app = workspaceApps().find((app) => app.id === 'layal-center');
if (app) {
  const origin = `http://127.0.0.1:${process.env['E2E_PRODUCTION'] ? app.previewPort : app.devPort}`;
  const base = `${origin}/centers/${app.id}`;
  for (const shell of ['sidebar', 'navbar']) {
    for (const width of [390, 768, 1280, 1536]) {
      test(`nested center navigation ${shell} ${width}`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        await page.setViewportSize({ width, height: 900 });
        await page.addInitScript((value) => localStorage.setItem('shell', value), shell);
        await page.goto(base + '/inbox/personal');
        await expect(page.locator('main > app-loading')).toHaveCount(0);
        await expect(page.locator('h1')).toBeVisible();
        const mobile = width < 1024;
        if (mobile) await page.getByRole('button', { name: 'فتح التنقل', exact: true }).click();
        const nav = page.locator('nav[aria-label="التنقل الرئيسي"]:visible');
        await expect(
          nav.getByRole('link', { name: 'Aurora', exact: true }).locator('[data-navigation-icon]'),
        ).toHaveAttribute('data-navigation-icon', 'phosphorFileText');
        const group = nav.getByRole('button', { name: 'المعاملات', exact: true });
        await expect(group.locator('[data-navigation-icon]').first()).toHaveAttribute(
          'data-navigation-icon',
          'phosphorTreeStructure',
        );
        if (shell === 'sidebar' || mobile) {
          await expect(group).toHaveAttribute('aria-expanded', 'true');
          await group.click();
          await expect(group).toHaveAttribute('aria-expanded', 'false');
          await group.focus();
          await page.keyboard.press('Enter');
          const link = nav.getByRole('link', { name: /معاملاتي/ });
          await expect(link).toHaveAttribute('aria-current', 'page');
          await expect(link.locator('[data-navigation-icon]')).toHaveAttribute(
            'data-navigation-icon',
            'phosphorArrowLeft',
          );
          await nav.getByRole('button', { name: 'المتابعة', exact: true }).click();
          await nav.getByRole('link', { name: 'التقارير', exact: true }).click();
        } else {
          await group.focus();
          await page.keyboard.press('ArrowDown');
          const menu = page.getByRole('menu', { name: 'المعاملات', exact: true });
          await expect(menu).toBeVisible();
          await expect(menu.getByRole('menuitem').first()).toBeFocused();
          await expect(
            menu.getByRole('menuitem', { name: /معاملاتي/ }).locator('[data-navigation-icon]'),
          ).toHaveAttribute('data-navigation-icon', 'phosphorArrowLeft');
          await page.keyboard.press('Escape');
          await expect(group).toBeFocused();
          await group.click();
          const nested = menu.getByRole('menuitem', { name: 'المتابعة', exact: true });
          await nested.focus();
          await page.keyboard.press('ArrowLeft');
          const submenu = page.getByRole('menu', { name: 'المتابعة', exact: true });
          await expect(submenu).toBeVisible();
          await expect(submenu.getByRole('menuitem').first()).toBeFocused();
          await page.keyboard.press('Enter');
          await expect(page.getByRole('menu')).toHaveCount(0);
        }
        await expect(page).toHaveURL(base + '/reports');
        if (mobile) await expect(page.getByRole('dialog')).toHaveCount(0);
        await expect(page.locator('header').first()).toContainText('التقارير');
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
        ).toBe(false);
        expect(errors).toEqual([]);
      });
    }
  }

  test('collapsed sidebar groups open an RTL menu and navigate by keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(base + '/inbox/personal');
    await expect(page.locator('h1')).toBeVisible();
    await page.getByRole('button', { name: 'طي الشريط', exact: true }).click();
    const group = page.locator('aside').getByRole('button', { name: 'المعاملات', exact: true });
    await group.focus();
    await page.keyboard.press('ArrowDown');
    const menu = page.getByRole('menu', { name: 'المعاملات', exact: true });
    await expect(menu).toBeVisible();
    const box = (await menu.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1280);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Space');
    await expect(page).toHaveURL(base + '/inbox/group');
    await expect(page.getByRole('menu')).toHaveCount(0);
  });

  test('center navigation disclosures and menu overlays expose accessible controls', async ({
    page,
  }) => {
    for (const shell of ['sidebar', 'navbar']) {
      await page.setViewportSize({ width: 1536, height: 900 });
      await page.addInitScript((value) => localStorage.setItem('shell', value), shell);
      await page.goto(base + '/inbox/personal');
      await expect(page.locator('h1')).toBeVisible();
      if (shell === 'navbar') {
        await page.getByRole('button', { name: 'المعاملات', exact: true }).click();
        await expect(page.getByRole('menu', { name: 'المعاملات', exact: true })).toBeVisible();
      }
      const results = await new AxeBuilder({ page })
        .include('app-center-navigation')
        .include('.cdk-overlay-container')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        results.violations.map((violation) => ({
          id: violation.id,
          nodes: violation.nodes.map((node) => node.target),
        })),
      ).toEqual([]);
    }
  });
}
