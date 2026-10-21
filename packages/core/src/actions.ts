import { availability, mergeRegistry, type ActionId, type Transaction } from '@workspace/domain';
import type { MenuAction } from '@workspace/ui';
import { defaultActions, type CenterModule } from './module';
const groups = {
  view: { id: 'view', label: 'العرض والتفاصيل', order: 0 },
  processing: { id: 'processing', label: 'المعالجة', order: 1 },
  extra: { id: 'extra', label: 'إجراءات إضافية', order: 2 },
};
const presentation: Partial<Record<ActionId, Pick<MenuAction, 'group' | 'intent'>>> = {
  claim: { group: groups.processing, intent: 'neutral' },
  status: { group: groups.processing, intent: 'neutral' },
  transfer: { group: groups.processing, intent: 'warning' },
  completion: { group: groups.processing, intent: 'warning' },
  payment: { group: groups.extra, intent: 'warning' },
  refund: { group: groups.extra, intent: 'warning' },
  decision: { group: groups.processing, intent: 'neutral' },
  note: { group: groups.extra, intent: 'neutral' },
  applicant: { group: groups.processing, intent: 'neutral' },
  field: { group: groups.processing, intent: 'neutral' },
  fee: { group: groups.extra, intent: 'warning' },
  document: { group: groups.extra, intent: 'neutral' },
  print: { group: groups.view, intent: 'neutral' },
  activity: { group: groups.view, intent: 'neutral' },
};
export function transactionActions(
  module: CenterModule,
  t: Transaction,
  open: (action: ActionId) => void,
) {
  return mergeRegistry(defaultActions, module.actions)
    .filter((a) => availability(a.id, t, module.catalog, module.capabilities).visible)
    .map((a) => {
      const state = availability(a.id, t, module.catalog, module.capabilities);
      return {
        ...a,
        ...presentation[a.id],
        disabled: !state.enabled,
        reason: state.enabled ? undefined : state.reason,
        onSelect: () => open(a.id),
      };
    });
}
