import { CdkMenuModule } from '@angular/cdk/menu';
import { Component, computed, input, output, signal } from '@angular/core';
import { BrnPopoverImports } from '@spartan-ng/brain/popover';
import { HlmButton } from '../helm/button';
import { HlmInput } from '../helm/input';
import { AppIcon } from './icon';
@Component({
  selector: 'app-combobox',
  imports: [BrnPopoverImports, CdkMenuModule, HlmButton, HlmInput, AppIcon],
  template: `<brn-popover
    [state]="open() ? 'open' : 'closed'"
    (stateChanged)="open.set($event === 'open')"
    ><button
      hlmBtn
      variant="outline"
      brnPopoverTrigger
      type="button"
      role="combobox"
      [attr.aria-expanded]="open()"
      class="h-12 w-full justify-start text-muted-foreground"
      [attr.aria-label]="label()"
    >
      <app-icon name="phosphorMagnifyingGlass" /><span>{{ label() }}</span></button
    ><ng-template brnPopoverContent
      ><div
        dir="rtl"
        class="w-[min(90vw,440px)] rounded-control border bg-popover p-2 shadow-float"
      >
        <input
          hlmInput
          placeholder="ابحث بالاسم أو الفئة…"
          aria-label="بحث في الخيارات"
          [value]="query()"
          (input)="search($event)"
        />
        <div cdkMenu class="mt-2 max-h-72 overflow-auto">
          <p class="px-3 py-2 text-xs text-muted-foreground">التقارير المقترحة</p>
          @for (option of filtered(); track option.value) {
            <button
              cdkMenuItem
              type="button"
              class="flex min-h-11 w-full rounded-md px-3 py-2 text-start text-sm outline-none hover:bg-accent focus:bg-accent"
              (cdkMenuItemTriggered)="select(option.value)"
            >
              {{ option.label }}
            </button>
          } @empty {
            <p class="p-4 text-sm text-muted-foreground">لا توجد تقارير مطابقة</p>
          }
        </div>
      </div></ng-template
    ></brn-popover
  >`,
})
export class AppCombobox {
  readonly label = input.required<string>();
  readonly options =
    input.required<readonly { value: string; label: string; keywords?: string[] }[]>();
  readonly selected = output<string>();
  readonly open = signal(false);
  readonly query = signal('');
  readonly filtered = computed(() => {
    const q = this.normalize(this.query());
    return this.options().filter((o) =>
      this.normalize(o.label + ' ' + (o.keywords ?? []).join(' ')).includes(q),
    );
  });
  normalize(s: string) {
    return s
      .normalize('NFKD')
      .replace(/[\u064B-\u065F]/g, '')
      .toLowerCase();
  }
  search(e: Event) {
    this.query.set((e.target as HTMLInputElement).value);
  }
  select(id: string) {
    this.selected.emit(id);
    this.open.set(false);
    this.query.set('');
  }
}
