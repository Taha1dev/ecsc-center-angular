import { Component } from '@angular/core';
import {
  AppActionMenu,
  AppEmptyState,
  AppEntityCard,
  AppStatusBadge,
  CollectionView,
  HlmButton,
} from '@workspace/ui';
import { SectionBase } from './section-base';
@Component({
  selector: 'app-refunds-section',
  imports: [AppEntityCard, AppStatusBadge, AppEmptyState, AppActionMenu, CollectionView, HlmButton],
  template: `<ng-template #card let-r
      ><app-entity-card
        [title]="money(r.amount)"
        [description]="r.reason"
        icon="phosphorArrowUUpLeft"
        ><app-status-badge
          [label]="r.approved ? 'مقبول' : 'بانتظار الموافقة'"
          [intent]="r.approved ? 'success' : 'warning'" /><app-action-menu
          card-actions
          [actions]="refundActions(r)" /></app-entity-card
    ></ng-template>
    @if (t.refunds.length) {
      <app-collection-view
        label="المبالغ المعادة"
        [data]="t.refunds"
        [columns]="refundColumns"
        [getRowId]="getId"
        [card]="card"
        [actions]="refundActions"
      />
    } @else {
      <app-empty-state
        title="لا توجد مبالغ معادة"
        description="يمكن تسجيل طلب إعادة توضيحي عند الحاجة."
        icon="phosphorArrowUUpLeft"
        ><button hlmBtn type="button" (click)="open('refund')">
          إنشاء مبلغ معاد
        </button></app-empty-state
      >
    }`,
})
export class RefundsSection extends SectionBase {}
