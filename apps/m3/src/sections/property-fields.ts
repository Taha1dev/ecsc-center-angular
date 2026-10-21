import { Component, input } from '@angular/core';
import type { SectionContext, SectionEntry } from '@workspace/core';
import { AppPanel, HlmButton } from '@workspace/ui';
@Component({
  selector: 'm3-property-fields',
  imports: [HlmButton, AppPanel],
  template: `<app-panel
    ><h2 class="mb-4 text-section-title font-semibold">{{ context().t.type }}</h2>
    <div data-center-section="property-fields" class="grid gap-4 sm:grid-cols-2">
      @for (f of context().t.fields; track f.id) {
        <div
          class="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-inset border bg-surface-subtle p-4"
        >
          <div class="min-w-0">
            <p class="text-xs text-muted-foreground">{{ f.label }}</p>
            <p class="mt-1 text-sm font-medium break-words">{{ f.value || 'غير متوفر' }}</p>
          </div>
          <button hlmBtn variant="outline" (click)="context().open('field', f.id)">تعديل</button>
        </div>
      }
    </div></app-panel
  >`,
})
export class PropertyFields {
  readonly context = input.required<SectionContext>();
}
export const propertyFields: SectionEntry = {
  id: 'fields',
  title: 'حقول المعاملة',
  group: 'بيانات الطلب',
  view: 'fields',
  actions: ['field'],
  order: 3,
  count: (t) => new Intl.NumberFormat('ar-SY').format(t.fields.length),
  component: PropertyFields,
};
