import { BreakpointObserver } from '@angular/cdk/layout';
import { CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import type { ConnectedPosition } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { AppIcon, HlmMenuTrigger } from '@workspace/ui';
import { map } from 'rxjs';
import { navItemActive, type ResolvedNavItem } from '../../navigation';

let navigationSerial = 0;
@Component({
  selector: 'app-center-navigation',
  imports: [NgTemplateOutlet, RouterLink, CdkMenu, CdkMenuItem, HlmMenuTrigger, AppIcon],
  templateUrl: './navigation.html',
})
export class CenterNavigation {
  readonly items = input.required<readonly ResolvedNavItem[]>();
  readonly base = input.required<string>();
  readonly mode = input<'sidebar' | 'navbar'>('sidebar');
  readonly collapsed = input(false);
  readonly compact = input(false);
  readonly mobile = input(false);
  readonly currentPath = input('');
  readonly counts = input({ personal: 0, group: 0 });
  readonly selected = output<void>();
  private readonly router = inject(Router);
  private readonly breakpoints = inject(BreakpointObserver);
  private readonly wide = toSignal(
    this.breakpoints.observe('(min-width: 1536px)').pipe(map((value) => value.matches)),
    { initialValue: this.breakpoints.isMatched('(min-width: 1536px)') },
  );
  readonly rail = computed(
    () =>
      !this.mobile() &&
      this.mode() === 'sidebar' &&
      (this.collapsed() || (this.compact() && !this.wide())),
  );
  readonly popup = computed(() => !this.mobile() && (this.mode() === 'navbar' || this.rail()));
  readonly expanded = signal<ReadonlySet<string>>(new Set());
  readonly prefix = `center-nav-${++navigationSerial}`;
  readonly linkClass =
    'flex min-h-11 items-center gap-3 rounded-control px-3 py-2 text-sm transition-colors duration-150 outline-none hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring';
  readonly menuClass =
    'flex min-h-11 w-full items-center gap-2.5 rounded-control px-3 py-2.5 text-start text-sm text-popover-foreground outline-none hover:bg-accent focus:bg-accent focus-visible:ring-1 focus-visible:ring-ring';
  readonly activeClass = ' bg-sidebar-selected font-medium text-sidebar-selected-foreground';
  readonly positions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 5 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -5 },
  ];
  readonly sidePositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -8 },
    { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 8 },
  ];

  constructor() {
    effect(() => {
      const current = this.currentPath();
      const collect = (items: readonly ResolvedNavItem[]): string[] =>
        items.flatMap((item) =>
          item.kind === 'group'
            ? [...(navItemActive(item, current) ? [item.id] : []), ...collect(item.children)]
            : [],
        );
      const active = collect(this.items());
      untracked(() => this.expanded.update((previous) => new Set([...previous, ...active])));
    });
  }
  active(item: ResolvedNavItem) {
    return navItemActive(item, this.currentPath());
  }
  count(item: ResolvedNavItem) {
    return item.kind === 'link' && item.badge ? this.counts()[item.badge] : undefined;
  }
  href(item: Extract<ResolvedNavItem, { kind: 'link' }>) {
    return this.base() + (item.path ? '/' + item.path : '');
  }
  toggle(id: string) {
    this.expanded.update((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  follow(item: Extract<ResolvedNavItem, { kind: 'link' }>) {
    // Let CDK close the complete menu stack and restore focus before removing a mobile sheet.
    setTimeout(() => {
      void this.router.navigateByUrl(this.href(item));
      this.selected.emit();
    }, 0);
  }
}
