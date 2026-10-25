import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { AppSelect } from '../select/select';
export type SelectOption = { value: string; label: string };
let serial = 0;
@Component({
  selector: 'app-field',
  host: { class: 'block min-w-0' },
  imports: [HlmInput, HlmTextarea, AppSelect],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppField), multi: true }],
  templateUrl: './field.html',
})
export class AppField implements ControlValueAccessor {
  readonly hideLabel = input(false);
  readonly label = input.required<string>();
  readonly kind = input('text');
  readonly options = input<readonly SelectOption[]>([]);
  readonly placeholder = input('');
  readonly error = input('');
  readonly value = signal('');
  readonly disabled = signal(false);
  readonly id = 'app-field-' + ++serial;
  change: (value: string) => void = () => {};
  touched: () => void = () => {};
  writeValue(value: unknown) {
    this.value.set(value == null ? '' : String(value));
  }
  registerOnChange(fn: (value: string) => void) {
    this.change = fn;
  }
  registerOnTouched(fn: () => void) {
    this.touched = fn;
  }
  setDisabledState(disabled: boolean) {
    this.disabled.set(disabled);
  }
  update(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.value.set(value);
    this.change(value);
  }
  select(value: string) {
    this.value.set(value);
    this.change(value);
    this.touched();
  }
}
