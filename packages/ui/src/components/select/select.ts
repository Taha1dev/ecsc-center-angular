import { Component, computed, input, output } from '@angular/core';
import { HlmSelectImports } from '@spartan-ng/helm/select';

/** Product field API composed from the shared, official Helm select primitives. */
@Component({
  selector: 'app-select',
  imports: [HlmSelectImports],
  host: { class: 'block min-w-0' },
  templateUrl: './select.html',
})
export class AppSelect {
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
    () =>
      this.options().find((option) => option.value === this.value())?.label || this.placeholder(),
  );
  readonly itemToString = (value: unknown) =>
    this.options().find((option) => option.value === value)?.label ?? '';

  choose(value: unknown) {
    this.changed.emit(typeof value === 'string' ? value : '');
  }
}
