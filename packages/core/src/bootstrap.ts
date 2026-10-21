import { OVERLAY_DEFAULT_CONFIG } from '@angular/cdk/overlay';
import { provideHttpClient } from '@angular/common/http';
import { Component, inject, provideBrowserGlobalErrorListeners } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Router, RouterOutlet, type Route, type Routes } from '@angular/router';
import { provideBrnDialogDefaultOptions } from '@spartan-ng/brain/dialog';
import { AppToaster } from '@workspace/ui';
import { defineCenter, provideCenter, type CenterModule } from './module';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppToaster],
  template: '<router-outlet /><app-toaster />',
})
export class CenterApplication {}
export function centerRoutes(module: CenterModule): Routes {
  const pages = module.pages ?? {};
  const login: Route = pages.login
    ? { component: pages.login }
    : { loadComponent: () => import('./features/login').then((m) => m.LoginPage) };
  return [
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    {
      path: 'login',
      ...login,
      canMatch: [
        () => {
          const target = inject(Router).currentNavigation()?.extractedUrl;
          const requested = target
            ? target.queryParams['center']
            : new URL(location.href).searchParams.get('center');
          return !requested || requested === module.profile.id;
        },
      ],
    },
    {
      path: 'centers/' + module.profile.id,
      loadComponent: () => import('./layout/shell').then((m) => m.AppShell),
      children: [
        {
          path: '',
          pathMatch: 'full',
          ...(pages.dashboard
            ? { component: pages.dashboard }
            : { loadComponent: () => import('./features/dashboard').then((m) => m.DashboardPage) }),
        },
        {
          path: 'inbox/:scope',
          ...(pages.inbox
            ? { component: pages.inbox }
            : { loadComponent: () => import('./features/inbox').then((m) => m.InboxPage) }),
          canMatch: [(_route, segments) => ['group', 'personal'].includes(segments[1]?.path)],
        },
        {
          path: 'transactions/:id',
          ...(pages.transaction
            ? { component: pages.transaction }
            : {
                loadComponent: () =>
                  import('./features/transactions/transaction').then((m) => m.TransactionPage),
              }),
        },
        {
          path: 'reports',
          ...(pages.reports
            ? { component: pages.reports }
            : { loadComponent: () => import('./features/reports').then((m) => m.ReportsPage) }),
        },
        {
          path: 'design-system',
          ...(pages.designSystem
            ? { component: pages.designSystem }
            : {
                loadComponent: () =>
                  import('./features/design-system').then((m) => m.DesignSystemPage),
              }),
        },
        ...(module.routes ?? []).map((r) => ({ path: r.path, component: r.component })),
        {
          path: '**',
          loadComponent: () => import('./features/not-found').then((m) => m.NotFoundPage),
        },
      ],
    },
    { path: '**', loadComponent: () => import('./features/not-found').then((m) => m.NotFoundPage) },
  ];
}
export function startCenter(module: CenterModule) {
  defineCenter(module);
  document.documentElement.lang = 'ar';
  document.documentElement.dir = 'rtl';
  document.documentElement.dataset['center'] = module.profile.id;
  document.title = module.profile.name + ' | مساحة الموظف';
  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (favicon) favicon.href = module.profile.favicon;
  return bootstrapApplication(CenterApplication, {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideHttpClient(),
      provideCenter(module),
      provideRouter(centerRoutes(module)),
      { provide: OVERLAY_DEFAULT_CONFIG, useValue: { usePopover: false } },
      provideBrnDialogDefaultOptions({
        backdropClass: 'app-dialog-backdrop',
        autoFocus: 'first-tabbable',
        restoreFocus: true,
      }),
    ],
  });
}
