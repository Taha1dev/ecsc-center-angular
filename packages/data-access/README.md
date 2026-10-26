# Data access

Shared data contracts, adapters, request coordination, HTTP services, response mapping, and stores. Components decide how to present results; this package reports data and state rather than opening dialogs or showing toasts.

## Public entry point

Import from `@workspace/data-access` (`src/index.ts`). The public API includes `CenterDataAdapter`, the memory adapter, `createDataClient`, `CenterDataService`, `CENTER_DATA_CONFIG`, `API_CONFIG`/`provideApiConfig`, fixture/report helpers, and the public sample-data service.

## Source map

- `src/data/adapter.ts`: integration contract and current in-memory implementation.
- `src/data/client.ts`: snapshots, commands, loading/error/pending/retry, and stale-response protection.
- `src/store.ts`: Angular Signals bridge and subscription cleanup.
- `src/config/api-config.ts`: application-supplied API configuration.
- `src/demo-api`: JSONPlaceholder example, separate from transaction data.
- `src/data/fixtures.ts`, `dashboard.ts`, and `reports.ts`: sample generators and derivations.

This package may use `domain`, not application files or UI components. Keep records, drafts, caches, and operations scoped. Failed refreshes preserve useful data, and late responses must not replace newer results. Runtime responses need validation/mapping; TypeScript types alone are not validation.

Real transaction integration belongs behind the adapter boundary. One base URL is enough only when endpoint contracts agree; applications may supply different implementations through a shared contract.

See [API setup](../../docs/api-configuration.md) for configuration and examples, [development](../../docs/development-guide.md) for service generation, and [domain](../domain/README.md) for pure rules.
