import { InjectionToken, makeEnvironmentProviders, type Type } from '@angular/core';

import { CENTER_DATA_CONFIG, type CenterDataAdapter } from '@workspace/data-access';
import {
  validateCenterDefinition,
  type ActionId,
  type Capabilities,
  type DemoDefinition,
  type FilterField,
  type Person,
  type RegistryChanges,
  type ReportDefinition,
  type ServiceCatalog,
  type ServiceDefinition,
  type Transaction,
  type TransactionCommand,
  type TransactionSectionDefinition,
} from '@workspace/domain';
import type { TableColumn } from '@workspace/ui';
import { validateNavigation, type CenterNavItem } from './navigation';
export type CenterProfile = {
  id: string;
  name: string;
  logo: string;
  source: string;
  favicon: string;
  loginPattern: string;
  patternKind: 'circuit' | 'stars';
  loginLogoSize?: 'standard' | 'wide';
};
export type Flow = { action: ActionId; targetId?: string; title?: string; formId?: string };

export type SectionContext = {
  t: Transaction;
  service: ServiceDefinition;
  center: CenterProfile;
  open: (action: ActionId, targetId?: string, title?: string) => void;
  inspect: (kind: 'party' | 'document' | 'refund' | 'decision', id: string) => void;
  navigate: (section: string) => void;
  execute: (command: TransactionCommand) => Promise<void>;
};

export type SectionEntry = TransactionSectionDefinition & {
  component: Type<unknown>;
  order?: number;
  icon?: string;
  visible?: (t: Transaction, s: ServiceDefinition) => boolean;
  count?: (t: Transaction) => string | undefined;
};
export type ActionFormContext = {
  t: Transaction;
  center: CenterProfile;
  catalog: ServiceCatalog;
  flow: Flow;
  text: string;
  selection: string;
  identifier: string;
  amount: string;
  file: File | null;
  format: string;
  targetPerson?: Person;
  targetField?: Transaction['fields'][number];
  targetFee?: Transaction['fees'][number];
  targetNote?: Transaction['notes'][number];
  targetPayment?: Transaction['payments'][number];
};
export type ActionCustomization = {
  id: string;
  action: ActionId;
  component?: Type<unknown>;
  buildCommand?: (context: ActionFormContext) => TransactionCommand;
};
export type ActionPresentation = {
  id: ActionId;
  label: string;
  icon: string;
  placement: 'primary' | 'secondary' | 'menu';
  intent: 'neutral' | 'primary' | 'warning' | 'danger';
  target: 'dialog' | 'sheet';
};
export type CenterRoute = {
  path: string;
  label?: string;
  icon?: string;
  component: Type<unknown>
};
export type CenterPages = Partial<
  Record<
    'login' | 'dashboard' | 'inbox' | 'transaction' | 'reports' | 'designSystem',
    Type<unknown>
  >
>;
export type InboxCustomization = {
  filters?: (defaults: FilterField[], draft: Readonly<Record<string, string>>) => FilterField[];
  columns?: (defaults: TableColumn<Transaction>[]) => TableColumn<Transaction>[];
  matches?: (transaction: Transaction, filters: Readonly<Record<string, string>>) => boolean;
};
export type CenterModule = {
  profile: CenterProfile;
  catalog: ServiceCatalog;
  demo: DemoDefinition;
  reports: ReportDefinition[];
  adapter: CenterDataAdapter;
  capabilities?: Capabilities;
  sections?: RegistryChanges<SectionEntry>;
  actions?: RegistryChanges<ActionPresentation>;
  actionForms?: RegistryChanges<ActionCustomization>;
  inbox?: InboxCustomization;
  routes?: CenterRoute[];
  pages?: CenterPages;
  navigation?: readonly CenterNavItem[];
};
export function defineCenter(module: CenterModule) {
  validateCenterDefinition(module);
  if (module.navigation) validateNavigation(module.navigation);
  return module;
}
export function defineActionForm<Input>({
  parse,
  command,
  ...entry
}: Omit<ActionCustomization, 'buildCommand'> & {
  parse: (context: ActionFormContext) => Input;
  command: (input: Input) => TransactionCommand;
}): ActionCustomization {
  return { ...entry, buildCommand: (context) => command(parse(context)) };
}
export const CENTER_MODULE = new InjectionToken<CenterModule>('CENTER_MODULE');
export function provideCenter(module: CenterModule) {
  return makeEnvironmentProviders([
    { provide: CENTER_MODULE, useValue: defineCenter(module) },
    { provide: CENTER_DATA_CONFIG, useValue: { adapter: module.adapter, catalog: module.catalog } },
  ]);
}
export const defaultActions: ActionPresentation[] = [
  {
    id: 'claim',
    label: 'استلام المعاملة',
    icon: 'phosphorCheckCircle',
    placement: 'primary',
    intent: 'primary',
    target: 'dialog',
  },
  {
    id: 'status',
    label: 'تحديث الحالة',
    icon: 'phosphorCheckCircle',
    placement: 'primary',
    intent: 'primary',
    target: 'dialog',
  },
  {
    id: 'transfer',
    label: 'تحويل المعاملة',
    icon: 'phosphorArrowsLeftRight',
    placement: 'secondary',
    intent: 'neutral',
    target: 'dialog',
  },
  {
    id: 'note',
    label: 'إضافة ملاحظة',
    icon: 'phosphorNotePencil',
    placement: 'secondary',
    intent: 'neutral',
    target: 'dialog',
  },
  {
    id: 'completion',
    label: 'طلب استكمال البيانات والوثائق',
    icon: 'phosphorWarningCircle',
    placement: 'menu',
    intent: 'warning',
    target: 'dialog',
  },
  {
    id: 'payment',
    label: 'إنشاء دفعة',
    icon: 'phosphorCurrencyCircleDollar',
    placement: 'menu',
    intent: 'neutral',
    target: 'dialog',
  },
  {
    id: 'decision',
    label: 'تسجيل قرار',
    icon: 'phosphorSealCheck',
    placement: 'menu',
    intent: 'neutral',
    target: 'dialog',
  },
  {
    id: 'print',
    label: 'معاينة المخرجات',
    icon: 'phosphorPrinter',
    placement: 'menu',
    intent: 'neutral',
    target: 'sheet',
  },
  {
    id: 'activity',
    label: 'عرض سجل النشاط',
    icon: 'phosphorClockCounterClockwise',
    placement: 'menu',
    intent: 'neutral',
    target: 'sheet',
  },
];
