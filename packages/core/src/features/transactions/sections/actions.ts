import { Component, computed } from '@angular/core';
import { AppEntityCard, HlmButton } from '@workspace/ui';
import { transactionActions } from '../../../actions';
import { SectionBase } from './section-base';
@Component({
  selector: 'app-actions-section',
  imports: [AppEntityCard, HlmButton],
  template: `<div class="grid gap-4 sm:grid-cols-2">
    @for (a of actions(); track a.id) {
      <app-entity-card
        [title]="a.label"
        [description]="a.disabled ? a.reason || '' : 'إجراء توضيحي ضمن المركز والمعاملة الحالية'"
        [body]="false"
        ><button
          card-actions
          hlmBtn
          type="button"
          variant="outline"
          [disabled]="a.disabled"
          [title]="a.reason || ''"
          (click)="a.onSelect()"
        >
          فتح الإجراء
        </button></app-entity-card
      >
    }
  </div>`,
})
export class ActionsSection extends SectionBase {
  readonly actions = computed(() =>
    transactionActions(this.module, this.t, (action) => this.open(action)),
  );
}
