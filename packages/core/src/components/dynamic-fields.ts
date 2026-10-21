import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import type { CalendarRange, FilterField } from '@workspace/domain';
import { AppDateRangePicker, AppField } from '@workspace/ui';
@Component({
  selector: 'app-dynamic-fields',
  imports: [ReactiveFormsModule, AppField, AppDateRangePicker],
  host: { class: 'contents' },
  template: `@for (field of fields(); track field.id) {
    @if (field.kind === 'date-range') {
      <div class="flex min-w-0 flex-col gap-2 text-sm font-medium">
        <span>{{ field.label }}{{ field.required ? ' *' : '' }}</span
        ><app-date-range-picker
          [label]="field.label"
          [required]="!!field.required"
          [value]="range(field.id)"
          (valueChange)="rangeChange(field.id, $event)"
          [error]="errors()[field.id] || ''"
        />
      </div>
    } @else if (field.kind === 'boolean') {
      <label class="flex items-center gap-2 text-sm"
        ><input
          type="checkbox"
          class="size-5 accent-primary"
          [checked]="values()[field.id] === 'true'"
          (change)="booleanChange(field.id, $event)"
        />{{ field.label }}</label
      >
    } @else if (field.kind === 'multiselect') {
      <label class="flex min-w-0 flex-col gap-2 text-sm font-medium"
        >{{ field.label
        }}<select
          multiple
          class="min-h-24 rounded-control border bg-card px-3 text-sm"
          (change)="multiChange(field.id, $event)"
        >
          @for (o of field.options; track o.value) {
            <option
              [value]="o.value"
              [selected]="(values()[field.id] || '').split(',').includes(o.value)"
            >
              {{ o.label }}
            </option>
          }
        </select></label
      >
    } @else {
      <app-field
        [label]="field.label + (field.required ? ' *' : '')"
        [kind]="field.kind === 'select' ? 'select' : field.kind === 'date' ? 'date' : 'text'"
        [options]="options(field)"
        [placeholder]="placeholder(field)"
        [error]="errors()[field.id] || ''"
        [formControl]="control(field.id)"
      />
    }
  }`,
})
export class DynamicFields {
  readonly fields = input.required<readonly FilterField[]>();
  readonly values = input.required<Readonly<Record<string, string>>>();
  readonly errors = input<Readonly<Record<string, string>>>({});
  readonly changed = output<{ id: string; value: string }>();
  private readonly destroyRef = inject(DestroyRef);
  private readonly controls = new Map<string, FormControl<string>>();
  control(id: string) {
    let control = this.controls.get(id);
    if (!control) {
      control = new FormControl(this.values()[id] || '', { nonNullable: true });
      control.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((value) => this.changed.emit({ id, value }));
      this.controls.set(id, control);
    }
    const value = this.values()[id] || '';
    if (control.value !== value) control.setValue(value, { emitEvent: false });
    return control;
  }
  options(f: FilterField) {
    return f.kind === 'select' ? [{ value: 'all', label: 'الكل' }, ...f.options] : [];
  }
  placeholder(f: FilterField) {
    return 'placeholder' in f ? f.placeholder || '' : '';
  }
  range(id: string) {
    return { from: this.values()[id + 'From'] || '', to: this.values()[id + 'To'] || '' };
  }
  rangeChange(id: string, r: CalendarRange) {
    this.changed.emit({ id: id + 'From', value: r.from });
    this.changed.emit({ id: id + 'To', value: r.to });
  }
  booleanChange(id: string, e: Event) {
    this.changed.emit({ id, value: String((e.target as HTMLInputElement).checked) });
  }
  multiChange(id: string, e: Event) {
    this.changed.emit({
      id,
      value: Array.from((e.target as HTMLSelectElement).selectedOptions, (o) => o.value).join(','),
    });
  }
}
