import { expect, it } from 'vitest';
import {
  activeNavLink,
  defaultCenterNavigation,
  navItemActive,
  navigationIcons,
  resolveNavigation,
  validateNavigation,
  type CenterNavItem,
} from '../../packages/core/src/navigation';

const items: CenterNavItem[] = [
  { kind: 'link', id: 'home', label: 'الرئيسية', path: '' },
  { kind: 'link', id: 'standalone', label: 'صفحة', path: 'page' },
  {
    kind: 'group',
    id: 'work',
    label: 'العمل',
    children: [
      { kind: 'link', id: 'mine', label: 'معاملاتي', path: 'inbox/personal' },
      {
        kind: 'group',
        id: 'more',
        label: 'المزيد',
        icon: 'phosphorFiles',
        children: [
          {
            kind: 'link',
            id: 'reports',
            label: 'التقارير',
            path: 'reports',
            icon: 'phosphorChartBar',
          },
        ],
      },
    ],
  },
];
it('resolves different default icons for independent pages, groups and nested links', () => {
  validateNavigation(items);
  const resolved = resolveNavigation(items);
  expect(resolved[1].icon).toBe(navigationIcons.page);
  const group = resolved[2];
  expect(group.icon).toBe(navigationIcons.group);
  if (group.kind !== 'group') throw new Error('Expected group');
  expect(group.children[0].icon).toBe(navigationIcons.child);
  const nested = group.children[1];
  expect(nested.icon).toBe('phosphorFiles');
  if (nested.kind !== 'group') throw new Error('Expected nested group');
  expect(nested.children[0].icon).toBe('phosphorChartBar');
  expect(items[1].icon).toBeUndefined();
});
it('matches descendants and breadcrumbs without matching partial path names or query parameters', () => {
  const resolved = resolveNavigation(items);
  expect(navItemActive(resolved[0], 'inbox/personal')).toBe(false);
  expect(navItemActive(resolved[2], 'inbox/personal?sort=id#header')).toBe(true);
  expect(navItemActive(resolved[2], 'inbox/personality')).toBe(false);
  expect(activeNavLink(resolved, 'reports/2026')?.label).toBe('التقارير');
  expect(activeNavLink(resolved, 'missing')).toBeUndefined();
});
it('keeps the original default destinations, badges and labeled extension links', () => {
  const fallback = defaultCenterNavigation([
    { path: 'private' },
    { path: 'extra', label: 'إضافية' },
  ]);
  expect(fallback).toHaveLength(6);
  expect(fallback[1]).toMatchObject({ path: 'inbox/personal', badge: 'personal' });
  expect(fallback[2]).toMatchObject({ path: 'inbox/group', badge: 'group' });
  expect(resolveNavigation(fallback).at(-1)).toMatchObject({
    path: 'extra',
    icon: navigationIcons.page,
  });
  validateNavigation([]);
});
it('rejects ambiguous IDs, empty groups, missing labels and links outside the center', () => {
  for (const path of [
    '/centers/foreign',
    '../outside',
    'inbox/../outside',
    'https://example.com',
    'inbox?center=other',
  ])
    expect(() =>
      validateNavigation([{ kind: 'link', id: 'invalid', label: 'رابط', path }]),
    ).toThrow();
  expect(() => validateNavigation([items[0], items[0]])).toThrow('duplicate');
  expect(() =>
    validateNavigation([{ kind: 'group', id: 'empty', label: 'مجموعة', children: [] }]),
  ).toThrow('Empty');
  expect(() => validateNavigation([{ kind: 'link', id: 'blank', label: ' ', path: '' }])).toThrow(
    'labels',
  );
  const cycle: CenterNavItem = { kind: 'group', id: 'cycle', label: 'مجموعة', children: [] };
  cycle.children = [cycle];
  expect(() => validateNavigation([cycle])).toThrow('duplicate');
});
