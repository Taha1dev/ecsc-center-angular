import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppEmptyState, HlmButton } from '@workspace/ui';
import { CENTER_MODULE } from '../../module';
@Component({
  selector: 'app-not-found',
  imports: [RouterLink, AppEmptyState, HlmButton],
  templateUrl: './not-found.html',
})
export class NotFoundPage {
  readonly center = inject(CENTER_MODULE).profile;
}
