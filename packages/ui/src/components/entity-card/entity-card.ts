import { Component, input } from '@angular/core';
import { AppIcon } from '../icon/icon';
@Component({
  selector: 'app-entity-card',
  imports: [AppIcon],
  host: {
    class:
      'block min-w-0 overflow-hidden rounded-panel border bg-card shadow-panel focus-within:ring-2 focus-within:ring-ring/30',
  },
  templateUrl: './entity-card.html',
})
export class AppEntityCard {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly icon = input('phosphorFileText');
  readonly body = input(true);
  readonly actions = input(true);
}
