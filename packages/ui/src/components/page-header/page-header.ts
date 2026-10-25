import { Component, input } from '@angular/core';
@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.html',
})
export class AppPageHeader {
  readonly compact = input(false);
  readonly title = input.required<string>();
  readonly description = input('');
}
