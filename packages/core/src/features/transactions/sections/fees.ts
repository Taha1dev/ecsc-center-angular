import { Component } from '@angular/core';
import { AppDataTable, AppKeyValues, AppPanel, HlmButton } from '@workspace/ui';
import { SectionBase } from './section-base';
@Component({
  selector: 'app-fees-section',
  imports: [AppPanel, AppKeyValues, AppDataTable, HlmButton],
  template: `<ng-template #action let-f
      ><button hlmBtn variant="outline" (click)="open('fee', f.id)">
        تعديل توضيحي
      </button></ng-template
    >
    <div class="space-y-4">
      <app-panel
        ><app-key-values [items]="[{ label: 'إجمالي الرسوم', value: money(total) }]" /></app-panel
      ><app-data-table
        [data]="t.fees"
        [columns]="feeColumns"
        [getRowId]="getId"
        [actionTemplate]="action"
      />
    </div>`,
})
export class FeesSection extends SectionBase {}
