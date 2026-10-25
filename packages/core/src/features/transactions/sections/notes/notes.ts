import { Component } from '@angular/core';
import {
  AppActionMenu,
  AppEmptyState,
  AppEntityCard,
  AppStatusBadge,
  HlmButton,
} from '@workspace/ui';
import { SectionBase } from '../section-base';
@Component({
  selector: 'app-notes-section',
  imports: [AppEntityCard, AppStatusBadge, AppEmptyState, AppActionMenu, HlmButton],
  templateUrl: './notes.html',
})
export class NotesSection extends SectionBase {}
