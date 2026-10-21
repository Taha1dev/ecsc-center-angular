import { Component, computed, input } from '@angular/core';
import { AppIcon } from './icon';
@Component({
  selector: 'app-metric-card',
  imports: [AppIcon],
  host: { class: 'block min-w-0' },
  template: `<div [class]="classes()">
    <div class="mb-3 flex items-center gap-3">
      <p class="order-2 text-sm font-medium">{{ label() }}</p>
      <span [class]="well()"><app-icon [name]="icon()" size="20px" /></span>
    </div>
    <p class="text-metric font-semibold tabular-nums">{{ value() }}</p>
    <p class="mt-2 text-xs text-muted-foreground">{{ caption() }}</p>
    @if (comparison()) {
      <div class="mt-2 text-xs leading-loose text-muted-foreground">{{ comparison() }}</div>
    }
  </div>`,
})
export class AppMetricCard {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly caption = input('');
  readonly comparison = input('');
  readonly tone = input<'primary' | 'secondary' | 'violet' | 'cyan'>('primary');
  readonly icon = input('phosphorTray');
  readonly classes = computed(
    () =>
      'h-full min-w-0 rounded-panel border bg-card p-4 shadow-panel ' +
      {
        primary: 'border-primary/20',
        secondary: 'border-secondary/30',
        violet: 'border-chart-4/25',
        cyan: 'border-chart-3/25',
      }[this.tone()],
  );
  readonly well = computed(
    () =>
      'relative isolate flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-control bg-linear-to-tr text-white shadow-metric-icon before:pointer-events-none before:absolute before:inset-0 before:bg-linear-to-tr before:from-white/0 before:via-white/10 before:to-white/0 ' +
      {
        primary: 'from-primary to-[color-mix(in_oklab,var(--primary),black_30%)]',
        secondary: 'from-secondary to-highlight-700',
        violet: 'from-chart-4 to-[color-mix(in_oklab,var(--chart-4),black_30%)]',
        cyan: 'from-chart-3 to-[color-mix(in_oklab,var(--chart-3),black_30%)]',
      }[this.tone()],
  );
}
