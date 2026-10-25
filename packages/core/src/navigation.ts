export type CenterNavItem = {
  id: string;
  label: string;
  icon?: string;
} & (
  | { kind: 'link'; path: string; exact?: boolean; badge?: 'personal' | 'group' }
  | { kind: 'group'; children: readonly CenterNavItem[] }
);

export type ResolvedNavItem = {
  id: string;
  label: string;
  icon: string;
} & (
  | { kind: 'link'; path: string; exact?: boolean; badge?: 'personal' | 'group' }
  | { kind: 'group'; children: readonly ResolvedNavItem[] }
);

export const navigationIcons = {
  page: 'phosphorFileText',
  group: 'phosphorTreeStructure',
  child: 'phosphorArrowLeft',
} as const;

export function validateNavigation(items: readonly CenterNavItem[]) {
  const ids = new Set<string>();
  const visit = (entries: readonly CenterNavItem[]) => {
    for (const item of entries) {
      if (!/^[a-z0-9][a-z0-9-]*$/.test(item.id) || ids.has(item.id))
        throw new Error(`Invalid or duplicate navigation ID: ${item.id}`);
      ids.add(item.id);
      if (!item.label.trim()) throw new Error('Navigation labels cannot be empty');
      if (item.kind === 'group') {
        if (!item.children.length) throw new Error(`Empty navigation group: ${item.id}`);
        visit(item.children);
      } else if (item.kind === 'link') {
        if (
          item.path.startsWith('/') ||
          /[\\?#:]|(^|\/)(?:\.|\.\.)(\/|$)/.test(item.path) ||
          item.path.includes('%')
        )
          throw new Error(`Navigation links must be center-relative paths: ${item.path}`);
      } else throw new Error('Unknown navigation item kind');
    }
  };
  visit(items);
}

export function resolveNavigation(items: readonly CenterNavItem[], depth = 0): ResolvedNavItem[] {
  return items.map((item) =>
    item.kind === 'group'
      ? {
          ...item,
          icon: item.icon || navigationIcons.group,
          children: resolveNavigation(item.children, depth + 1),
        }
      : { ...item, icon: item.icon || (depth ? navigationIcons.child : navigationIcons.page) },
  );
}

export function defaultCenterNavigation(
  routes: readonly { path: string; label?: string; icon?: string }[] = [],
): CenterNavItem[] {
  return [
    { kind: 'link', id: 'home', path: '', label: 'الرئيسية', icon: 'phosphorHouse' },
    {
      kind: 'link',
      id: 'personal-inbox',
      path: 'inbox/personal',
      label: 'بريد المستخدم',
      icon: 'phosphorTray',
      badge: 'personal',
    },
    {
      kind: 'link',
      id: 'group-inbox',
      path: 'inbox/group',
      label: 'بريد المجموعة',
      icon: 'phosphorUsers',
      badge: 'group',
    },
    { kind: 'link', id: 'reports', path: 'reports', label: 'التقارير', icon: 'phosphorChartBar' },
    {
      kind: 'link',
      id: 'design-system',
      path: 'design-system',
      label: 'نظام التصميم',
      icon: 'phosphorSquaresFour',
    },
    ...routes
      .filter((r) => r.label)
      .map((r, index): CenterNavItem => ({
        kind: 'link',
        id: `extension-${index}`,
        path: r.path,
        label: r.label!,
        icon: r.icon,
      })),
  ];
}

export function navLinkActive(
  item: Extract<ResolvedNavItem, { kind: 'link' }>,
  current: string,
): boolean {
  const pathname = current.split(/[?#]/)[0].replace(/\/$/, '');
  return (
    pathname === item.path || (!(item.exact ?? !item.path) && pathname.startsWith(item.path + '/'))
  );
}

export function navItemActive(item: ResolvedNavItem, current: string): boolean {
  return item.kind === 'link'
    ? navLinkActive(item, current)
    : item.children.some((child) => navItemActive(child, current));
}

export function activeNavLink(
  items: readonly ResolvedNavItem[],
  current: string,
): Extract<ResolvedNavItem, { kind: 'link' }> | undefined {
  const links = items.flatMap((item) =>
    item.kind === 'link' ? [item] : flattenLinks(item.children),
  );
  return links
    .filter((item) => navLinkActive(item, current))
    .sort((a, b) => b.path.length - a.path.length)[0];
}

function flattenLinks(
  items: readonly ResolvedNavItem[],
): Extract<ResolvedNavItem, { kind: 'link' }>[] {
  return items.flatMap((item) => (item.kind === 'link' ? [item] : flattenLinks(item.children)));
}
