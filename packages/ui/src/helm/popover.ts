import { Directive, forwardRef } from '@angular/core';
import { BrnOverlay, provideBrnOverlayDefaultOptions } from '@spartan-ng/brain/overlay';
import { BrnPopover, BRN_POPOVER_OVERLAY_DEFAULT_OPTIONS } from '@spartan-ng/brain/popover';

/** Keep the approved RTL anchor and push into view instead of switching horizontal edges. */
@Directive({
  selector: 'hlm-popover',
  providers: [
    { provide: BrnPopover, useExisting: forwardRef(() => HlmPopover) },
    { provide: BrnOverlay, useExisting: forwardRef(() => HlmPopover) },
    provideBrnOverlayDefaultOptions(BRN_POPOVER_OVERLAY_DEFAULT_OPTIONS),
  ],
})
export class HlmPopover extends BrnPopover {
  protected override getPositionStrategy() {
    const origin = this.getAttachTo();
    return origin
      ? this._positionBuilder
          .flexibleConnectedTo(origin)
          .withPositions(this.getAttachPositions().slice(0, 2))
          .withFlexibleDimensions(false)
          .withPush(true)
      : super.getPositionStrategy();
  }
}
