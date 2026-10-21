import { Component } from '@angular/core';
import {
  AppActionMenu,
  AppEntityCard,
  AppKeyValues,
  AppStatusBadge,
  CollectionView,
} from '@workspace/ui';
import { SectionBase } from './section-base';
@Component({
  selector: 'app-applicants-section',
  imports: [AppEntityCard, AppKeyValues, AppStatusBadge, AppActionMenu, CollectionView],
  template: `<ng-template #card let-p
      ><app-entity-card
        [title]="p.name"
        [description]="p.kind"
        [icon]="p.kind === 'فرد' ? 'phosphorUsers' : 'phosphorTreeStructure'"
        ><div class="mb-4">
          @if (p.lead) {
            <app-status-badge label="مقدم الطلب الرئيسي" intent="info" />
          }
        </div>
        <app-key-values
          [items]="[
            { label: 'رقم الإثبات', value: p.identifier },
            { label: 'الهاتف', value: p.phone || 'غير متوفر' },
          ]" /><app-action-menu
          card-actions
          [actions]="personActions(p)" /></app-entity-card></ng-template
    ><app-collection-view
      label="مقدّمو الطلب"
      [data]="t.people"
      [columns]="applicantColumns"
      [getRowId]="getId"
      [card]="card"
      [actions]="personActions"
    />`,
})
export class ApplicantsSection extends SectionBase {}
