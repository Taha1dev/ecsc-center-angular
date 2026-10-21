import { NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CenterDataService } from '@workspace/data-access';
import { REFERENCE_LABEL } from '@workspace/domain';
import {
  AppActionMenu,
  AppActivityTimeline,
  AppDialog,
  AppEmptyState,
  AppIcon,
  AppLoading,
  AppStatusBadge,
  HlmButton,
  ToastService,
  type MenuAction,
} from '@workspace/ui';
import { filter } from 'rxjs';
import { CENTER_MODULE } from '../module';
@Component({
  selector: 'app-shell',
  imports: [
    NgTemplateOutlet,
    NgOptimizedImage,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    AppIcon,
    HlmButton,
    AppActionMenu,
    AppDialog,
    AppStatusBadge,
    AppActivityTimeline,
    AppLoading,
    AppEmptyState,
  ],
  templateUrl: './shell.html',
})
export class AppShell {
  readonly module = inject(CENTER_MODULE);
  readonly center = this.module.profile;
  readonly store = inject(CenterDataService);
  readonly router = inject(Router);
  readonly toast = inject(ToastService);
  readonly base = '/centers/' + this.center.id;
  readonly referenceLabel = REFERENCE_LABEL;
  readonly employee = this.module.catalog.employees.find(
    (e) => e.id === this.module.catalog.currentEmployeeId,
  )!;
  readonly shell = signal<'sidebar' | 'navbar'>(
    localStorage.getItem('shell') === 'navbar' ? 'navbar' : 'sidebar',
  );
  readonly collapsed = signal(false);
  readonly mobile = signal(false);
  readonly notifications = signal(false);
  readonly resetOpen = signal(false);
  readonly scrolled = signal(false);
  readonly url = signal(this.router.url);
  readonly navigation = [
    { path: '', label: 'الرئيسية', icon: 'phosphorHouse' },
    { path: 'inbox/personal', label: 'بريد المستخدم', icon: 'phosphorTray' },
    { path: 'inbox/group', label: 'بريد المجموعة', icon: 'phosphorUsers' },
    { path: 'reports', label: 'التقارير', icon: 'phosphorChartBar' },
    { path: 'design-system', label: 'نظام التصميم', icon: 'phosphorSquaresFour' },
    ...(this.module.routes ?? [])
      .filter((r) => r.label)
      .map((r) => ({ path: r.path, label: r.label!, icon: r.icon ?? 'phosphorFileText' })),
  ];
  readonly current = computed(
    () =>
      this.navigation.find(
        (n) => this.url().split('?')[0] === this.base + (n.path ? '/' + n.path : ''),
      )?.label || (this.url().includes('/transactions/') ? 'إدارة المعاملة' : 'مساحة الموظف'),
  );
  readonly compact = computed(
    () => this.url().includes('/transactions/') && this.shell() === 'sidebar' && !this.mobile(),
  );
  readonly mine = computed(
    () => this.store.transactions().filter((t) => t.ownerId === this.employee.id).length,
  );
  readonly accountActions = computed<MenuAction[]>(() => [
    {
      id: 'shell',
      icon: 'phosphorSquaresFour',
      group: { id: 'display', label: 'تفضيلات العرض' },
      label: 'طريقة العرض: ' + (this.shell() === 'sidebar' ? 'شريط علوي' : 'شريط جانبي'),
      onSelect: () => {
        const next = this.shell() === 'sidebar' ? 'navbar' : 'sidebar';
        this.shell.set(next);
        localStorage.setItem('shell', next);
      },
    },
    {
      id: 'reset',
      label: 'إعادة ضبط بيانات المركز',
      icon: 'phosphorArrowCounterClockwise',
      group: { id: 'account', label: 'إجراءات الحساب' },
      intent: 'danger',
      onSelect: () => this.resetOpen.set(true),
    },
    {
      id: 'logout',
      label: 'تسجيل الخروج',
      icon: 'phosphorSignOut',
      group: { id: 'account', label: 'إجراءات الحساب' },
      onSelect: () => {
        void this.router.navigate(['/login'], { queryParams: { center: this.center.id } });
      },
    },
  ]);
  readonly notificationItems = computed(() =>
    this.store
      .transactions()
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        title: t.type + ' · ' + t.id,
        date: t.received,
        detail: t.activity[0]?.title,
      })),
  );
  constructor() {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.url.set(this.router.url));
    const onScroll = () => this.scrolled.set(window.scrollY > 0);
    window.addEventListener('scroll', onScroll, { passive: true });
    inject(DestroyRef).onDestroy(() => window.removeEventListener('scroll', onScroll));
  }
  async reset() {
    try {
      await this.store.reset();
      this.resetOpen.set(false);
      this.toast.show('تمت استعادة بيانات المركز التجريبية');
    } catch {
      this.toast.show(this.store.mutationError() || 'تعذر تحديث المعاملة', true);
    }
  }
}
