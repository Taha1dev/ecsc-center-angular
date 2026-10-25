import { Component } from '@angular/core';
@Component({
  selector: 'app-panel',
  host: { class: 'block min-w-0 rounded-panel border bg-card p-4 shadow-panel sm:p-5' },
  templateUrl: './panel.html',
})
export class AppPanel {}
