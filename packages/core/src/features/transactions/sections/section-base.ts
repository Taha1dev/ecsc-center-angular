import { DestroyRef, Directive, inject, input } from '@angular/core';
import { date, money, userMessage, type Person, type Transaction } from '@workspace/domain';
import { ToastService, type MenuAction, type TableColumn } from '@workspace/ui';
import { CENTER_MODULE, type SectionContext } from '../../../module';
@Directive()
export abstract class SectionBase {
  readonly destroyRef = inject(DestroyRef);
  readonly context = input.required<SectionContext>();
  readonly module = inject(CENTER_MODULE);
  readonly toast = inject(ToastService);
  readonly money = money;
  readonly date = date;
  readonly getId = (row: { id: string }) => row.id;
  get t() {
    return this.context().t;
  }
  get total() {
    return this.t.fees.reduce((s, f) => s + f.amount, 0);
  }
  get paid() {
    return this.t.payments.filter((p) => p.paid).reduce((s, p) => s + p.amount, 0);
  }
  open(action: Parameters<SectionContext['open']>[0], id?: string, title?: string) {
    this.context().open(action, id, title);
  }
  inspect(kind: Parameters<SectionContext['inspect']>[0], id: string) {
    this.context().inspect(kind, id);
  }
  readonly personColumns: TableColumn<Person>[] = [
    { id: 'name', label: 'الاسم', value: (p) => p.name },
    { id: 'kind', label: 'الصفة', value: (p) => p.kind },
    { id: 'identifier', label: 'رقم الإثبات / المرجع', value: (p) => p.identifier || 'غير متوفر' },
    { id: 'phone', label: 'الهاتف', value: (p) => p.phone || 'غير متوفر' },
  ];
  readonly applicantColumns: TableColumn<Person>[] = [
    ...this.personColumns,
    {
      id: 'lead',
      label: 'مقدم الطلب',
      value: (p) => p.lead,
      badge: (p) => ({
        label: p.lead ? 'رئيسي' : 'مرافق / ممثل',
        intent: p.lead ? 'info' : 'neutral',
      }),
    },
  ];
  readonly personActions = (p: Person): MenuAction[] => [
    {
      id: 'edit',
      label: 'تعديل بيانات الشخص',
      icon: 'phosphorPencilSimple',
      group: { id: 'processing', label: 'المعالجة' },
      onSelect: () => this.open('applicant', p.id),
    },
  ];
  readonly partyActions = (p: Person): MenuAction[] => [
    {
      id: 'view',
      label: 'عرض الطرف المرتبط',
      icon: 'phosphorEye',
      group: { id: 'view', label: 'العرض والتفاصيل' },
      onSelect: () => this.inspect('party', p.id),
    },
  ];
  readonly documentColumns: TableColumn<Transaction['documents'][number]>[] = [
    { id: 'name', label: 'اسم الملف', value: (d) => d.name },
    { id: 'type', label: 'النوع', value: (d) => d.type },
    { id: 'size', label: 'الحجم', value: (d) => d.size },
  ];
  readonly documentActions = (d: Transaction['documents'][number]): MenuAction[] => [
    {
      id: 'preview',
      label: 'معاينة توضيحية',
      icon: 'phosphorEye',
      group: { id: 'view', label: 'العرض والتفاصيل' },
      onSelect: () => this.inspect('document', d.id),
    },
    {
      id: 'info',
      label: 'عرض معلومات المرفق',
      icon: 'phosphorInfo',
      group: { id: 'view', label: 'العرض والتفاصيل' },
      onSelect: () => this.inspect('document', d.id),
    },
  ];
  readonly paymentColumns: TableColumn<Transaction['payments'][number]>[] = [
    { id: 'id', label: 'رقم الدفعة', value: (p) => p.id },
    { id: 'label', label: 'النوع', value: (p) => p.label },
    { id: 'amount', label: 'المبلغ', value: (p) => money(p.amount), sortValue: (p) => p.amount },
    { id: 'method', label: 'الطريقة', value: (p) => p.method },
    {
      id: 'paid',
      label: 'الحالة',
      value: (p) => p.paid,
      badge: (p) => ({
        label: p.paid ? 'مدفوعة' : 'بانتظار الدفع',
        intent: p.paid ? 'success' : 'warning',
      }),
    },
  ];
  readonly paymentActions = (p: Transaction['payments'][number]): MenuAction[] => [
    {
      id: 'toggle',
      label: p.paid ? 'إلغاء التأكيد المحلي' : 'تأكيد الدفع محلياً',
      icon: 'phosphorCheckCircle',
      onSelect: () => this.open('payment', p.id),
    },
  ];
  readonly feeColumns: TableColumn<Transaction['fees'][number]>[] = [
    { id: 'label', label: 'الرسم', value: (f) => f.label },
    { id: 'amount', label: 'المبلغ', value: (f) => money(f.amount), sortValue: (f) => f.amount },
  ];
  readonly feeActions = (f: Transaction['fees'][number]): MenuAction[] => [
    {
      id: 'edit',
      label: 'تعديل الرسم',
      icon: 'phosphorPencilSimple',
      onSelect: () => this.open('fee', f.id),
    },
  ];
  readonly refundColumns: TableColumn<Transaction['refunds'][number]>[] = [
    { id: 'id', label: 'المرجع', value: (r) => r.id },
    { id: 'amount', label: 'المبلغ', value: (r) => money(r.amount), sortValue: (r) => r.amount },
    { id: 'reason', label: 'السبب', value: (r) => r.reason },
    {
      id: 'approved',
      label: 'الحالة',
      badge: (r) => ({
        label: r.approved ? 'مقبول' : 'بانتظار الموافقة',
        intent: r.approved ? 'success' : 'warning',
      }),
      value: (r) => r.approved,
    },
  ];
  readonly refundActions = (r: Transaction['refunds'][number]): MenuAction[] => [
    {
      id: 'inspect',
      label: 'عرض طلب الإعادة',
      icon: 'phosphorEye',
      group: { id: 'view', label: 'العرض والتفاصيل' },
      onSelect: () => this.inspect('refund', r.id),
    },
  ];
  noteActions(n: Transaction['notes'][number]): MenuAction[] {
    return [
      {
        id: 'edit',
        label: 'تعديل الملاحظة',
        icon: 'phosphorPencilSimple',
        group: { id: 'processing', label: 'المعالجة' },
        onSelect: () => this.open('note', n.id),
      },
      {
        id: 'resolve',
        label: n.resolved ? 'إعادة فتح الملاحظة' : 'حل الملاحظة',
        icon: 'phosphorCheckCircle',
        group: { id: 'processing', label: 'المعالجة' },
        onSelect: () => {
          void this.context()
            .execute({ type: 'resolve-note', noteId: n.id })
            .catch((e) => this.toast.show(userMessage(e, 'تعذر تحديث المعاملة'), true));
        },
      },
    ];
  }
  decisionActions(id: string): MenuAction[] {
    return [
      {
        id: 'view',
        label: 'عرض القرار',
        icon: 'phosphorEye',
        onSelect: () => this.inspect('decision', id),
      },
    ];
  }
}
