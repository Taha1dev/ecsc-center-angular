import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast';
@Component({
  selector: 'app-toaster',
  templateUrl: './toaster.html',
})
export class AppToaster {
  readonly toast = inject(ToastService);
}
