import { Component } from '@angular/core';
import { AppEntityCard, AppIcon, HlmButton } from '@workspace/ui';
import { SectionBase } from './section-base';
@Component({
  selector: 'app-output-section',
  imports: [AppEntityCard, HlmButton, AppIcon],
  template: `<div class="grid gap-4 sm:grid-cols-2">
    @for (template of templates; track template) {
      <app-entity-card [title]="template" description="قالب توضيحي للمراجعة والطباعة المحلية"
        ><div class="flex">
          <app-icon name="phosphorFileText" size="32px" class="text-primary" />
        </div>
        <button
          card-actions
          hlmBtn
          variant="outline"
          type="button"
          (click)="open('print', undefined, template)"
        >
          معاينة
        </button></app-entity-card
      >
    }
  </div>`,
})
export class OutputSection extends SectionBase {
  readonly templates = ['إيصال استلام', 'ملخص المعاملة', 'بيان الرسوم'];
}
