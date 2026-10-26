# 01 · Find a home for your code

[README](../README.md) · Previous: [Start here](../README.md) · Next: [Create a center](02-create-center.md)

Suppose you are adding customers to one center. Start its page, form, and unique API service in `apps/<center>/src/features/customers/`. Several pages using a service does not make it shared across centers.

When another center needs the same behavior, move the agreed common part into a package. Keep differences in the application's configuration or behind an adapter.

| Location | Put this here | Customer example |
| --- | --- | --- |
| `apps/<center>/src` | One center's pages, integrations, and settings | Its customer search page |
| `packages/ui` | Generic controls and presentation | A card accepting a name and emitting a click |
| `packages/core` | Shared product features and layouts | A reusable customer workspace |
| `packages/data-access` | Shared services, adapters, and request state | A common customer API contract |
| `packages/domain` | Types and rules without Angular | Customer types and agreed validation |
| `libs/ui` | Spartan Helm primitives | Button, input, accordion |

Write ordinary TypeScript files in `domain`; an Angular generator is unnecessary there. Existing catalogs and transaction samples describe the demo, not every center's business rules.

## How the app starts

Open an application's `src/main.ts`. It imports `appConfig` and `centerModule`, then calls `startCenter(centerModule, appConfig)`.

1. `src/app.config.ts` reads the application's environment and provides API settings.
2. `src/config/module.ts` combines its profile, catalog, demo settings, reports, adapter, routes, pages, and navigation through `defineCenter`.
3. Shared `startCenter`, in `packages/core/src/bootstrap.ts`, sets the document identity/RTL, registers HTTP and routing, merges application providers, and bootstraps the root component.

The application supplies the choices; packages supply implementations and contracts. Changing one app's menu or adapter does not require editing another app.

## Import across packages

Use public package names:

```ts
import { defineCenter } from '@workspace/core';
import { API_CONFIG } from '@workspace/data-access';
import { AppIcon } from '@workspace/ui';
```

These names resolve to each package's `src/index.ts`. Export a new shared symbol there before an application imports it. Within the same app or package, use relative imports. Do not reach into another application's files or a package's private folder from a consumer.

Dependencies flow in this direction:

```text
apps        -> core, ui, data-access, domain
core        -> ui, data-access, domain
data-access -> domain
ui          -> domain (generic date helpers only)
domain      -> no Angular or application code
```

A shared page can inject a contract implemented by an application. It cannot import that application's service directly or switch behavior by a known center ID. Declare external libraries in the owning package's dependencies, even when npm has hoisted them at the root.

The package READMEs are local reference cards: [UI](../packages/ui/README.md), [core](../packages/core/README.md), [data access](../packages/data-access/README.md), and [domain](../packages/domain/README.md).

Now that the folders have a purpose, create the example center.

[README](../README.md) · Previous: [Start here](../README.md) · Next: [Create a center](02-create-center.md)
