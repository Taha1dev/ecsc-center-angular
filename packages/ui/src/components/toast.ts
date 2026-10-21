import { Component, inject, Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly message = signal('');
  readonly error = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;
  show(message: string, error = false) {
    clearTimeout(this.timer);
    this.error.set(error);
    this.message.set(message);
    this.timer = setTimeout(() => this.message.set(''), 4500);
  }
}
@Component({
  selector: 'app-toaster',
  template: `@if (toast.message()) {
    <div
      role="status"
      aria-live="polite"
      [class]="
        'fixed bottom-5 start-5 z-[1000] max-w-[calc(100vw-2.5rem)] rounded-panel border bg-card px-5 py-4 text-sm shadow-float ' +
        (toast.error() ? 'text-danger' : 'text-foreground')
      "
    >
      {{ toast.message() }}
    </div>
  }`,
})
export class AppToaster {
  readonly toast = inject(ToastService);
}
