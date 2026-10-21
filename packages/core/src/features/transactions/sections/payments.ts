import { Component } from '@angular/core';
import { AppDataTable, AppKeyValues, AppPanel, HlmButton } from '@workspace/ui';
import { SectionBase } from './section-base';
@Component({
  selector: 'app-payments-section',
  imports: [AppPanel, AppKeyValues, AppDataTable, HlmButton],
  template: `<ng-template #action let-p
      ><button hlmBtn variant="outline" (click)="open('payment', p.id)">
        تأكيد الحالة
      </button></ng-template
    >
    <div class="space-y-5">
      <app-panel
        ><app-key-values
          [items]="[
            { label: 'إجمالي الرسوم', value: money(total) },
            { label: 'الدفعات المؤكدة محلياً', value: money(paid) },
            { label: 'المتبقي', value: money(total - paid > 0 ? total - paid : 0) },
          ]" /></app-panel
      ><app-data-table
        [data]="t.payments"
        [columns]="paymentColumns"
        [getRowId]="getId"
        [actionTemplate]="action"
        actionsHeader="إجراء"
        [actionsHideable]="true"
      />
    </div>`,
})
export class PaymentsSection extends SectionBase {}
