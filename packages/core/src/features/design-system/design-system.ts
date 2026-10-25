import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CenterDataService, DEFAULT_RANGE, scopedTransactions } from '@workspace/data-access';
import {
  formatCalendarDate,
  mergeRegistry,
  number,
  statuses,
  type CalendarRange,
  type Transaction,
} from '@workspace/domain';
import {
  AppActionMenu,
  AppDataTable,
  AppDateRangePicker,
  AppDialog,
  AppEmptyState,
  AppEntityCard,
  AppField,
  AppIcon,
  AppLoading,
  AppMetricCard,
  AppPageHeader,
  AppPanel,
  AppStatusBadge,
  CollectionView,
  HlmButton,
  HlmInput,
  ToastService,
  type MenuAction,
  type TableColumn,
} from '@workspace/ui';
import { transactionActions } from '../../actions';
import { AttentionList } from '../../components/attention-list/attention-list';
import { TransactionFlow } from '../../components/transaction-flow/transaction-flow';
import { TransactionNavigation } from '../../components/transaction-navigation/transaction-navigation';
import { CENTER_MODULE, type Flow } from '../../module';
import { defaultSections } from '../transactions/sections';
@Component({
  selector: 'app-design-system',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    AppPageHeader,
    AppEntityCard,
    HlmInput,
    AppPanel,
    AppStatusBadge,
    HlmButton,
    AppIcon,
    AppDateRangePicker,
    AppField,
    AppDialog,
    AppActionMenu,
    AppDataTable,
    AppEmptyState,
    AppLoading,
    AppMetricCard,
    CollectionView,
    TransactionFlow,
    AttentionList,
    TransactionNavigation,
  ],
  templateUrl: './design-system.html',
})
export class DesignSystemPage {
  readonly router = inject(Router);
  readonly variants = [
    { label: 'أساسي', variant: 'default' },
    { label: 'ثانوي', variant: 'secondary' },
    { label: 'حدود', variant: 'outline' },
    { label: 'هادئ', variant: 'ghost' },
    { label: 'إجراء حذر', variant: 'destructive' },
  ] as const;
  readonly scoped = computed(() => scopedTransactions(this.store.transactions(), DEFAULT_RANGE));
  viewAttention(filters: Record<string, string>) {
    void this.router.navigate(['/centers', this.module.profile.id, 'inbox', 'group'], {
      queryParams: { ...filters, receivedFrom: DEFAULT_RANGE.from, receivedTo: DEFAULT_RANGE.to },
    });
  }
  readonly module = inject(CENTER_MODULE);
  readonly store = inject(CenterDataService);
  readonly toast = inject(ToastService);
  readonly sample = computed(() => this.store.transactions()[0]);
  readonly selected = signal('applicants');
  readonly sections = mergeRegistry(defaultSections, this.module.sections);
  readonly flow = signal<Flow | null>(null);
  readonly reset = signal(false);
  readonly open = signal(false);
  readonly sheet = signal(false);
  readonly feedback = signal('');
  readonly period = signal<CalendarRange>({ ...DEFAULT_RANGE });
  readonly format = formatCalendarDate;
  readonly test = new FormControl('', { nonNullable: true });
  readonly invalid = new FormControl('قيمة غير مكتملة', { nonNullable: true });
  readonly focus = new FormControl('', { nonNullable: true });
  readonly number = number;
  readonly id = (r: { id: string }) => r.id;
  readonly actions = computed<MenuAction[]>(() =>
    this.sample()
      ? [
          {
            id: 'open',
            label: 'فتح المعاملة',
            icon: 'phosphorArrowLeft',
            onSelect: () => {
              void this.router.navigate([
                '/centers',
                this.module.profile.id,
                'transactions',
                this.sample().id,
              ]);
            },
          },
          ...transactionActions(this.module, this.sample(), (action) => this.flow.set({ action })),
        ]
      : [],
  );
  readonly resetActions: MenuAction[] = [
    {
      id: 'reset',
      label: 'إعادة ضبط بيانات المركز',
      intent: 'danger',
      icon: 'phosphorArrowCounterClockwise',
      onSelect: () => this.reset.set(true),
    },
  ];
  readonly statuses = [
    statuses['processing'],
    statuses['completed'],
    { label: 'بانتظار الدفع', intent: 'warning' as const },
    statuses['rejected'],
    { label: 'غير مسندة', intent: 'neutral' as const },
    { label: 'عاجلة', intent: 'warning' as const },
  ];
  readonly peopleColumns: TableColumn<Transaction['people'][number]>[] = [
    { id: 'name', label: 'الاسم', value: (r) => r.name },
    { id: 'kind', label: 'الصفة', value: (r) => r.kind },
    { id: 'identifier', label: 'رقم الهوية', value: (r) => r.identifier },
  ];
  readonly rows = [
    { id: '١', label: 'صف توضيحي', state: 'مكتمل' },
    { id: '٢', label: 'صف طويل قابل للقراءة', state: 'قيد المعالجة' },
  ];
  readonly columns: TableColumn<(typeof this.rows)[number]>[] = [
    { id: 'id', label: 'الرقم', value: (r) => r.id },
    { id: 'label', label: 'المحتوى', value: (r) => r.label },
    { id: 'state', label: 'الحالة', value: (r) => r.state },
  ];
  readonly swatches = [
    { label: 'الأساسي', className: 'bg-primary text-primary-foreground' },
    { label: 'الثانوي', className: 'bg-secondary text-secondary-foreground' },
    { label: 'التنقل', className: 'bg-sidebar text-sidebar-foreground' },
    { label: 'نجاح', className: 'bg-success-soft text-success-foreground' },
    { label: 'تحذير', className: 'bg-warning-soft text-warning-foreground' },
    { label: 'معلومة', className: 'bg-info-soft text-info-foreground' },
    { label: 'خطر', className: 'bg-danger-soft text-danger-foreground' },
    { label: 'محايد', className: 'bg-neutral-soft text-neutral-foreground' },
  ];
  readonly metrics = computed(() => {
    const scoped = scopedTransactions(this.store.transactions(), DEFAULT_RANGE);
    return [
      {
        label: 'معاملات الفترة',
        value: scoped.length,
        icon: 'phosphorTray',
        tone: 'primary' as const,
      },
      {
        label: 'منجزة حاليًا',
        value: scoped.filter((t) => t.status === 'completed').length,
        icon: 'phosphorCheckCircle',
        tone: 'secondary' as const,
      },
      {
        label: 'المستفيدون الفعليون',
        value: new Set(
          scoped.filter((t) => t.status === 'completed').map((t) => t.people[0].identifier),
        ).size,
        icon: 'phosphorUsers',
        tone: 'violet' as const,
      },
      {
        label: 'تسجيلات الفترة',
        value: (this.store.dashboard()?.accounts ?? []).filter(
          (a) => a.registered >= DEFAULT_RANGE.from && a.registered <= DEFAULT_RANGE.to,
        ).length,
        icon: 'phosphorUserPlus',
        tone: 'cyan' as const,
      },
    ];
  });
  async resetData() {
    try {
      await this.store.reset();
      this.reset.set(false);
      this.feedback.set('أعيدت بيانات المركز محلياً');
    } catch {
      this.toast.show(this.store.mutationError() || 'تعذر تحديث المعاملة', true);
    }
  }
}
