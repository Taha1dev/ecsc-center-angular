import { Component } from '@angular/core';
import {
  AppActionMenu,
  AppEmptyState,
  AppEntityCard,
  AppStatusBadge,
  CollectionView,
  HlmButton,
} from '@workspace/ui';
import { SectionBase } from '../section-base';
@Component({
  selector: 'app-refunds-section',
  imports: [AppEntityCard, AppStatusBadge, AppEmptyState, AppActionMenu, CollectionView, HlmButton],
  templateUrl: './refunds.html',
})
export class RefundsSection extends SectionBase {}
