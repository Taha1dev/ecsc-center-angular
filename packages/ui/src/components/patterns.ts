import { Component, computed, input } from '@angular/core';
import { AppIcon } from './icon';
export type Intent =
  'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'danger';
const badgeStyles: Record<Intent, string> = {
  neutral: 'bg-neutral-soft text-neutral-foreground border-neutral-border',
  primary: 'bg-primary-soft text-primary-soft-foreground border-primary/20',
  secondary: 'bg-secondary-soft text-secondary-soft-foreground border-secondary/20',
  success: 'bg-success-soft text-success-foreground border-success-border',
  warning: 'bg-warning-soft text-warning-foreground border-warning-border',
  info: 'bg-info-soft text-info-foreground border-info-border',
  danger: 'bg-danger-soft text-danger-foreground border-danger-border',
};
@Component({
  selector: 'app-status-badge',
  imports: [AppIcon],
  template:
    "<span [class]=\"classes()\"><app-icon [name]=\"intent()==='danger'?'phosphorWarningCircle':intent()==='success'?'phosphorCheckCircle':intent()==='warning'?'phosphorClock':intent()==='neutral'?'phosphorCircle':'phosphorInfo'\" size=\"16px\" />{{label()}}</span>",
})
export class AppStatusBadge {
  readonly label = input.required<string>();
  readonly intent = input<Intent>('neutral');
  readonly classes = computed(
    () =>
      'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm ' +
      badgeStyles[this.intent()],
  );
}
@Component({
  selector: 'app-panel',
  host: { class: 'block min-w-0 rounded-panel border bg-card p-4 shadow-panel sm:p-5' },
  template: '<ng-content />',
})
export class AppPanel {}
@Component({
  selector: 'app-page-header',
  template: `<div
    class="flex flex-wrap items-start justify-between gap-4"
    [class.mb-3]="compact()"
    [class.mb-6]="!compact()"
  >
    <div class="min-w-0">
      <h1 class="text-page-title font-semibold">{{ title() }}</h1>
      @if (description()) {
        <p class="mt-1 text-sm text-muted-foreground">{{ description() }}</p>
      }
      <ng-content select="[header-meta]" />
    </div>
    <div
      [class]="
        'flex flex-wrap gap-2 empty:hidden ' + (compact() ? 'w-full items-center lg:w-auto' : '')
      "
    >
      <ng-content />
    </div>
  </div>`,
})
export class AppPageHeader {
  readonly compact = input(false);
  readonly title = input.required<string>();
  readonly description = input('');
}
@Component({
  selector: 'app-empty-state',
  imports: [AppIcon],
  template: `<div class="flex flex-col items-center gap-3 py-12 text-center">
    <app-icon [name]="icon()" size="40px" class="text-muted-foreground" />
    <h3 class="font-semibold">{{ title() }}</h3>
    <p class="max-w-md text-sm text-muted-foreground">{{ description() }}</p>
    <ng-content />
  </div>`,
})
export class AppEmptyState {
  readonly title = input('لا توجد نتائج');
  readonly description = input('');
  readonly icon = input('phosphorFileText');
}
@Component({
  selector: 'app-loading',
  template:
    '<div role="status" class="space-y-3 py-6"><p class="text-sm text-muted-foreground">جارٍ التحضير…</p><div class="h-5 rounded bg-muted motion-safe:animate-pulse"></div><div class="h-24 rounded bg-muted motion-safe:animate-pulse"></div></div>',
})
export class AppLoading {}
@Component({
  selector: 'app-key-values',
  template: `<dl class="grid min-w-0 gap-x-6 gap-y-4 sm:grid-cols-2">
    @for (item of items(); track $index) {
      <div class="min-w-0">
        <dt class="text-xs text-muted-foreground">{{ item.label }}</dt>
        <dd class="mt-1 text-sm font-medium break-words">
          <bdi>{{ item.value }}</bdi>
        </dd>
      </div>
    }
  </dl>`,
})
export class AppKeyValues {
  readonly items = input.required<readonly { label: string; value: string | number }[]>();
}
@Component({
  selector: 'app-activity-timeline',
  template: `<ol class="space-y-5">
    @for (item of items(); track item.id) {
      <li class="relative border-s-2 border-primary/25 ps-5">
        <span class="absolute -start-1.5 top-2 size-2.5 rounded-full bg-primary"></span>
        <p class="text-sm font-medium">{{ item.title }}</p>
        <p class="text-xs text-muted-foreground">{{ item.date }}</p>
        @if (item.detail) {
          <p class="mt-1 text-sm text-muted-foreground">{{ item.detail }}</p>
        }
      </li>
    }
  </ol>`,
})
export class AppActivityTimeline {
  readonly items =
    input.required<
      readonly { id: string; title: string; date: string; actor?: string; detail?: string }[]
    >();
}

@Component({
  selector: 'app-entity-card',
  imports: [AppIcon],
  host: {
    class:
      'block min-w-0 overflow-hidden rounded-panel border bg-card shadow-panel focus-within:ring-2 focus-within:ring-ring/30',
  },
  template: `<div class="flex items-start gap-3 border-b bg-primary-soft/45 px-5 py-4">
      <span
        class="relative isolate flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-control bg-linear-to-tr from-primary to-[color-mix(in_oklab,var(--primary),black_30%)] text-white shadow-metric-icon before:pointer-events-none before:absolute before:inset-0 before:bg-linear-to-tr before:from-white/0 before:via-white/10 before:to-white/0"
        ><app-icon [name]="icon()" size="20px"
      /></span>
      <div class="min-w-0">
        <h3 class="font-semibold break-words">{{ title() }}</h3>
        @if (description()) {
          <p class="mt-1 text-sm text-muted-foreground">{{ description() }}</p>
        }
      </div>
    </div>
    @if (body()) {
      <div class="p-5"><ng-content /></div>
    }
    @if (actions()) {
      <div
        class="flex flex-wrap items-center justify-end gap-2 border-t bg-surface-subtle px-5 py-3"
      >
        <ng-content select="[card-actions]" />
      </div>
    }`,
})
export class AppEntityCard {
  readonly title = input.required<string>();
  readonly description = input('');
  readonly icon = input('phosphorFileText');
  readonly body = input(true);
  readonly actions = input(true);
}
