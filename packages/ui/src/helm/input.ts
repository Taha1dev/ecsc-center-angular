import { Directive } from '@angular/core';
@Directive({
  selector: 'input[hlmInput],select[hlmInput]',
  host: {
    class:
      'h-11 w-full min-w-0 rounded-control border border-input bg-card px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 disabled:opacity-50 aria-invalid:border-danger',
  },
})
export class HlmInput {}
@Directive({
  selector: 'textarea[hlmInput]',
  host: {
    class:
      'min-h-28 w-full rounded-control border border-input bg-card p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/25',
  },
})
export class HlmTextarea {}
