import { Component, computed, inject, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  attentionReasons,
  availability,
  date,
  number,
  type AttentionKind,
  type Transaction,
} from '@workspace/domain';
import { AppIcon, AppPanel, HlmButton } from '@workspace/ui';
import { CENTER_MODULE } from '../../module';
import { TransactionFlow } from '../transaction-flow/transaction-flow';
const attention = {
  overdue: {
    label: 'متأخرة',
    reason: 'تجاوزت موعد المعالجة',
    icon: 'phosphorClock',
    filters: { overdue: 'true' },
  },
  unassigned: {
    label: 'غير مسندة',
    reason: 'تحتاج إسناداً لموظف',
    icon: 'phosphorUserCircleDashed',
    filters: { view: 'unclaimed' },
  },
  waiting: {
    label: 'بانتظار الاستكمال',
    reason: 'بانتظار بيانات أو وثائق',
    icon: 'phosphorHourglass',
    filters: { status: 'waiting' },
  },
};
@Component({
  selector: 'app-attention-list',
  imports: [RouterLink, AppPanel, AppIcon, HlmButton, TransactionFlow],
  host: { class: 'block min-w-0 self-start' },
  templateUrl: './attention-list.html',
})
export class AttentionList {
  readonly module = inject(CENTER_MODULE);
  readonly center = this.module.profile;
  readonly rows = input.required<Transaction[]>();
  readonly viewAll = output<Record<string, string>>();
  readonly kind = signal<AttentionKind | 'all'>('all');
  readonly claim = signal<Transaction | null>(null);
  readonly date = date;
  readonly number = number;
  readonly attention = attention;
  readonly kinds = ['overdue', 'unassigned', 'waiting'] as const;
  readonly attentionRows = computed(() =>
    this.rows()
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
  attentionCount(kind: AttentionKind | 'all') {
    return this.rows().filter((t) =>
      kind === 'all' ? attentionReasons(t).length : attentionReasons(t).includes(kind),
    ).length;
  }
  allAttention() {
    this.viewAll.emit(
      this.kind() === 'all'
        ? { view: 'attention' }
        : attention[this.kind() as AttentionKind].filters,
    );
  }
  canClaim(t: Transaction) {
    const a = availability('claim', t, this.module.catalog, this.module.capabilities);
    return a.enabled && a.visible;
  }
  primary(reasons: AttentionKind[]) {
    return this.kind() === 'all' ? reasons[0] : (this.kind() as AttentionKind);
  }
}
