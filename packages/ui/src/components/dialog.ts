import { Overlay } from '@angular/cdk/overlay';
import { Component, computed, inject, input, output } from '@angular/core';
import { BrnDialogImports } from '@spartan-ng/brain/dialog';
import { AppIcon } from './icon';
@Component({
  selector: 'app-dialog',
  imports: [BrnDialogImports, AppIcon],
  template: ` <brn-dialog
    [state]="open() ? 'open' : 'closed'"
    [positionStrategy]="position()"
    (stateChanged)="changed($event)"
    [restoreFocus]="true"
    [closeOnOutsidePointerEvents]="true"
  >
    <ng-template brnDialogContent>
      <section dir="rtl" [class]="panelClass()">
        <h2 brnDialogTitle class="pe-8 text-section-title font-semibold">{{ title() }}</h2>
        <p brnDialogDescription class="mt-1 text-sm text-muted-foreground">
          {{ description() || 'تفاعل محلي في النسخة التجريبية، لا يتم إرسال بيانات إلى خادم.' }}
        </p>
        <button
          type="button"
          aria-label="إغلاق"
          class="absolute end-3 top-3 flex size-11 items-center justify-center rounded-control hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
          (click)="closed.emit()"
        >
          <app-icon name="phosphorX" size="20px" />
        </button>
        <div class="mt-6"><ng-content /></div>
      </section>
    </ng-template>
  </brn-dialog>`,
})
export class AppDialog {
  private readonly overlay = inject(Overlay);
  readonly position = computed(() =>
    this.sheet()
      ? this.overlay.position().global().left('0').top('0')
      : this.overlay.position().global().centerHorizontally().centerVertically(),
  );
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly description = input('');
  readonly sheet = input(false);
  readonly wide = input(false);
  readonly closed = output<void>();
  readonly panelClass = computed(
    () =>
      'relative overflow-y-auto border bg-card p-5 shadow-float outline-none sm:p-6 ' +
      (this.sheet()
        ? 'h-svh max-h-svh w-[min(100vw,512px)] rounded-s-panel sm:m-3 sm:h-[calc(100svh-1.5rem)] sm:max-h-[calc(100svh-1.5rem)] sm:rounded-workspace'
        : 'max-h-[90svh] w-[calc(100vw-2rem)] rounded-panel sm:rounded-workspace ' +
          (this.wide() ? 'max-w-6xl' : 'max-w-xl')),
  );
  changed(state: string) {
    if (state === 'closed' && this.open()) this.closed.emit();
  }
}
