import { CdkMenuTrigger, MENU_TRIGGER, PARENT_OR_NEW_MENU_STACK_PROVIDER } from '@angular/cdk/menu';
import { FlexibleConnectedPositionStrategy } from '@angular/cdk/overlay';
import { Directive, forwardRef } from '@angular/core';

/** Preserve the reference menu's 12px collision gutter through CDK's public strategy API. */
@Directive({
  selector: '[hlmMenuTrigger]',
  providers: [
    { provide: CdkMenuTrigger, useExisting: forwardRef(() => HlmMenuTrigger) },
    { provide: MENU_TRIGGER, useExisting: forwardRef(() => HlmMenuTrigger) },
    PARENT_OR_NEW_MENU_STACK_PROVIDER,
  ],
})
export class HlmMenuTrigger extends CdkMenuTrigger {
  override open() {
    super.open();
    const overlay = this.overlayRef;
    const strategy = overlay?.getConfig().positionStrategy;
    if (strategy instanceof FlexibleConnectedPositionStrategy) {
      // CDK 22's RTL push calculation subtracts both margins from the available width.
      // A half-gutter preserves the reference's 12px inset for pushed menus.
      strategy.withViewportMargin(12 / 2);
      overlay?.updatePosition();
    }
  }
}
