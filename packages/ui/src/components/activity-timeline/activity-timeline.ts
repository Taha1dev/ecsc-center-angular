import { Component, input } from '@angular/core';
@Component({
  selector: 'app-activity-timeline',
  templateUrl: './activity-timeline.html',
})
export class AppActivityTimeline {
  readonly items =
    input.required<
      readonly { id: string; title: string; date: string; actor?: string; detail?: string }[]
    >();
}
