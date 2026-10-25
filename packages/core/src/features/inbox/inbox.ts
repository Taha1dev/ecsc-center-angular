import { Component, computed, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CenterDataService } from '@workspace/data-access';
import {
  attentionReasons,
  date,
  normalize,
  REFERENCE_DATE,
  statuses,
  type FilterField,
  type Transaction,
} from '@workspace/domain';
import {
  AppDataTable,
  AppDialog,
  AppIcon,
  AppPageHeader,
  AppPanel,
  AppStatusBadge,
  HlmButton,
  ToastService,
  type MenuAction,
  type TableColumn,
} from '@workspace/ui';
import { transactionActions } from '../../actions';
import { DynamicFields } from '../../components/dynamic-fields/dynamic-fields';
import { TransactionFlow } from '../../components/transaction-flow/transaction-flow';
import { CENTER_MODULE, type Flow } from '../../module';
const defaults: Record<string, string> = {
  query: '',
  group: 'all',
  type: 'all',
  status: 'all',
  priority: 'all',
  team: 'all',
  owner: 'all',
  receivedFrom: '',
  receivedTo: '',
  overdue: 'false',
  stage: 'all',
};
@Component({
  selector: 'app-inbox',
  imports: [
    RouterLink,
    AppPageHeader,
    AppPanel,
    AppDataTable,
    HlmButton,
    AppIcon,
    AppStatusBadge,
    AppDialog,
    DynamicFields,
    TransactionFlow,
  ],
  templateUrl: './inbox.html',
})
export class InboxPage {
  readonly module = inject(CENTER_MODULE);
  readonly center = this.module.profile;
  readonly catalog = this.module.catalog;
  readonly store = inject(CenterDataService);
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly toast = inject(ToastService);
  readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  readonly personal = computed(() => this.params().get('scope') === 'personal');
  readonly employee = this.catalog.employees.find((e) => e.id === this.catalog.currentEmployeeId)!;
  readonly draft = signal<Record<string, string>>({ ...defaults });
  readonly applied = signal<Record<string, string>>({ ...defaults });
  readonly view = signal('all');
  readonly advanced = signal(false);
  readonly refreshing = signal(false);
  readonly flow = signal<{ id: string; flow: Flow } | null>(null);
  readonly bulk = signal<string[] | null>(null);
  readonly date = date;
  readonly referenceDate = REFERENCE_DATE;
  readonly statuses = statuses;
  readonly idTemplate = viewChild<TemplateRef<{ $implicit: Transaction }>>('idCell');
  readonly deadlineTemplate = viewChild<TemplateRef<{ $implicit: Transaction }>>('deadlineCell');
  readonly applicantTemplate = viewChild<TemplateRef<{ $implicit: Transaction }>>('applicantCell');
  readonly receivedTemplate = viewChild<TemplateRef<{ $implicit: Transaction }>>('receivedCell');
  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const initial = { ...defaults };
      for (const key of params.keys) if (key in defaults) initial[key] = params.get(key) || '';
      this.draft.set(initial);
      this.applied.set(initial);
      this.view.set(params.get('view') || 'all');
    });
  }
  readonly scoped = computed(() =>
    this.store.transactions().filter((t) => !this.personal() || t.ownerId === this.employee.id),
  );
  matchesView(t: Transaction, id: string) {
    return (
      id === 'all' ||
      (id === 'unclaimed' && !t.owner) ||
      (id === 'processing' && t.status === 'processing') ||
      (id === 'overdue' &&
        t.deadline < REFERENCE_DATE &&
        t.status !== 'completed' &&
        t.status !== 'rejected') ||
      (id === 'attention' && attentionReasons(t).length > 0)
    );
  }
  readonly filtered = computed(() => {
    const f = this.applied();
    return this.scoped().filter(
      (t) =>
        this.matchesView(t, this.view()) &&
        (!f.query || normalize(t.id + ' ' + t.applicant).includes(normalize(f.query))) &&
        (['group', 'type', 'team', 'status', 'owner'] as const).every(
          (key) => !f[key] || f[key] === 'all' || String(t[key]) === f[key],
        ) &&
        (f.priority === 'all' || t.priority === f.priority) &&
        (!f.receivedFrom || t.received >= f.receivedFrom) &&
        (!f.receivedTo || t.received <= f.receivedTo) &&
        (f.overdue !== 'true' || this.matchesView(t, 'overdue')) &&
        (f.stage === 'all' || t.step === f.stage) &&
        (this.module.inbox?.matches?.(t, f) ?? true),
    );
  });
  readonly fields = computed(() => {
    const options = (items: readonly { label: string }[]) =>
      items.map((i) => ({ value: i.label, label: i.label }));
    const fields: FilterField[] = [
      {
        id: 'query',
        label: 'رقم المعاملة أو مقدم الطلب',
        kind: 'text',
        placeholder: 'ابحث بالرقم أو الاسم',
      },
      {
        id: 'group',
        label: 'مجموعة الخدمة',
        kind: 'select',
        options: options(this.catalog.groups),
      },
      {
        id: 'type',
        label: 'نوع المعاملة',
        kind: 'select',
        dependency: 'group',
        options: options(
          this.catalog.services.filter(
            (s) =>
              this.draft().group === 'all' ||
              this.catalog.groups.find((g) => g.id === s.groupId)?.label === this.draft().group,
          ),
        ),
      },
      {
        id: 'status',
        label: 'الحالة',
        kind: 'select',
        options: Object.entries(statuses).map(([value, s]) => ({ value, label: s.label })),
      },
      { id: 'received', label: 'تاريخ الورود', kind: 'date-range' },
      {
        id: 'priority',
        label: 'الأولوية',
        kind: 'select',
        options: [
          { value: 'normal', label: 'عادية' },
          { value: 'urgent', label: 'عاجلة' },
        ],
      },
      { id: 'team', label: 'فريق المعالجة', kind: 'select', options: options(this.catalog.teams) },
    ];
    if (this.advanced())
      fields.push(
        { id: 'owner', label: 'الموظف', kind: 'select', options: options(this.catalog.employees) },
        {
          id: 'stage',
          label: 'الخطوة الحالية',
          kind: 'select',
          options: ['الاستقبال', 'تدقيق البيانات', 'التسليم'].map((value) => ({
            value,
            label: value,
          })),
        },
        { id: 'overdue', label: 'المتأخرة فقط', kind: 'boolean' },
      );
    return this.module.inbox?.filters?.(fields, this.draft()) ?? fields;
  });
  readonly columns = computed<TableColumn<Transaction>[]>(() => {
    const columns: TableColumn<Transaction>[] = [
      {
        id: 'id',
        label: 'المعاملة',
        value: (t) => t.id,
        template: this.idTemplate(),
        onClick: (t) => this.open(t.id),
      },
      {
        id: 'applicant',
        label: 'مقدم الطلب',
        value: (t) => t.applicant,
        template: this.applicantTemplate(),
      },
      { id: 'group', label: 'مجموعة الخدمة', value: (t) => t.group },
      { id: 'status', label: 'الحالة', value: (t) => t.status, badge: (t) => statuses[t.status] },
      { id: 'step', label: 'الخطوة الحالية', value: (t) => t.step },
      {
        id: 'received',
        label: 'تاريخ الورود',
        value: (t) => date(t.received),
        sortValue: (t) => t.received,
        template: this.receivedTemplate(),
      },
      {
        id: 'deadline',
        label: 'الموعد / الأولوية',
        value: (t) => t.deadline,
        template: this.deadlineTemplate(),
      },
      { id: 'owner', label: 'الموظف', value: (t) => t.owner || 'غير مسندة' },
    ];
    return this.module.inbox?.columns?.(columns) ?? columns;
  });
  readonly rowActions = (t: Transaction): MenuAction[] => [
    {
      id: 'open',
      label: 'فتح المعاملة',
      icon: 'phosphorEye',
      intent: 'primary',
      group: { id: 'view', label: 'العرض والتفاصيل' },
      onSelect: () => this.open(t.id),
    },
    ...transactionActions(this.module, t, (action) =>
      this.flow.set({ id: t.id, flow: { action } }),
    ),
  ];
  readonly getId = (t: Transaction) => t.id;
  readonly active = computed(() =>
    Object.entries(this.applied()).filter(
      ([key, value]) => value && value !== 'all' && value !== 'false' && value !== defaults[key],
    ),
  );
  readonly views = computed(() => [
    { id: 'all', label: 'الكل' },
    { id: 'unclaimed', label: 'غير المستلمة' },
    { id: 'processing', label: 'قيد المعالجة' },
    { id: 'overdue', label: 'المتأخرة' },
    ...(this.view() === 'attention' ? [{ id: 'attention', label: 'يحتاج انتباهك' }] : []),
  ]);
  readonly transaction = computed(() =>
    this.store.transactions().find((t) => t.id === this.flow()?.id),
  );
  count(id: string) {
    return this.scoped().filter((t) => this.matchesView(t, id)).length;
  }
  change(change: { id: string; value: string }) {
    this.draft.update((v) => ({
      ...v,
      [change.id]: change.value,
      ...(change.id === 'group' ? { type: 'all' } : {}),
    }));
  }
  apply() {
    this.applied.set({ ...this.draft() });
  }
  reset() {
    this.draft.set({ ...defaults });
    this.applied.set({ ...defaults });
    this.view.set('all');
  }
  remove(key: string) {
    this.draft.update((v) => ({ ...v, [key]: defaults[key] || '' }));
    this.applied.update((v) => ({ ...v, [key]: defaults[key] || '' }));
  }
  chipLabel(key: string, value: string) {
    return (
      (this.fields().find((f) => f.id === key)?.label || 'التاريخ') +
      ': ' +
      (key === 'status' ? statuses[value as keyof typeof statuses]?.label : value)
    );
  }
  open(id: string) {
    void this.router.navigate(['/centers', this.center.id, 'transactions', id]);
  }
  async refresh() {
    this.refreshing.set(true);
    try {
      await this.store.refresh();
    } finally {
      this.refreshing.set(false);
    }
  }
  async claim() {
    try {
      const result = await this.store.claim(this.bulk() || []);
      this.toast.show(
        `تم استلام ${result.changed} محلياً · تم تجاوز ${result.skipped} لأنها مستلمة أو مغلقة`,
      );
      this.bulk.set(null);
    } catch {
      this.toast.show(this.store.mutationError() || 'تعذر تحديث المعاملة', true);
    }
  }
}
