import { Component } from '@angular/core';
import { AppActionMenu, AppEmptyState, AppEntityCard, HlmButton } from '@workspace/ui';
import { SectionBase } from './section-base';
@Component({
  selector: 'app-decisions-section',
  imports: [AppEntityCard, AppEmptyState, AppActionMenu, HlmButton],
  template: `@if (t.decisions.length) {
      <div class="space-y-4">
        @for (d of t.decisions; track d.id) {
          <app-entity-card
            title="قرار المعاملة"
            [description]="d.author + ' · ٦ تشرين الأول ٢٠٢٦'"
            icon="phosphorSealCheck"
            ><p class="text-sm leading-loose">{{ d.text }}</p>
            <app-action-menu card-actions [actions]="decisionActions(d.id)"
          /></app-entity-card>
        }
      </div>
    } @else {
      <app-empty-state
        title="لم يسجل قرار بعد"
        description="تظهر القرارات المحلية مع اسم الموظف ونص القرار."
        icon="phosphorSealCheck"
        ><button hlmBtn type="button" (click)="open('decision')">
          تسجيل قرار
        </button></app-empty-state
      >
    }`,
})
export class DecisionsSection extends SectionBase {}
