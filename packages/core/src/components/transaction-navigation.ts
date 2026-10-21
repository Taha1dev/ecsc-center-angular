import { Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { BrnAccordionImports } from '@spartan-ng/brain/accordion';
import { number, type Transaction } from '@workspace/domain';
import { AppIcon } from '@workspace/ui';
import type { SectionEntry } from '../module';
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
  template: `<nav aria-label="أقسام المعاملة" brnAccordion type="multiple">
    @for (group of groups(); track group.label) {
      <div
        brnAccordionItem
        [isOpened]="expanded().includes(group.label)"
        (openedChange)="setOpened(group.label, $event)"
        class="border-b last:border-b-0"
      >
        <h3 brnAccordionHeader>
          <button
            brnAccordionTrigger
            type="button"
            class="flex min-h-12 w-full items-center justify-between gap-2 rounded-control px-3 py-3 text-start text-sm font-semibold outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span class="flex items-center gap-2"
              ><app-icon
                [name]="groupIcons[group.label] || 'phosphorBriefcase'"
                class="text-primary"
                size="20px"
              />{{ group.label }}</span
            ><app-icon
              name="phosphorCaretDown"
              size="16px"
              [class.rotate-180]="expanded().includes(group.label)"
            />
          </button>
        </h3>
        <div
          brnAccordionContent
          [hidden]="!expanded().includes(group.label)"
          class="space-y-1 pb-3"
        >
          @for (s of group.sections; track s.id) {
            <button
              type="button"
              (click)="selected.emit(s.id)"
              [attr.aria-current]="active() === s.id ? 'page' : null"
              [class]="
                'flex min-h-11 w-full items-center gap-2.5 rounded-control border-s-3 px-3 py-2.5 text-start text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
                (active() === s.id
                  ? 'border-primary bg-primary-soft font-semibold text-primary'
                  : 'border-transparent hover:bg-muted')
              "
            >
              <app-icon [name]="s.icon || icons[s.id] || 'phosphorSquaresFour'" size="18px" /><span
                class="min-w-0 flex-1"
                >{{ s.title }}</span
              >
              @if (badge(s) !== undefined) {
                <span
                  class="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                  >{{ badge(s) }}</span
                >
              }
            </button>
          }
        </div>
      </div>
    }
  </nav>`,
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
