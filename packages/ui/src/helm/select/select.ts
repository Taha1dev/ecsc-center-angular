import { Component, computed, input, output } from '@angular/core';
import {
  BrnPopoverImports,
  provideBrnPopoverConfig,
  provideBrnPopoverDefaultOptions,
} from '@spartan-ng/brain/popover';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { AppIcon } from '../../components/icon/icon';
@Component({
  selector: 'hlm-select',
  providers: [
    provideBrnPopoverDefaultOptions({ role: null }),
    provideBrnPopoverConfig({ align: 'start', sideOffset: 5 }),
  ],
  imports: [BrnSelectImports, BrnPopoverImports, AppIcon],
  host: { class: 'block min-w-0' },
  templateUrl: './select.html',
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
