import { NgComponentOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CenterDataService } from '@workspace/data-access';
import {
  availability,
  date,
  getService,
  mergeRegistry,
  money,
  number,
  REFERENCE_DATE,
  statuses,
  type ActionId,
} from '@workspace/domain';
import {
  AppActionMenu,
  AppDialog,
  AppEmptyState,
  AppField,
  AppIcon,
  AppKeyValues,
  AppPageHeader,
  AppPanel,
  AppStatusBadge,
  HlmButton,
} from '@workspace/ui';
import { transactionActions } from '../../actions';
import { TransactionFlow } from '../../components/transaction-flow';
import { TransactionNavigation } from '../../components/transaction-navigation';
import { CENTER_MODULE, type Flow, type SectionContext, type SectionEntry } from '../../module';
import { defaultSections } from './sections';
export const sectionIcons: Record<string, string> = {
  overview: 'phosphorSquaresFour',
  applicants: 'phosphorUsers',
  parties: 'phosphorTreeStructure',
  fields: 'phosphorTextbox',
  requirements: 'phosphorListChecks',
  attachments: 'phosphorPaperclip',
  payments: 'phosphorCurrencyCircleDollar',
  fees: 'phosphorReceipt',
  refunds: 'phosphorArrowUUpLeft',
  decisions: 'phosphorSealCheck',
  actions: 'phosphorLightning',
  notes: 'phosphorNotePencil',
  activity: 'phosphorClockCounterClockwise',
  output: 'phosphorPrinter',
};
const actionLabels: Partial<Record<ActionId, string>> = {
  applicant: 'إضافة مقدم طلب',
  field: 'تعديل حقل',
  document: 'إضافة مرفق',
  payment: 'إنشاء دفعة',
  fee: 'تعديل رسم',
  refund: 'إنشاء مبلغ معاد',
  decision: 'تسجيل قرار',
  note: 'إضافة ملاحظة',
  print: 'معاينة المخرج',
  status: 'تحديث الحالة',
};
@Component({
  selector: 'app-transaction',
  imports: [
    NgComponentOutlet,
    RouterLink,
    ReactiveFormsModule,
    AppPageHeader,
    AppPanel,
    HlmButton,
    AppIcon,
    AppStatusBadge,
    AppActionMenu,
    AppField,
    AppEmptyState,
    AppDialog,
    AppKeyValues,
    TransactionFlow,
    TransactionNavigation,
  ],
  templateUrl: './transaction.html',
})
export class TransactionPage {
  readonly module = inject(CENTER_MODULE);
  readonly center = this.module.profile;
  readonly catalog = this.module.catalog;
  readonly store = inject(CenterDataService);
  readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  readonly query = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  readonly transaction = computed(() =>
    this.store.transactions().find((t) => t.id === this.params().get('id')),
  );
  readonly flow = signal<Flow | null>(null);
  readonly inspection = signal<{
    kind: 'party' | 'document' | 'refund' | 'decision';
    id: string;
  } | null>(null);
  readonly expanded = signal<string[]>(['بيانات الطلب']);
  readonly sectionControl = new FormControl('overview', { nonNullable: true });
  readonly icons = sectionIcons;
  readonly labels = actionLabels;
  readonly date = date;
  readonly statuses = statuses;
  readonly referenceDate = REFERENCE_DATE;
  readonly registered = mergeRegistry(defaultSections, this.module.sections).toSorted(
    (a, b) => (a.order ?? 100) - (b.order ?? 100),
  );
  readonly sections = computed(() => {
    const t = this.transaction();
    return t
      ? this.registered.filter(
          (s) =>
            getService(this.catalog, t.serviceId).sections.includes(s.id) &&
            (s.visible?.(t, getService(this.catalog, t.serviceId)) ?? true),
        )
      : [];
  });
  readonly section = computed(() =>
    this.sections().find((s) => s.id === (this.query().get('section') || 'overview')),
  );
  readonly service = computed(() => {
    const t = this.transaction();
    return t ? getService(this.catalog, t.serviceId) : null;
  });
  readonly groups = computed(() =>
    [...new Set(this.sections().map((s) => s.group))].map((label) => ({
      label,
      sections: this.sections().filter((s) => s.group === label),
    })),
  );
  readonly sectionOptions = computed(() =>
    this.sections().map((s) => ({ value: s.id, label: s.title })),
  );
  readonly actions = computed(() => {
    const t = this.transaction();
    return t ? transactionActions(this.module, t, (action) => this.open(action)) : [];
  });
  readonly primary = computed(() => this.actions().find((a) => a.placement === 'primary'));
  readonly secondary = computed(() => this.actions().filter((a) => a.placement === 'secondary'));
  readonly rest = computed(() => this.actions().filter((a) => a.placement === 'menu'));
  readonly context = computed<SectionContext | null>(() => {
    const t = this.transaction(),
      service = this.service();
    return t && service
      ? {
          t,
          service,
          center: this.center,
          open: (action, id, title) => this.open(action, id, title),
          inspect: (kind, id) => this.inspection.set({ kind, id }),
          navigate: (id) => this.navigate(id),
          execute: (command) => this.store.execute(t.id, command),
        }
      : null;
  });
  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(() => {
      this.flow.set(null);
      this.inspection.set(null);
    });
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      const id = p.get('section') || 'overview';
      this.sectionControl.setValue(id, { emitEvent: false });
      const group = this.registered.find((s) => s.id === id)?.group;
      if (group) this.expanded.update((v) => [...new Set([...v, group])]);
    });
    this.sectionControl.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((id) => this.navigate(id));
  }
  open(action: ActionId, targetId?: string, title?: string) {
    this.flow.set({ action, targetId, title });
  }
  navigate(section: string) {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { section } });
  }
  allowed(action: ActionId) {
    const t = this.transaction();
    return t
      ? availability(action, t, this.catalog, this.module.capabilities)
      : { visible: false, enabled: false, reason: 'المعاملة غير موجودة' };
  }
  toggleGroup(group: string) {
    this.expanded.update((v) => (v.includes(group) ? v.filter((g) => g !== group) : [...v, group]));
  }
  badge(section: SectionEntry) {
    const t = this.transaction();
    if (!t) return '';
    if (section.count) return section.count(t);
    if (section.id === 'requirements') {
      const n = t.requirements.filter((r) => !r.provided && !r.optional).length;
      return n ? number(n) + ' ناقصة' : 'مكتملة';
    }
    const counts: Record<string, number> = {
      applicants: t.people.length,
      parties: t.parties.length,
      fields: t.fields.length,
      attachments: t.documents.length,
      payments: t.payments.length,
      fees: t.fees.length,
      refunds: t.refunds.length,
      decisions: t.decisions.length,
      notes: t.notes.filter((n) => !n.resolved).length,
      activity: t.activity.length,
    };
    return counts[section.id] === undefined ? '' : number(counts[section.id]);
  }
  readonly inspectionTitle = computed(
    () =>
      ({
        party: 'بيانات الطرف المرتبط',
        document: 'معاينة المرفق',
        refund: 'تفاصيل الإعادة',
        decision: 'تفاصيل القرار',
      })[this.inspection()?.kind || 'party'],
  );
  readonly inspectionItems = computed(() => {
    const t = this.transaction(),
      inspect = this.inspection();
    if (!t || !inspect) return [];
    if (inspect.kind === 'party') {
      const p = t.parties.find((p) => p.id === inspect.id);
      return p
        ? [
            { label: 'الاسم', value: p.name },
            { label: 'الصفة', value: p.kind },
            { label: 'المرجع', value: p.identifier },
          ]
        : [];
    }
    if (inspect.kind === 'document') {
      const d = t.documents.find((d) => d.id === inspect.id);
      return d
        ? [
            { label: 'اسم الملف', value: d.name },
            { label: 'الحجم', value: d.size },
            { label: 'النوع', value: d.type },
          ]
        : [];
    }
    if (inspect.kind === 'refund') {
      const r = t.refunds.find((r) => r.id === inspect.id);
      return r
        ? [
            { label: 'المبلغ', value: money(r.amount) },
            { label: 'السبب', value: r.reason },
            { label: 'الحالة', value: r.approved ? 'مقبول' : 'بانتظار الموافقة' },
          ]
        : [];
    }
    const d = t.decisions.find((d) => d.id === inspect.id);
    return d
      ? [
          { label: 'الموظف', value: d.author },
          { label: 'النص', value: d.text },
        ]
      : [];
  });
}
