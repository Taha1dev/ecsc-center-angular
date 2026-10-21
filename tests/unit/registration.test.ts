import '@angular/compiler';
import { Component } from '@angular/core';
import { createFixtures, createMemoryAdapter, createReports } from '@workspace/data-access';
import { expect, it } from 'vitest';
import { catalog, demo } from '../../apps/ecsc/src/config/services';
import { centerRoutes } from '../../packages/core/src/bootstrap';
import { defineActionForm, defineCenter, type CenterModule } from '../../packages/core/src/module';
@Component({ selector: 'test-extension', template: '<p>اختبار التسجيل</p>' })
class Extension {}
const make = (): CenterModule =>
  defineCenter({
    profile: {
      id: 'new-center',
      name: 'مركز اختبار',
      logo: '/logo.png',
      favicon: '/favicon.png',
      source: '',
      loginPattern: '',
      patternKind: 'stars',
    },
    catalog,
    demo,
    reports: createReports(catalog, [
      { title: 'تقرير اختبار أول', aliases: [] },
      { title: 'تقرير اختبار ثان', aliases: [] },
    ]),
    adapter: createMemoryAdapter({
      centerId: 'new-center',
      catalog,
      createRecords: () => createFixtures('new-center', catalog, demo),
      snapshot: demo.snapshot,
      accounts: [],
      reports: createReports(catalog, [
        { title: 'تقرير اختبار أول', aliases: [] },
        { title: 'تقرير اختبار ثان', aliases: [] },
      ]),
    }),
  });
it('registers extra routes and replaces pages without importing application code into core', () => {
  const module = make();
  module.routes = [{ path: 'extension', label: 'صفحة إضافية', component: Extension }];
  module.pages = { dashboard: Extension, reports: Extension };
  const routes = centerRoutes(defineCenter(module));
  const workspace = routes.find((r) => r.path === 'centers/new-center')!;
  expect(workspace.children?.find((r) => r.path === 'extension')?.component).toBe(Extension);
  expect(workspace.children?.find((r) => r.path === '')?.component).toBe(Extension);
  expect(workspace.children?.find((r) => r.path === 'reports')?.component).toBe(Extension);
  expect(workspace.children?.find((r) => r.path === 'transactions/:id')?.loadComponent).toBeTypeOf(
    'function',
  );
});
it('registers owned section and action-form replacements with typed command builders', () => {
  const module = make();
  const form = defineActionForm({
    id: 'note',
    action: 'note',
    component: Extension,
    parse: (context) => context.text,
    command: (text) => ({ type: 'note', text }),
  });
  module.sections = {
    override: [
      {
        id: 'fields',
        title: 'حقول خاصة',
        group: 'بيانات الطلب',
        view: 'fields',
        actions: ['field'],
        component: Extension,
      },
    ],
  };
  module.actionForms = { override: [form] };
  expect(defineCenter(module).sections?.override?.[0].component).toBe(Extension);
  expect(form.buildCommand).toBeTypeOf('function');
});
