import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CenterDataService } from '@workspace/data-access';
import {
  formatCalendarDate,
  money,
  normalize,
  rangeError,
  REFERENCE_DATE,
  statuses,
  type ReportDefinition,
  type Transaction,
} from '@workspace/domain';
import {
  AppCombobox,
  AppDataTable,
  AppEmptyState,
  AppEntityCard,
  AppField,
  AppIcon,
  AppKeyValues,
  AppLoading,
  AppPageHeader,
  AppPanel,
  AppStatusBadge,
  downloadDatasets,
  HlmButton,
  HlmInput,
  ToastService,
  type TableColumn,
} from '@workspace/ui';
import { DynamicFields } from '../../components/dynamic-fields/dynamic-fields';
import { reportExport, type FinancialGroup } from '../../lib/report-export';
import { CENTER_MODULE } from '../../module';
@Component({
  selector: 'app-reports',
  imports: [
    ReactiveFormsModule,
    AppPageHeader,
    AppEntityCard,
    AppPanel,
    AppField,
    AppCombobox,
    AppIcon,
    HlmButton,
    HlmInput,
    AppStatusBadge,
    AppDataTable,
    AppKeyValues,
    AppEmptyState,
    AppLoading,
    DynamicFields,
  ],
  templateUrl: './reports.html',
})
export class ReportsPage {
  readonly module = inject(CENTER_MODULE);
  readonly store = inject(CenterDataService);
  readonly toast = inject(ToastService);
  readonly chosen = signal<ReportDefinition | null>(null);
  readonly phase = signal<'parameters' | 'pending' | 'ready' | 'error'>('parameters');
  readonly query = signal('');
  readonly category = new FormControl('all', { nonNullable: true });
  readonly categoryValue = signal('all');
  readonly values = signal<Record<string, string>>({});
  readonly errors = signal<Record<string, string>>({});
  readonly matched = signal<Transaction[]>([]);
  readonly exporting = signal(false);
  private version = 0;
  private retry = false;
  readonly options = this.module.reports.map((r) => ({
    value: r.id,
    label: r.title,
    keywords: [r.category, ...r.aliases],
  }));
  readonly categories = [
    { value: 'all', label: 'كل الفئات' },
    ...Array.from(new Set(this.module.reports.map((r) => r.category)), (value) => ({
      value,
      label: value,
    })),
  ];
  readonly filtered = computed(() =>
    this.module.reports.filter(
      (r) =>
        (this.categoryValue() === 'all' || r.category === this.categoryValue()) &&
        normalize(r.title + ' ' + r.description + ' ' + r.aliases.join(' ')).includes(
          normalize(this.query()),
        ),
    ),
  );
  readonly output = computed(() =>
    this.chosen()?.preview === 'people'
      ? Array.from(new Map(this.matched().map((t) => [t.people[0].identifier, t])).values())
      : this.matched(),
  );
  readonly extension = computed(() =>
    this.values()['format'] === 'Excel' ? 'xlsx' : this.values()['format']?.toLowerCase(),
  );
  readonly parameters = computed(
    () =>
      this.chosen()?.parameters.map((field) =>
        field.kind === 'select' && field.dependency === 'group'
          ? {
              ...field,
              options: field.options.filter(
                (option) =>
                  !this.values()['group'] ||
                  this.values()['group'] === 'all' ||
                  this.module.catalog.groups.find(
                    (g) =>
                      g.id ===
                      this.module.catalog.services.find((s) => s.label === option.value)?.groupId,
                  )?.label === this.values()['group'],
              ),
            }
          : field,
      ) ?? [],
  );
  readonly formatControl = new FormControl('PDF', { nonNullable: true });
  readonly filenameControl = new FormControl('', { nonNullable: true });
  readonly formats = ['PDF', 'Excel', 'CSV'].map((value) => ({ value, label: value }));
  readonly id = (r: { id: string }) => r.id;
  readonly groups = computed(() => {
    const grouped = new Map<string, FinancialGroup>();
    if (
      this.chosen()?.preview === 'fees' &&
      this.values()['grouping'] &&
      this.values()['grouping'] !== 'all'
    )
      for (const t of this.output()) {
        const id = this.values()['grouping'] === 'حسب الموظف' ? t.owner || 'غير مسندة' : t.type;
        const g = grouped.get(id) || { id, count: 0, fees: 0, paid: 0, refunded: 0 };
        g.count++;
        g.fees += t.fees.reduce((s, f) => s + f.amount, 0);
        g.paid += t.payments.filter((p) => p.paid).reduce((s, p) => s + p.amount, 0);
        g.refunded += t.refunds.reduce((s, r) => s + r.amount, 0);
        grouped.set(id, g);
      }
    return [...grouped.values()];
  });
  readonly groupColumns: TableColumn<FinancialGroup>[] = [
    { id: 'id', label: 'المجموعة', value: (r) => r.id },
    { id: 'count', label: 'المعاملات', value: (r) => r.count },
    ...(['fees', 'paid', 'refunded'] as const).map((key, i) => ({
      id: key,
      label: ['الرسوم', 'المدفوع', 'المعاد'][i],
      value: (r: FinancialGroup) => money(r[key]),
      sortValue: (r: FinancialGroup) => r[key],
    })),
  ];
  readonly columns = computed<TableColumn<Transaction>[]>(() => {
    if (this.chosen()?.preview === 'people')
      return [
        { id: 'applicant', label: 'المستفيد', value: (t) => t.applicant },
        { id: 'identifier', label: 'رقم الإثبات', value: (t) => t.people[0].identifier },
        { id: 'phone', label: 'الهاتف', value: (t) => t.people[0].phone || 'غير متوفر' },
        { id: 'type', label: 'الخدمة', value: (t) => t.type },
      ];
    const cols: TableColumn<Transaction>[] = [
      { id: 'id', label: 'المعاملة', value: (t) => t.id },
      { id: 'applicant', label: 'مقدم الطلب', value: (t) => t.applicant },
      { id: 'type', label: 'نوع الخدمة', value: (t) => t.type },
      {
        id: 'status',
        label: 'الحالة',
        value: (t) => statuses[t.status].label,
        sortValue: (t) => t.status,
        badge: (t) => statuses[t.status],
      },
    ];
    if (this.chosen()?.preview === 'fees')
      cols.push(
        {
          id: 'fees',
          label: 'الرسوم',
          value: (t) => money(t.fees.reduce((s, f) => s + f.amount, 0)),
          sortValue: (t) => t.fees.reduce((s, f) => s + f.amount, 0),
        },
        {
          id: 'paid',
          label: 'المدفوع',
          sortValue: (t) =>
            t.payments
              .filter(
                (p) =>
                  p.paid &&
                  (!this.values()['paymentType'] ||
                    this.values()['paymentType'] === 'all' ||
                    p.label === this.values()['paymentType']),
              )
              .reduce((sum, p) => sum + p.amount, 0),
          value: (t) =>
            money(
              t.payments
                .filter(
                  (p) =>
                    p.paid &&
                    (!this.values()['paymentType'] ||
                      this.values()['paymentType'] === 'all' ||
                      p.label === this.values()['paymentType']),
                )
                .reduce((s, p) => s + p.amount, 0),
            ),
        },
        {
          id: 'refunded',
          label: 'المعاد',
          value: (t) => money(t.refunds.reduce((s, r) => s + r.amount, 0)),
          sortValue: (t) => t.refunds.reduce((s, r) => s + r.amount, 0),
        },
      );
    return cols;
  });
  readonly summary = computed(() => [
    { label: 'اسم الملف المقترح', value: this.values()['filename'] + '.' + this.extension() },
    { label: 'عدد نتائج العينة', value: this.groups().length || this.output().length },
    { label: 'المركز', value: this.module.profile.name },
    { label: 'نطاق التقرير', value: this.chosen()?.category ?? '' },
  ]);
  constructor() {
    const a = this.category.valueChanges.subscribe((v) => this.categoryValue.set(v));
    const b = this.formatControl.valueChanges.subscribe((value) =>
      this.change({ id: 'format', value }),
    );
    const c = this.filenameControl.valueChanges.subscribe((value) =>
      this.change({ id: 'filename', value }),
    );
    inject(DestroyRef).onDestroy(() => {
      this.version++;
      a.unsubscribe();
      b.unsubscribe();
      c.unsubscribe();
    });
  }
  search(e: Event) {
    this.query.set((e.target as HTMLInputElement).value);
  }
  change({ id, value }: { id: string; value: string }) {
    this.values.update((v) => ({ ...v, [id]: value, ...(id === 'group' ? { type: 'all' } : {}) }));
  }
  clear() {
    this.query.set('');
    this.category.setValue('all');
  }
  back() {
    this.version++;
    this.chosen.set(null);
    this.phase.set('parameters');
  }
  choose(id: string) {
    this.version++;
    const report = this.module.reports.find((r) => r.id === id);
    if (!report) return;
    this.chosen.set(report);
    this.phase.set('parameters');
    this.retry = false;
    this.errors.set({});
    const old = this.values();
    const compatible = Object.fromEntries(
      report.parameters.flatMap((p) =>
        p.kind === 'date-range'
          ? [
              [p.id + 'From', old[p.id + 'From'] || '2026-10-01'],
              [p.id + 'To', old[p.id + 'To'] || REFERENCE_DATE],
            ]
          : [[p.id, old[p.id] || 'all']],
      ),
    );
    this.values.set({
      ...compatible,
      format: old['format'] || 'PDF',
      filename: report.title.replaceAll(' ', '-'),
    });
    this.formatControl.setValue(this.values()['format'], { emitEvent: false });
    this.filenameControl.setValue(this.values()['filename'], { emitEvent: false });
  }
  async preview(isRetry = false) {
    const chosen = this.chosen();
    if (!chosen) return;
    const values = { ...this.values() };
    const errors: Record<string, string> = {};
    for (const p of chosen.parameters) {
      if (p.kind === 'date-range') {
        const error = rangeError(
          { from: values[p.id + 'From'] || '', to: values[p.id + 'To'] || '' },
          p.required,
        );
        if (error) errors[p.id] = error;
      } else if (p.required && (!values[p.id] || values[p.id] === 'all'))
        errors[p.id] = 'هذا الحقل مطلوب';
    }
    if (!values['filename']?.trim() || /[<>:"/\\|?*]/.test(values['filename']))
      errors['filename'] = 'أدخل اسماً صالحاً بدون علامات الملفات المحجوزة';
    this.errors.set(errors);
    if (Object.keys(errors).length) return;
    const version = ++this.version;
    this.phase.set('pending');
    this.retry ||= isRetry;
    try {
      const rows = await this.store.report({ reportId: chosen.id, values, retry: this.retry });
      if (version === this.version) {
        this.matched.set(rows);
        this.phase.set('ready');
      }
    } catch {
      if (version === this.version) this.phase.set('error');
    }
  }
  async export() {
    const chosen = this.chosen();
    if (!chosen) return;
    this.exporting.set(true);
    try {
      await downloadDatasets(
        [
          reportExport(
            chosen.title,
            chosen.preview,
            this.output(),
            this.groups(),
            this.values()['paymentType'],
          ),
        ],
        {
          center: this.module.profile.name,
          period: this.values()['rangeFrom']
            ? formatCalendarDate(this.values()['rangeFrom']) +
              ' — ' +
              formatCalendarDate(this.values()['rangeTo'])
            : 'كل الفترات',
          scope: chosen.parameters
            .map((p) => p.label + ': ' + (this.values()[p.id] || 'الكل'))
            .join('؛ '),
        },
        this.values()['format'] === 'Excel' ? 'xlsx' : 'csv',
        this.values()['filename'],
      );
      this.toast.show('تم تجهيز تنزيل محلي ببيانات توضيحية');
    } catch {
      this.toast.show('تعذّر تصدير التقرير؛ حاول مرة أخرى', true);
    } finally {
      this.exporting.set(false);
    }
  }
}
