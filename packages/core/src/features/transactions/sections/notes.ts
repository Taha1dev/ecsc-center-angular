import { Component } from '@angular/core';
import {
  AppActionMenu,
  AppEmptyState,
  AppEntityCard,
  AppStatusBadge,
  HlmButton,
} from '@workspace/ui';
import { SectionBase } from './section-base';
@Component({
  selector: 'app-notes-section',
  imports: [AppEntityCard, AppStatusBadge, AppEmptyState, AppActionMenu, HlmButton],
  template: `@if (t.notes.length) {
      <div class="space-y-4">
        @for (n of t.notes; track n.id) {
          <app-entity-card [title]="n.author" description="٦ تشرين الأول ٢٠٢٦ · ملاحظة داخلية"
            ><p class="mb-3 text-sm leading-loose">{{ n.text }}</p>
            <app-status-badge
              [label]="n.resolved ? 'تم الحل' : 'مفتوحة'"
              [intent]="n.resolved ? 'success' : 'neutral'" /><app-action-menu
              card-actions
              [actions]="noteActions(n)"
          /></app-entity-card>
        }
      </div>
    } @else {
      <app-empty-state
        title="لا توجد ملاحظات"
        description="اكتب ملاحظة داخلية لتوثيق المتابعة المحلية."
        icon="phosphorNotePencil"
        ><button hlmBtn type="button" (click)="open('note')">إضافة ملاحظة</button></app-empty-state
      >
    }`,
})
export class NotesSection extends SectionBase {}
