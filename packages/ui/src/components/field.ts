import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HlmInput, HlmTextarea } from '../helm/input';
import { HlmSelect } from '../helm/select';
export type SelectOption = { value: string; label: string };
let serial = 0;
@Component({
  selector: 'app-field',
  host: { class: 'block min-w-0' },
  imports: [HlmInput, HlmTextarea, HlmSelect],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppField), multi: true }],
  template: ` <div class="flex min-w-0 flex-col gap-2 text-sm" [class.font-medium]="!hideLabel()">
    <label [for]="id" [class.sr-only]="hideLabel()">{{ label() }}</label>
    @switch (kind()) {
      @case ('select') {
        <hlm-select
          [id]="id"
          [label]="label()"
          [value]="value()"
          [options]="options()"
          [disabled]="disabled()"
          [invalid]="!!error()"
          [describedBy]="error() ? id + '-error' : ''"
          (changed)="select($event)"
          (focusout)="touched()"
        />
      }
      @case ('textarea') {
        <textarea
          hlmInput
          [id]="id"
          [value]="value()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [attr.aria-invalid]="!!error()"
          [attr.aria-describedby]="error() ? id + '-error' : null"
          (input)="update($event)"
          (blur)="touched()"
        ></textarea>
      }
      @default {
        <input
          hlmInput
          [id]="id"
          [type]="kind()"
          [value]="value()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [attr.aria-invalid]="!!error()"
          [attr.aria-describedby]="error() ? id + '-error' : null"
          (input)="update($event)"
          (blur)="touched()"
        />
      }
    }
    @if (error()) {
      <span [id]="id + '-error'" role="alert" class="text-danger">{{ error() }}</span>
    }
  </div>`,
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
