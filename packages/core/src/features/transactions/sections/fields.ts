import { Component } from '@angular/core';
import { AppPanel, HlmButton } from '@workspace/ui';
import { SectionBase } from './section-base';
@Component({
  selector: 'app-fields-section',
  imports: [AppPanel, HlmButton],
  template: `<app-panel
    ><h2 class="mb-4 text-section-title font-semibold">{{ t.type }}</h2>
    <div class="grid gap-4 sm:grid-cols-2">
      @for (f of t.fields; track f.id) {
        <div
          class="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-inset border bg-surface-subtle p-4"
        >
          <div class="min-w-0">
            <p class="text-xs text-muted-foreground">{{ f.label }}</p>
            <p class="mt-1 text-sm font-medium break-words">{{ f.value || 'غير متوفر' }}</p>
          </div>
          <button hlmBtn variant="outline" type="button" (click)="open('field', f.id)">
            تعديل
          </button>
        </div>
      }
    </div></app-panel
  >`,
})
export class FieldsSection extends SectionBase {}
