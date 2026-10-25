import { Component } from '@angular/core';
import {
  AppEmptyState,
  AppEntityCard,
  AppKeyValues,
  CollectionView,
  HlmButton,
} from '@workspace/ui';
import { SectionBase } from '../section-base';
@Component({
  selector: 'app-parties-section',
  imports: [AppEntityCard, AppKeyValues, AppEmptyState, CollectionView, HlmButton],
  templateUrl: './parties.html',
})
export class PartiesSection extends SectionBase {}
