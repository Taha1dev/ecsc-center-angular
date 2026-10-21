import type { Transaction } from '@workspace/domain';
import { statuses } from '@workspace/domain';
import type { ExportDataset } from '@workspace/ui';
export type FinancialGroup = {
  id: string;
  count: number;
  fees: number;
  paid: number;
  refunded: number;
};
export function reportExport(
  title: string,
  kind: string,
  rows: Transaction[],
  groups: FinancialGroup[],
  paymentType?: string,
): ExportDataset {
  if (groups.length)
    return {
      title,
      units: 'عدد المعاملات؛ المبالغ بالليرة السورية',
      headers: ['المجموعة', 'المعاملات', 'الرسوم', 'المدفوع', 'المعاد'],
      rows: groups.map((g) => [g.id, g.count, g.fees, g.paid, g.refunded]),
    };
  if (kind === 'people')
    return {
      title,
      units: 'مستفيدون فريدون',
      headers: ['المستفيد', 'رقم الإثبات', 'الهاتف', 'الخدمة'],
      rows: rows.map((t) => [
        t.applicant,
        t.people[0].identifier,
        t.people[0].phone || 'غير متوفر',
        t.type,
      ]),
    };
  const financial = kind === 'fees';
  return {
    title,
    units: financial ? 'معاملات؛ المبالغ بالليرة السورية' : 'عدد المعاملات',
    headers: [
      'المعاملة',
      'مقدم الطلب',
      'نوع الخدمة',
      'الحالة',
      ...(financial ? ['الرسوم', 'المدفوع', 'المعاد'] : []),
    ],
    rows: rows.map((t) => [
      t.id,
      t.applicant,
      t.type,
      statuses[t.status].label,
      ...(financial
        ? [
            t.fees.reduce((sum, f) => sum + f.amount, 0),
            t.payments
              .filter(
                (p) => p.paid && (!paymentType || paymentType === 'all' || p.label === paymentType),
              )
              .reduce((sum, p) => sum + p.amount, 0),
            t.refunds.reduce((sum, r) => sum + r.amount, 0),
          ]
        : []),
    ]),
  };
}
