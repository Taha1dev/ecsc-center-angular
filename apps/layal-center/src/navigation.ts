import type { CenterNavItem } from '@workspace/core';

export const navigation: CenterNavItem[] = [
  { kind: 'link', id: 'home', label: 'الرئيسية', path: '', icon: 'phosphorHouse' },
  {
    kind: 'link',
    id: 'api-examples',
    label: 'تجربة API',
    path: 'api-examples',
    icon: 'phosphorLightning',
  },
  { kind: 'link', id: 'aurora', label: 'Aurora', path: 'aurora' },
  { kind: 'link', id: 'about', label: 'عن المركز', path: 'about' },
  { kind: 'link', id: 'team', label: 'فريق العمل', path: 'team', icon: 'phosphorUsers' },
  {
    kind: 'group',
    id: 'center-guide',
    label: 'دليل المركز',
    children: [
      { kind: 'link', id: 'faq', label: 'الأسئلة الشائعة', path: 'guide/faq' },
      {
        kind: 'link',
        id: 'contact',
        label: 'التواصل',
        path: 'guide/contact',
        icon: 'phosphorUserCircleDashed',
      },
    ],
  },
  {
    kind: 'group',
    id: 'transactions',
    label: 'المعاملات',
    children: [
      {
        kind: 'link',
        id: 'personal-inbox',
        label: 'معاملاتي',
        path: 'inbox/personal',
        badge: 'personal',
      },
      {
        kind: 'link',
        id: 'group-inbox',
        label: 'معاملات المجموعة',
        path: 'inbox/group',
        badge: 'group',
      },
      {
        kind: 'group',
        id: 'follow-up',
        label: 'المتابعة',
        children: [{ kind: 'link', id: 'reports', label: 'التقارير', path: 'reports' }],
      },
    ],
  },
  {
    kind: 'link',
    id: 'design-system',
    label: 'نظام التصميم',
    path: 'design-system',
    icon: 'phosphorSquaresFour',
  },
  {
    kind: 'link',
    id: 'deasign-system',
    label: ' التصميم',
    path: 'design-system',
    icon: 'phosphorSquaresFour',
  },
  {
    kind: 'link',
    id: 'dessign-system',
    label: 'نظام ',
    path: 'design-system',
    icon: 'phosphorSquaresFour',
  },
];
