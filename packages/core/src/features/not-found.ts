import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppEmptyState, HlmButton } from '@workspace/ui';
import { CENTER_MODULE } from '../module';
@Component({
  selector: 'app-not-found',
  imports: [RouterLink, AppEmptyState, HlmButton],
  template:
    '<div class="p-8"><app-empty-state title="الصفحة أو المركز غير موجود" description="هذه النسخة مخصصة للمركز المحدد. تحقق من الرابط أو عد إلى مساحة العمل."><a hlmBtn [routerLink]="[\'/centers\',center.id]">{{center.name}}</a></app-empty-state></div>',
})
export class NotFoundPage {
  readonly center = inject(CENTER_MODULE).profile;
}
