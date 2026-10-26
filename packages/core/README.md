# Core

Shared product features and application composition. This is not a catch-all service folder. Its current login, dashboard, inbox, transaction, report, and shell implementations are reusable defaults, not mandatory business requirements for every center.

## Public entry point

Import from `@workspace/core` (`src/index.ts`). Important exports include `startCenter`, `defineCenter`, the `CenterModule`/profile/route/page contracts, navigation types/helpers, default sections, and the shared API example page.

## Source map

- `src/module.ts`: typed composition and rendering registrations.
- `src/bootstrap.ts`: shared bootstrap and current route construction.
- `src/navigation.ts`: menu contracts, defaults, validation, and matching.
- `src/layout`: root, shells, and shared menu rendering.
- `src/features`: shared product pages and feature-specific components.
- `src/components`: supporting product components.

Core may use `ui`, `data-access`, and `domain`. It never imports an application or branches on a named center. Apps supply typed configuration, adapters, providers, components, and extensions. Owned components use matching folders and separate TS/HTML files.

Register shared pages from an application; exporting a component does not create a route. Current Router limitations are in [architecture](../../docs/ARCHITECTURE.md). Practical examples belong in [development](../../docs/development-guide.md); generic display components belong in [UI](../ui/README.md), data state in [data-access](../data-access/README.md), and pure rules in [domain](../domain/README.md).
