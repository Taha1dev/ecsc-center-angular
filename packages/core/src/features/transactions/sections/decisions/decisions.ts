import { Component } from '@angular/core';
import { AppActionMenu, AppEmptyState, AppEntityCard, HlmButton } from '@workspace/ui';
import { SectionBase } from '../section-base';
@Component({
  selector: 'app-decisions-section',
  imports: [AppEntityCard, AppEmptyState, AppActionMenu, HlmButton],
  templateUrl: './decisions.html',
})
export class DecisionsSection extends SectionBase {}
