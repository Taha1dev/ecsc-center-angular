import { OVERLAY_DEFAULT_CONFIG } from '@angular/cdk/overlay';
import { provideHttpClient } from '@angular/common/http';
import {
  inject,
  mergeApplicationConfig,
  provideBrowserGlobalErrorListeners,
  type ApplicationConfig,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Router, type Route, type Routes } from '@angular/router';
import { provideBrnDialogDefaultOptions } from '@spartan-ng/brain/dialog';
import { CenterApplication } from './layout/center-application/center-application';
import { defineCenter, provideCenter, type CenterModule } from './module';

export function centerRoutes(module: CenterModule): Routes {
  const pages = module.pages ?? {};
  const login: Route = pages.login
    ? { component: pages.login }
    : { loadComponent: () => import('./features/login/login').then((m) => m.LoginPage) };
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
      loadComponent: () => import('./layout/shell/shell').then((m) => m.AppShell),
      children: [
        {
          path: '',
          pathMatch: 'full',
          ...(pages.dashboard
            ? { component: pages.dashboard }
            : {
                loadComponent: () =>
                  import('./features/dashboard/dashboard').then((m) => m.DashboardPage),
              }),
        },
        {
          path: 'inbox/:scope',
          ...(pages.inbox
            ? { component: pages.inbox }
            : { loadComponent: () => import('./features/inbox/inbox').then((m) => m.InboxPage) }),
          canMatch: [(_route, segments) => ['group', 'personal'].includes(segments[1]?.path)],
        },
        {
          path: 'transactions/:id',
          ...(pages.transaction
            ? { component: pages.transaction }
            : {
                loadComponent: () =>
                  import('./features/transactions/transaction/transaction').then(
                    (m) => m.TransactionPage,
                  ),
              }),
        },
        {
          path: 'reports',
          ...(pages.reports
            ? { component: pages.reports }
            : {
                loadComponent: () =>
                  import('./features/reports/reports').then((m) => m.ReportsPage),
              }),
        },
        {
          path: 'design-system',
          ...(pages.designSystem
            ? { component: pages.designSystem }
            : {
                loadComponent: () =>
                  import('./features/design-system/design-system').then((m) => m.DesignSystemPage),
              }),
        },
        ...(module.routes ?? []).map((r) => ({ path: r.path, component: r.component })),
        {
          path: '**',
          loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFoundPage),
        },
      ],
    },
    {
      path: '**',
      loadComponent: () => import('./features/not-found/not-found').then((m) => m.NotFoundPage),
    },
  ];
}
export function startCenter(
  module: CenterModule,
  appConfig: ApplicationConfig = { providers: [] },
) {
  defineCenter(module);
  document.documentElement.lang = 'ar';
  document.documentElement.dir = 'rtl';
  document.documentElement.dataset['center'] = module.profile.id;
  document.title = module.profile.name + ' | مساحة الموظف';
  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (favicon) favicon.href = module.profile.favicon;
  const sharedConfig: ApplicationConfig = {
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
  };
  return bootstrapApplication(CenterApplication, mergeApplicationConfig(sharedConfig, appConfig));
}
