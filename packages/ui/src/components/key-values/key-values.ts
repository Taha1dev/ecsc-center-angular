import { Component, input } from '@angular/core';
@Component({
  selector: 'app-key-values',
  templateUrl: './key-values.html',
})
export class AppKeyValues {
  readonly items = input.required<readonly { label: string; value: string | number }[]>();
}
