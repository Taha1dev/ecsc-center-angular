import { Component, computed } from '@angular/core';
import { AppEntityCard, HlmButton } from '@workspace/ui';
import { transactionActions } from '../../../../actions';
import { SectionBase } from '../section-base';
@Component({
  selector: 'app-actions-section',
  imports: [AppEntityCard, HlmButton],
  templateUrl: './actions.html',
})
export class ActionsSection extends SectionBase {
  readonly actions = computed(() =>
    transactionActions(this.module, this.t, (action) => this.open(action)),
  );
}
