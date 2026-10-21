import { Component, computed, input, output } from '@angular/core';
import {
  BrnPopoverImports,
  provideBrnPopoverDefaultOptions,
  provideBrnPopoverConfig,
} from '@spartan-ng/brain/popover';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { AppIcon } from '../components/icon';
@Component({
  selector: 'hlm-select',
  providers: [
    provideBrnPopoverDefaultOptions({ role: null }),
    provideBrnPopoverConfig({ align: 'start', sideOffset: 5 }),
  ],
  imports: [BrnSelectImports, BrnPopoverImports, AppIcon],
  host: { class: 'block min-w-0' },
  template: `<brn-popover
    brnSelect
    [value]="value()"
    (valueChange)="changed.emit($event ?? '')"
    [disabled]="disabled()"
    ><button
      brnSelectTrigger
      type="button"
      [id]="id()"
      [attr.aria-label]="label()"
      [aria-invalid]="invalid()"
      [attr.aria-describedby]="describedBy() || null"
      class="flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-control border border-input bg-card px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span class="truncate">{{ selected() }}</span
      ><app-icon name="phosphorCaretDown" size="16px" /></button
    ><ng-template brnPopoverContent
      ><div
        brnSelectContent
        dir="rtl"
        class="max-h-80 min-w-44 overflow-auto rounded-inset border bg-popover p-1 text-popover-foreground shadow-float"
      >
        <div brnSelectList>
          @for (o of options(); track o.value) {
            <div
              brnSelectItem
              [value]="o.value"
              class="relative flex min-h-11 cursor-default items-center rounded-control py-2 ps-3 pe-8 text-sm outline-none data-[highlighted]:bg-accent"
            >
              {{ o.label }}
              @if (value() === o.value) {
                <app-icon class="absolute end-2" name="phosphorCheck" size="16px" />
              }
            </div>
          }
        </div></div></ng-template
  ></brn-popover>`,
})
export class HlmSelect {
  readonly value = input('');
  readonly options = input<readonly { value: string; label: string }[]>([]);
  readonly label = input('');
  readonly id = input('');
  readonly invalid = input(false);
  readonly disabled = input(false);
  readonly describedBy = input('');
  readonly placeholder = input('اختر');
  readonly changed = output<string>();
  readonly selected = computed(
    () => this.options().find((o) => o.value === this.value())?.label || this.placeholder(),
  );
}
