import { Component } from '@angular/core';
import {
  AppActionMenu,
  AppEntityCard,
  AppKeyValues,
  AppStatusBadge,
  CollectionView,
} from '@workspace/ui';
import { SectionBase } from '../section-base';
@Component({
  selector: 'app-applicants-section',
  imports: [AppEntityCard, AppKeyValues, AppStatusBadge, AppActionMenu, CollectionView],
  templateUrl: './applicants.html',
})
export class ApplicantsSection extends SectionBase {}
