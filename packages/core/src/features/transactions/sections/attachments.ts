import { Component } from '@angular/core';
import {
  AppActionMenu,
  AppEmptyState,
  AppEntityCard,
  CollectionView,
  HlmButton,
} from '@workspace/ui';
import { SectionBase } from './section-base';
@Component({
  selector: 'app-attachments-section',
  imports: [AppEntityCard, AppEmptyState, AppActionMenu, CollectionView, HlmButton],
  template: `<ng-template #card let-d
      ><app-entity-card [title]="d.name" [description]="d.type + ' · ' + d.size" [body]="false"
        ><app-action-menu card-actions [actions]="documentActions(d)" /></app-entity-card
    ></ng-template>
    @if (t.documents.length) {
      <app-collection-view
        label="المرفقات"
        [data]="t.documents"
        [columns]="documentColumns"
        [getRowId]="getId"
        [card]="card"
        [actions]="documentActions"
      />
    } @else {
      <app-empty-state description="أضف مرفقاً محلياً ليظهر هنا." icon="phosphorPaperclip"
        ><button hlmBtn type="button" (click)="open('document')">
          إضافة مرفق
        </button></app-empty-state
      >
    }`,
})
export class AttachmentsSection extends SectionBase {}
