import { Component, input } from '@angular/core';
import { AppIcon } from '../icon/icon';
@Component({
  selector: 'app-empty-state',
  imports: [AppIcon],
  templateUrl: './empty-state.html',
})
export class AppEmptyState {
  readonly title = input('لا توجد نتائج');
  readonly description = input('');
  readonly icon = input('phosphorFileText');
}
