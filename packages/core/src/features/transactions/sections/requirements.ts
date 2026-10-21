import { Component } from '@angular/core';
import { AppPanel, AppStatusBadge, HlmButton } from '@workspace/ui';
import { SectionBase } from './section-base';
@Component({
  selector: 'app-requirements-section',
  imports: [AppPanel, AppStatusBadge, HlmButton],
  template: `<app-panel
    ><div class="space-y-4">
      @for (r of t.requirements; track r.id) {
        <div
          class="flex min-w-0 flex-wrap items-center justify-between gap-3 rounded-inset border bg-surface-subtle p-4"
        >
          <div>
            <p class="text-sm font-medium">{{ r.label }}</p>
            <p class="text-xs text-muted-foreground">{{ r.optional ? 'اختيارية' : 'مطلوبة' }}</p>
          </div>
          <div class="flex items-center gap-2">
            <app-status-badge
              [label]="r.provided ? 'مقدمة' : r.optional ? 'اختيارية غير مقدمة' : 'مفقودة'"
              [intent]="r.provided ? 'success' : r.optional ? 'neutral' : 'warning'"
            />
            @if (!r.provided) {
              <button hlmBtn variant="outline" type="button" (click)="open('document', r.id)">
                إرفاق
              </button>
            }
          </div>
        </div>
      }
    </div></app-panel
  >`,
})
export class RequirementsSection extends SectionBase {}
