# Core

This package contains the parts of the product that centers share: the login screen, dashboard, inbox, transaction workspace, reports, and application shell.

Core brings the other packages together. It gets data from data-access, uses domain types and rules, and renders controls from UI or the global Spartan library.

## Where things live

| Location                                  | Contents                                                      |
| ----------------------------------------- | ------------------------------------------------------------- |
| `src/features/`                           | Shared pages and feature code                                 |
| `src/features/transactions/sections/`     | The transaction sections                                      |
| `src/components/`                         | Product components used by several features                   |
| `src/layout/`                             | The application root, shell, and navigation renderer          |
| `src/module.ts`                           | The center configuration contract and rendering registrations |
| `src/bootstrap.ts`                        | Application startup and the shared routes                     |
| `src/navigation.ts`                       | Navigation types, defaults, and matching helpers              |
| `src/actions.ts` and `action-builders.ts` | Action presentation and command construction                  |
| `src/index.ts`                            | The public exports                                            |

## Adding a shared page or component

For example, to start a shared customer page:

```sh
ng g c customers-page --project=core --path=packages/core/src/features/customers/pages --flat=false --inline-template=false --style=none --skip-tests
```

It creates:

```text
src/features/customers/pages/customers-page/
  customers-page.ts
  customers-page.html
```

Keep one component per folder and use an external HTML template. Put smaller components that only serve this feature near the page, under the same feature folder.

If a center needs to import the page, export it from `src/index.ts`:

```ts
export { CustomersPage } from './features/customers/pages/customers-page/customers-page';
```

The center can then import it from `@workspace/core` and register it in its own `src/routes.ts`. Adding a component to core does not automatically add a route or a menu link to every center.

Use `ng g` for Angular components, injectable services, directives, and pipes. Write configuration objects, command helpers, and plain functions by hand.

## What stays in an application

Each center owns its identity, assets, brand values, service catalog, demo settings, route additions, and targeted overrides.

Core accepts those choices through configuration and registration. It should not import a center's files or contain branches such as `if (center.id === '...')` to choose a particular center's implementation.

A page needed by just one center can stay in `apps/<center>/src/pages`. Move it here when there is a useful shared implementation, with the differences passed in explicitly.

For generic controls, see [UI](../ui/README.md). For data loading and state, see [data-access](../data-access/README.md). Rules that do not need Angular belong in [domain](../domain/README.md).
