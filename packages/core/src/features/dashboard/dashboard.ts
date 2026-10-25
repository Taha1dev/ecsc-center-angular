import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  ACCOUNT_COVERAGE,
  CenterDataService,
  comparePeriod,
  dashboardSeries,
  DEFAULT_RANGE,
  granularities,
  SAMPLE_COVERAGE,
  scopedTransactions,
  type Comparison,
  type Granularity,
} from '@workspace/data-access';
import {
  attentionReasons,
  availability,
  date,
  formatCalendarDate,
  number,
  parseCalendarDate,
  previousCalendarRange,
  REFERENCE_DATE,
  REFERENCE_LABEL,
  shiftCalendarDate,
  statuses,
  type AttentionKind,
  type CalendarRange,
  type Transaction,
} from '@workspace/domain';
import {
  AppDateRangePicker,
  AppExportMenu,
  AppIcon,
  AppLoading,
  AppMetricCard,
  AppPageHeader,
  AppPanel,
  ChartWorkspace,
  HlmButton,
  type ChartRow,
  type ChartSeries,
  type ExportDataset,
} from '@workspace/ui';
import { AttentionList } from '../../components/attention-list/attention-list';
import { TransactionFlow } from '../../components/transaction-flow/transaction-flow';
import { CENTER_MODULE } from '../../module';
const attention = {
  overdue: { label: 'متأخرة', reason: 'تجاوزت موعد المعالجة', filters: { overdue: 'true' } },
  unassigned: { label: 'غير مسندة', reason: 'تحتاج إسناداً لموظف', filters: { view: 'unclaimed' } },
  waiting: {
    label: 'بانتظار الاستكمال',
    reason: 'بانتظار بيانات أو وثائق',
    filters: { status: 'waiting' },
  },
};
@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    AppPageHeader,
    AppDateRangePicker,
    AppExportMenu,
    HlmButton,
    AppIcon,
    AppMetricCard,
    ChartWorkspace,
    AppPanel,
    AppLoading,
    TransactionFlow,
    AttentionList,
  ],
  templateUrl: './dashboard.html',
})
export class DashboardPage {
  readonly module = inject(CENTER_MODULE);
  readonly center = this.module.profile;
  readonly store = inject(CenterDataService);
  readonly router = inject(Router);
  readonly range = signal<CalendarRange>({ ...DEFAULT_RANGE });
  readonly granularity = signal<Granularity>('day');
  readonly refreshing = signal(false);
  readonly lastRefresh = signal('');
  readonly kind = signal<AttentionKind | 'all'>('all');
  readonly claim = signal<Transaction | null>(null);
  readonly number = number;
  readonly date = date;
  readonly format = formatCalendarDate;
  readonly granularities = granularities;
  readonly referenceLabel = REFERENCE_LABEL;
  readonly kinds = ['overdue', 'unassigned', 'waiting'] as const;
  readonly attention = attention;
  readonly period = computed(
    () => `${formatCalendarDate(this.range().from)} — ${formatCalendarDate(this.range().to)}`,
  );
  readonly previous = computed(() => previousCalendarRange(this.range()));
  readonly scoped = computed(() => scopedTransactions(this.store.transactions(), this.range()));
  readonly accounts = computed(() => this.store.dashboard()?.accounts ?? []);
  readonly series = computed(() =>
    dashboardSeries(this.store.transactions(), this.accounts(), this.range(), this.granularity()),
  );
  readonly completed = computed(() => this.scoped().filter((t) => t.status === 'completed').length);
  readonly registered = computed(() => this.registrations(this.range()));
  readonly lifecycle = computed<ChartRow[]>(() =>
    Object.entries(statuses).map(([id, status]) => ({
      id,
      label: status.label,
      count: this.scoped().filter((t) => t.status === id).length,
    })),
  );
  readonly workload = computed<ChartRow[]>(() =>
    this.module.catalog.groups.map((g) => {
      const counts: Record<string, number> = {};
      for (const status of Object.keys(statuses))
        counts[status] = this.scoped().filter(
          (t) => t.group === g.label && t.status === status,
        ).length;
      return { id: g.label, label: g.label, ...counts };
    }),
  );
  readonly trendSeries: ChartSeries[] = [
    { id: 'received', label: 'واردة', color: '--chart-1' },
    { id: 'completed', label: 'منجزة حاليًا', color: '--chart-2' },
  ];
  readonly statusSeries: ChartSeries[] = Object.entries(statuses).map(([id, s]) => ({
    id,
    label: s.label,
    color: '--' + s.intent,
  }));
  readonly usersSeries: ChartSeries[] = [
    { id: 'users', label: 'مستخدمون مسجلون', color: '--chart-3' },
  ];
  readonly context = computed(() => ({
    center: this.center.name,
    period: this.period(),
    scope:
      'عينة معاملات المركز (٤٨ سجلًا، ١–٦ تشرين الأول) وحسابات اصطناعية مؤرخة (٢٠٢٦)؛ اللقطات الثابتة منفصلة',
  }));
  readonly datasets = computed<ExportDataset[]>(() => [
    {
      title: 'حركة المعاملات',
      headers: ['الفترة', 'واردة', 'منجزة حاليًا'],
      rows: this.series().map((s) => [
        parseCalendarDate(s.id.length === 7 ? s.id + '-01' : s.id)!,
        s.received,
        s.completed,
      ]),
      units: 'عدد المعاملات الواردة؛ الإنجاز يعكس الحالة الحالية',
    },
    {
      title: 'توزيع الحالات',
      headers: ['الحالة', 'عدد المعاملات', 'النسبة المئوية'],
      rows: this.lifecycle().map((s) => [
        s.label,
        Number(s.count),
        this.scoped().length ? (Number(s.count) / this.scoped().length) * 100 : 0,
      ]),
      units: 'عدد المعاملات؛ النسبة من إجمالي عينة الفترة',
    },
    {
      title: 'أحمال مجموعات الخدمة',
      headers: ['مجموعة الخدمة', ...Object.values(statuses).map((s) => s.label), 'الإجمالي'],
      rows: this.workload().map((w) => [
        w.label,
        ...Object.keys(statuses).map((key) => Number(w[key] || 0)),
        Object.keys(statuses).reduce((n, key) => n + Number(w[key] || 0), 0),
      ]),
      units: 'عدد المعاملات حسب مجموعة الخدمة والحالة',
    },
    {
      title: 'تسجيل المستخدمين',
      headers: ['الفترة', 'مستخدمون مسجلون'],
      rows: this.series().map((s) => [
        parseCalendarDate(s.id.length === 7 ? s.id + '-01' : s.id)!,
        s.users,
      ]),
      units: 'حسابات اصطناعية مؤرخة',
    },
  ]);
  readonly metrics = computed(() => [
    {
      label: 'معاملات الفترة',
      value: this.scoped().length,
      caption: 'واردة · عينة البريد',
      tone: 'primary' as const,
      icon: 'phosphorTray',
      comparison: comparePeriod(
        this.scoped().length,
        this.range(),
        SAMPLE_COVERAGE,
        (p) => scopedTransactions(this.store.transactions(), p).length,
      ),
    },
    {
      label: 'منجزة حاليًا',
      value: this.completed(),
      caption: 'الحالة الحالية لوارد الفترة',
      tone: 'secondary' as const,
      icon: 'phosphorCheckCircle',
      comparison: comparePeriod(
        this.completed(),
        this.range(),
        SAMPLE_COVERAGE,
        (p) =>
          scopedTransactions(this.store.transactions(), p).filter((t) => t.status === 'completed')
            .length,
      ),
    },
    {
      label: 'المستفيدون الفعليون',
      value: this.beneficiaries(this.range()),
      caption: 'أصحاب معاملات منجزة · أشخاص فريدون',
      tone: 'violet' as const,
      icon: 'phosphorUsers',
      comparison: comparePeriod(
        this.beneficiaries(this.range()),
        this.range(),
        SAMPLE_COVERAGE,
        (p) => this.beneficiaries(p),
      ),
    },
    {
      label: 'تسجيلات الفترة',
      value: this.registered(),
      caption: 'حسابات اصطناعية مؤرخة',
      tone: 'cyan' as const,
      icon: 'phosphorUserPlus',
      comparison: comparePeriod(this.registered(), this.range(), ACCOUNT_COVERAGE, (p) =>
        this.registrations(p),
      ),
    },
  ]);
  readonly exports = computed<ExportDataset[]>(() => [
    {
      title: 'مؤشرات الفترة',
      headers: ['المؤشر', 'القيمة', 'التعريف'],
      rows: this.metrics().map((m) => [m.label, m.value, m.caption]),
      units: 'عدد',
    },
    ...this.datasets(),
  ]);
  readonly recent = computed(() =>
    this.scoped()
      .flatMap((transaction) => transaction.activity.map((event) => ({ transaction, event })))
      .sort(
        (a, b) =>
          Date.parse(b.event.occurredAt) - Date.parse(a.event.occurredAt) ||
          a.transaction.id.localeCompare(b.transaction.id),
      )
      .slice(0, 8),
  );
  readonly attentionRows = computed(() =>
    this.scoped()
      .map((t) => ({ t, reasons: attentionReasons(t) }))
      .filter((r) =>
        this.kind() === 'all' ? r.reasons.length : r.reasons.includes(this.kind() as AttentionKind),
      )
      .sort(
        (a, b) =>
          Number(b.reasons.includes('overdue')) - Number(a.reasons.includes('overdue')) ||
          a.t.deadline.localeCompare(b.t.deadline) ||
          a.t.id.localeCompare(b.t.id),
      ),
  );
  readonly summary = computed(() => {
    const s = this.store.dashboard()?.snapshot ?? this.module.demo.snapshot;
    return [
      { label: 'عدد المعاملات الكلي · لقطة', value: s.total, primary: true },
      {
        label: 'معاملات اليوم · عينة',
        value: this.store.transactions().filter((t) => t.received === REFERENCE_DATE).length,
      },
      { label: 'هذا الأسبوع · عينة', value: this.store.transactions().length },
      { label: 'هذا الشهر · لقطة', value: s.month },
      { label: 'هذا العام · لقطة', value: s.year },
      {
        label: 'المستخدمون النشطون · آخر ٣٠ يوماً',
        value: this.accounts().filter(
          (a) =>
            a.activeAt >= shiftCalendarDate(REFERENCE_DATE, -29) && a.activeAt <= REFERENCE_DATE,
        ).length,
      },
      { label: 'إجمالي المستخدمين · حسابات مؤرخة', value: this.accounts().length },
      {
        label: 'المسجلون خلال آخر ٢٤ ساعة · يوم العرض',
        value: this.registrations({ from: REFERENCE_DATE, to: REFERENCE_DATE }),
      },
    ];
  });
  registrations(range: CalendarRange) {
    return this.accounts().filter((a) => a.registered >= range.from && a.registered <= range.to)
      .length;
  }
  beneficiaries(range: CalendarRange) {
    return new Set(
      scopedTransactions(this.store.transactions(), range)
        .filter((t) => t.status === 'completed')
        .map((t) => t.people[0].identifier),
    ).size;
  }
  comparison(value: Comparison) {
    return (
      (value.delta !== undefined
        ? (value.delta > 0 ? 'زيادة' : value.delta < 0 ? 'انخفاض' : 'دون تغير') +
          ' ' +
          number(Math.abs(value.delta)) +
          (value.percent !== undefined ? ' · ' + number(Math.abs(value.percent)) + '٪' : '') +
          ' مقارنة بالفترة السابقة. '
        : '') + (value.reason || '')
    );
  }
  setRange(range: CalendarRange) {
    this.range.set(range.from && range.to ? range : { ...DEFAULT_RANGE });
  }
  reset() {
    this.range.set({ ...DEFAULT_RANGE });
    this.granularity.set('day');
  }
  async refresh() {
    this.refreshing.set(true);
    try {
      await this.store.refresh();
      this.lastRefresh.set(
        new Intl.DateTimeFormat('ar-SY', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'Asia/Damascus',
        }).format(new Date()),
      );
    } finally {
      this.refreshing.set(false);
    }
  }
  drill(filters: Record<string, string>) {
    void this.router.navigate(['/centers', this.center.id, 'inbox', 'group'], {
      queryParams: { ...filters, receivedFrom: this.range().from, receivedTo: this.range().to },
    });
  }
  attentionCount(kind: AttentionKind | 'all') {
    return this.scoped().filter((t) =>
      kind === 'all' ? attentionReasons(t).length : attentionReasons(t).includes(kind),
    ).length;
  }
  allAttention() {
    this.drill(
      this.kind() === 'all'
        ? { view: 'attention' }
        : attention[this.kind() as AttentionKind].filters,
    );
  }
  canClaim(t: Transaction) {
    const a = availability('claim', t, this.module.catalog, this.module.capabilities);
    return a.enabled && a.visible;
  }
  groupCount(group: string) {
    return this.scoped().filter((t) => t.group === group).length;
  }
}
