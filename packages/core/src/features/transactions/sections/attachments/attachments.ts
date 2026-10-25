import { Component } from '@angular/core';
import {
  AppActionMenu,
  AppEmptyState,
  AppEntityCard,
  CollectionView,
  HlmButton,
} from '@workspace/ui';
import { SectionBase } from '../section-base';
@Component({
  selector: 'app-attachments-section',
  imports: [AppEntityCard, AppEmptyState, AppActionMenu, CollectionView, HlmButton],
  templateUrl: './attachments.html',
})
export class AttachmentsSection extends SectionBase {}
