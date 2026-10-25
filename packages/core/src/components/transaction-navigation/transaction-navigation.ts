import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { BrnAccordionImports } from '@spartan-ng/brain/accordion';
import { number, type Transaction } from '@workspace/domain';
import { AppIcon } from '@workspace/ui';
import type { SectionEntry } from '../../module';
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
@Component({
  selector: 'app-transaction-navigation',
  imports: [BrnAccordionImports, AppIcon],
  host: { class: 'block min-w-0' },
  templateUrl: './transaction-navigation.html',
})
export class TransactionNavigation {
  readonly transaction = input.required<Transaction>();
  readonly sections = input.required<readonly SectionEntry[]>();
  readonly active = input.required<string>();
  readonly selected = output<string>();
  readonly expanded = signal<string[]>([]);
  readonly icons = sectionIcons;
  readonly groupIcons: Record<string, string> = {
    'بيانات الطلب': 'phosphorBriefcase',
    المستندات: 'phosphorFiles',
    'الشؤون المالية': 'phosphorCurrencyCircleDollar',
    'المعالجة والمتابعة': 'phosphorLightning',
  };
  readonly groups = computed(() =>
    [...new Set(this.sections().map((s) => s.group))].map((label) => ({
      label,
      sections: this.sections().filter((s) => s.group === label),
    })),
  );
  constructor() {
    effect(() => {
      const group = this.sections().find((s) => s.id === this.active())?.group;
      if (group)
        untracked(() => this.expanded.update((v) => (v.includes(group) ? v : [...v, group])));
    });
  }
  setOpened(group: string, open: boolean) {
    this.expanded.update((v) =>
      open ? (v.includes(group) ? v : [...v, group]) : v.filter((g) => g !== group),
    );
  }
  badge(section: SectionEntry): string | undefined {
    const t = this.transaction();
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
    return counts[section.id] === undefined ? undefined : number(counts[section.id]);
  }
}
