import { computed, Directive, input } from '@angular/core';
import { BrnButton } from '@spartan-ng/brain/button';
import { twMerge } from 'tailwind-merge';
export type ButtonVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link';
@Directive({
  selector: 'button[hlmBtn],a[hlmBtn]',
  hostDirectives: [{ directive: BrnButton, inputs: ['disabled'] }],
  host: { '[class]': 'classes()', '[attr.data-slot]': '"button"' },
})
export class HlmButton {
  readonly class = input('');
  readonly variant = input<ButtonVariant>('default');
  readonly size = input<'default' | 'sm' | 'icon'>('default');
  readonly classes = computed(() =>
    twMerge(
      'group/button inline-flex shrink-0 items-center justify-center rounded-control border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-colors duration-150 outline-none select-none [--app-control-icon-size:1rem] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none ' +
        {
          default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
          outline:
            'border-border bg-card hover:bg-primary-soft hover:text-primary-soft-foreground aria-expanded:bg-primary-soft aria-expanded:text-primary-soft-foreground',
          secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary-hover',
          ghost:
            'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground',
          destructive: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
          link: 'text-primary underline-offset-4 hover:underline',
        }[this.variant()] +
        ' ' +
        { default: 'h-11 gap-2 px-4', sm: 'h-9 gap-1 px-3', icon: 'size-11' }[this.size()],
      this.class(),
    ),
  );
}
