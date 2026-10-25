# Data access

This package handles reading and changing data. Pages use it to load records, run commands, and observe loading or error state.

The current application uses an in-memory adapter and demo records. A real backend adapter would belong in this layer, behind the same contracts, rather than being called directly from page components.

Each center now provides its API address through `API_CONFIG`. Use `inject(API_CONFIG)` in a service instead of importing an application's environment file. See [API configuration](../../docs/api-configuration.md) for the setup and an HTTP service example.

## What goes here

- Adapters that read and update records.
- Clients that coordinate requests and mutations.
- Stores and Angular services that expose data to components.
- Mapping between external responses and domain types.
- Demo fixtures and report data used by the prototype.

The main files today are:

| Location                                 | Responsibility                                               |
| ---------------------------------------- | ------------------------------------------------------------ |
| `src/data/adapter.ts`                    | Adapter contracts and the in-memory implementation           |
| `src/data/client.ts`                     | Reads, mutations, request state, and stale-response handling |
| `src/store.ts`                           | The Angular service used by shared features                  |
| `src/data/fixtures.ts`                   | Demo transaction records                                     |
| `src/data/dashboard.ts` and `reports.ts` | Dashboard and report data helpers                            |
| `src/index.ts`                           | The public exports                                           |

## Adding something

An adapter interface or a plain client function is just a TypeScript file. Create it by hand.

Use Angular's generator when you actually need an injectable service:

```sh
ng g s customers --project=data-access --path=packages/data-access/src/customers --skip-tests
```

That command creates the service skeleton. You still decide how it gets its adapter, handles failures, and keeps its data scoped to the current center.

A feature can start small:

```text
src/customers/
  customer-adapter.ts
  customers.ts
```

There is no need for a separate mapper, store, and client until they have separate jobs.

## Keep the boundaries clear

This package can use `@workspace/domain`. It should not import components, layouts, or application configuration from a center.

Keep records, drafts, and pending operations scoped to the current center. Preserve useful data when a refresh fails, and prevent an older response from replacing a newer result.

Components decide what to display. Data-access reports what happened. For example, it can expose an error, but opening an error dialog or showing a toast is a UI decision.

Export the parts consumers need through `src/index.ts`:

```ts
import { CenterDataService } from '@workspace/data-access';
```

See [domain](../domain/README.md) for rules and types, and [core](../core/README.md) for the pages that use this data.
