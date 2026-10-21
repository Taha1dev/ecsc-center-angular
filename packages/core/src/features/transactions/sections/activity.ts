import { Component, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AppActivityTimeline, AppEmptyState, AppField, AppPanel } from '@workspace/ui';
import { SectionBase } from './section-base';
@Component({
  selector: 'app-activity-section',
  imports: [AppPanel, AppActivityTimeline, AppEmptyState, AppField, ReactiveFormsModule],
  template: `<app-panel
    ><div class="mb-6 grid gap-4 sm:grid-cols-2">
      <app-field
        [hideLabel]="true"
        label="مرشح الموظف"
        kind="select"
        [options]="employees"
        [formControl]="actor"
      /><app-field
        [hideLabel]="true"
        label="نوع الحدث"
        kind="select"
        [options]="kinds"
        [formControl]="kind"
      />
    </div>
    @if (events().length) {
      <app-activity-timeline [items]="events()" />
    } @else {
      <app-empty-state description="لا يوجد نشاط يطابق المرشحات المختارة." />
    }
  </app-panel>`,
})
export class ActivitySection extends SectionBase {
  readonly actor = new FormControl('all', { nonNullable: true });
  readonly kind = new FormControl('all', { nonNullable: true });
  readonly actorState = signal('all');
  readonly kindState = signal('all');
  readonly employees = [
    { value: 'all', label: 'جميع الموظفين' },
    { value: 'النظام', label: 'النظام' },
    ...this.module.catalog.employees.map((e) => ({ value: e.label, label: e.label })),
  ];
  readonly kinds = [
    { value: 'all', label: 'جميع الأحداث' },
    { value: 'edit', label: 'تعديلات' },
    { value: 'transfer', label: 'تحويلات' },
    { value: 'system', label: 'النظام' },
  ];
  readonly events = computed(() =>
    this.t.activity.filter(
      (a) =>
        (this.actorState() === 'all' || a.actor === this.actorState()) &&
        (this.kindState() === 'all' || a.kind === this.kindState()),
    ),
  );
  constructor() {
    super();
    this.actor.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => this.actorState.set(v));
    this.kind.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((v) => this.kindState.set(v));
  }
}
