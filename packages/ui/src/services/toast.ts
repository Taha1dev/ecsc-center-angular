import { Injectable, signal } from '@angular/core';
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
