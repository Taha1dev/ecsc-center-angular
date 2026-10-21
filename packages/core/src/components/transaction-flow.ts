import { NgComponentOutlet } from '@angular/common';
import { Component, computed, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CenterDataService } from '@workspace/data-access';
import {
  allowedTransitions,
  availability,
  money,
  statuses,
  userMessage,
  type ActionId,
  type Transaction,
} from '@workspace/domain';
import {
  AppActivityTimeline,
  AppDialog,
  AppField,
  AppKeyValues,
  AppPanel,
  AppStatusBadge,
  HlmButton,
  HlmInput,
  ToastService,
} from '@workspace/ui';
import { builders } from '../action-builders';
import { CENTER_MODULE, type ActionFormContext, type Flow } from '../module';
export const actionLabels: Record<ActionId, string> = {
  claim: 'استلام المعاملة',
  status: 'تحديث الحالة',
  completion: 'طلب استكمال',
  transfer: 'تحويل المعاملة',
  applicant: 'بيانات مقدم الطلب',
  field: 'تعديل حقول المعاملة',
  document: 'إضافة مرفق محلي',
  payment: 'إدارة الدفعة',
  fee: 'تعديل رسم توضيحي',
  refund: 'إنشاء مبلغ معاد',
  decision: 'تسجيل قرار',
  note: 'ملاحظة داخلية',
  print: 'معاينة المخرجات',
  activity: 'سجل النشاط',
};
@Component({
  selector: 'app-transaction-flow',
  imports: [
    NgComponentOutlet,
    ReactiveFormsModule,
    AppDialog,
    AppField,
    HlmInput,
    HlmButton,
    AppPanel,
    AppKeyValues,
    AppStatusBadge,
    AppActivityTimeline,
  ],
  templateUrl: './transaction-flow.html',
})
export class TransactionFlow implements OnInit {
  readonly destroyRef = inject(DestroyRef);
  readonly transaction = input.required<Transaction>();
  readonly flow = input.required<Flow>();
  readonly closed = output<void>();
  readonly module = inject(CENTER_MODULE);
  readonly center = this.module.profile;
  readonly catalog = this.module.catalog;
  readonly store = inject(CenterDataService);
  readonly toast = inject(ToastService);
  readonly money = money;
  readonly labels = actionLabels;
  readonly error = new FormControl('', { nonNullable: true });
  readonly form = new FormGroup({
    text: new FormControl('', { nonNullable: true }),
    selection: new FormControl('', { nonNullable: true }),
    identifier: new FormControl('', { nonNullable: true }),
    amount: new FormControl('10000', { nonNullable: true }),
    format: new FormControl('إيصال استلام', { nonNullable: true }),
  });
  readonly file = new FormControl<File | null>(null);
  readonly value = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  readonly fileValue = toSignal(this.file.valueChanges, { initialValue: null });
  readonly context = computed<ActionFormContext>(() => {
    this.value();
    return {
      ...this.form.getRawValue(),
      file: this.fileValue(),
      t: this.transaction(),
      center: this.center,
      catalog: this.catalog,
      flow: this.flow(),
      targetPerson: this.transaction().people.find((p) => p.id === this.flow().targetId),
      targetField: this.transaction().fields.find((p) => p.id === this.flow().targetId),
      targetFee: this.transaction().fees.find((p) => p.id === this.flow().targetId),
      targetNote: this.transaction().notes.find((p) => p.id === this.flow().targetId),
      targetPayment: this.transaction().payments.find((p) => p.id === this.flow().targetId),
    };
  });
  readonly preview = computed(
    () => this.flow().action === 'print' || this.flow().action === 'activity',
  );
  readonly available = computed(() =>
    availability(this.flow().action, this.transaction(), this.catalog, this.module.capabilities),
  );
  readonly selectedField = computed(() =>
    this.catalog.services
      .find((s) => s.id === this.transaction().serviceId)
      ?.fields.find((f) => f.id === this.value().selection),
  );
  readonly fields = computed(
    () =>
      this.catalog.services
        .find((s) => s.id === this.transaction().serviceId)
        ?.fields.map((f) => ({ value: f.id, label: f.label })) ?? [],
  );
  readonly custom = computed(
    () =>
      this.module.actionForms?.override?.find(
        (f) => f.id === (this.flow().formId ?? this.flow().action),
      ) ??
      this.module.actionForms?.add?.find(
        (f) => f.id === (this.flow().formId ?? this.flow().action),
      ),
  );
  readonly statusOptions = computed(() =>
    allowedTransitions(this.transaction(), this.catalog).map((value) => ({
      value,
      label: statuses[value].label,
    })),
  );
  readonly isCurrentEmployee = (employee: { id: string }) =>
    employee.id === this.catalog.currentEmployeeId;
  readonly employees = this.catalog.employees.map((e) => ({ value: e.id, label: e.label }));
  readonly peopleKinds = ['فرد', 'شركة', 'جهة'].map((value) => ({ value, label: value }));
  readonly paymentKinds = ['دفعة أولية', 'دفعة نهائية'].map((value) => ({ value, label: value }));
  readonly booleanOptions = [
    { value: 'true', label: 'نعم' },
    { value: 'false', label: 'لا' },
  ];
  readonly templates = ['إيصال استلام', 'ملخص المعاملة', 'بيان الرسوم'].map((value) => ({
    value,
    label: value,
  }));
  readonly fieldOptions = computed(() => {
    const f = this.selectedField();
    return f?.kind === 'select'
      ? f.options.map((o) => ({ value: o.id, label: o.label }))
      : this.booleanOptions;
  });
  readonly feeOptions = computed(() =>
    this.transaction().fees.map((f) => ({ value: f.id, label: f.label })),
  );
  readonly summary = computed(() => [
    { label: 'رقم المعاملة', value: this.transaction().id },
    { label: 'مقدم الطلب', value: this.transaction().applicant },
    { label: 'نوع الخدمة', value: this.transaction().type },
    { label: 'الحالة', value: statuses[this.transaction().status].label },
    {
      label: 'إجمالي الرسوم',
      value: money(this.transaction().fees.reduce((sum, fee) => sum + fee.amount, 0)),
    },
  ]);

  ngOnInit() {
    const t = this.transaction(),
      flow = this.flow(),
      p = t.people.find((p) => p.id === flow.targetId),
      f = t.fields.find((f) => f.id === flow.targetId),
      n = t.notes.find((n) => n.id === flow.targetId),
      fee = t.fees.find((f) => f.id === flow.targetId);
    this.form.setValue({
      text:
        n?.text ||
        p?.name ||
        (f ? String(t.serviceData.values.find((v) => v.id === f.id)?.value.value ?? '') : ''),
      selection:
        flow.action === 'status'
          ? t.status
          : flow.action === 'transfer'
            ? (this.catalog.employees[1]?.id ?? this.catalog.currentEmployeeId)
            : flow.action === 'payment'
              ? 'دفعة أولية'
              : flow.action === 'field'
                ? f?.id || t.fields[0]?.id || ''
                : flow.action === 'fee'
                  ? fee?.id || t.fees[0]?.id || ''
                  : p?.kind || 'فرد',
      identifier: p?.identifier || '',
      amount: String(fee?.amount || 10000),
      format: flow.title || 'إيصال استلام',
    });
    this.form.controls.selection.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => {
        if (flow.action === 'field')
          this.form.controls.text.setValue(
            String(t.serviceData.values.find((v) => v.id === id)?.value.value ?? ''),
          );
        if (flow.action === 'fee')
          this.form.controls.amount.setValue(String(t.fees.find((f) => f.id === id)?.amount || 0));
      });
  }
  print() {
    window.print();
  }
  chooseFile(event: Event) {
    this.file.setValue((event.target as HTMLInputElement).files?.[0] ?? null);
  }
  async save() {
    this.error.setValue('');
    try {
      const builder = this.custom()?.buildCommand ?? builders[this.flow().action];
      if (!builder) throw new Error('الإجراء غير متاح');
      await this.store.execute(this.transaction().id, builder(this.context()));
      this.toast.show('تم تحديث المعاملة محلياً في النسخة التجريبية');
      this.closed.emit();
    } catch (error) {
      this.error.setValue(userMessage(error, 'تعذر تحديث المعاملة'));
    }
  }
}
