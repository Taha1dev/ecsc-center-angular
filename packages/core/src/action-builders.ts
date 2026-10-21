import type { ActionId, Transaction, TransactionCommand } from '@workspace/domain';
import { lifecycle } from '@workspace/domain';
import type { ActionFormContext } from './module';
function serial(t: Transaction, prefix: string, length: number) {
  return `${prefix}-${t.id}-local-${length + 1}`;
}
export const builders: Partial<Record<ActionId, (c: ActionFormContext) => TransactionCommand>> = {
  claim: () => ({ type: 'claim' }),
  status: (c) => {
    const status = lifecycle.find((s) => s === c.selection);
    if (!status) throw new Error('حالة غير صالحة');
    return { type: 'status', status };
  },
  transfer: (c) => ({ type: 'transfer', employeeId: c.selection }),
  completion: (c) => ({ type: 'completion', text: c.text }),
  applicant: (c) => {
    const kind = c.selection;
    if (kind !== 'فرد' && kind !== 'شركة' && kind !== 'جهة') throw new Error('نوع غير صالح');
    return {
      type: 'applicant',
      person: {
        id: c.targetPerson?.id ?? serial(c.t, 'person', c.t.people.length),
        name: c.text,
        identifier: c.identifier,
        kind,
        phone: c.targetPerson?.phone,
      },
    };
  },
  field: (c) => ({ type: 'field', fieldId: c.selection, input: c.text }),
  document: (c) => {
    if (!c.file) throw new Error('اختر ملفاً محلياً أولاً');
    return {
      type: 'document',
      document: {
        id: serial(c.t, 'doc', c.t.documents.length),
        name: c.file.name,
        type: c.file.type || 'ملف محلي',
        size: `${Math.ceil(c.file.size / 1024)} ك.ب`,
      },
      requirementId: c.flow.targetId,
    };
  },
  payment: (c) =>
    c.targetPayment
      ? { type: 'toggle-payment', paymentId: c.targetPayment.id }
      : {
          type: 'payment',
          payment: {
            id: serial(c.t, 'payment', c.t.payments.length),
            label: c.selection,
            amount: Number(c.amount),
            paid: false,
            method: 'محاكاة محلية',
          },
        },
  fee: (c) => ({ type: 'fee', feeId: c.selection, amount: Number(c.amount) }),
  refund: (c) => ({ type: 'refund', amount: Number(c.amount), reason: c.text }),
  decision: (c) => ({ type: 'decision', text: c.text }),
  note: (c) => ({ type: 'note', text: c.text, noteId: c.targetNote?.id }),
};
