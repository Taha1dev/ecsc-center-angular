# Service-center Angular workspace

Three independently runnable Arabic RTL applications reproduce the service-center product:

| Application | Identity              | Development           | Production preview    |
| ----------- | --------------------- | --------------------- | --------------------- |
| `apps/ecsc` | مركز البوابة          | http://localhost:5200 | http://127.0.0.1:5300 |
| `apps/m3`   | مركز المصالح العقارية | http://localhost:5201 | http://127.0.0.1:5301 |
| `apps/jus`  | مركز العدل            | http://localhost:5202 | http://127.0.0.1:5302 |

Use Node 24.15+ and npm 12.0.2. Angular, CLI and CDK are pinned to stable 22.2.3.

```sh
npm ci
npm run dev:ecsc
npm run dev:m3
npm run dev:jus
```

`npm start` starts ECSC. `npm run dev` starts all three through Turbo. Each application accepts blank demo login fields. The original React project is separate at `E:/Development/ecsc-center`; this workspace runs Angular without React.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run build:ecsc
npm run build:m3
npm run build:jus
npm run preview:ecsc
npm run preview:m3
npm run preview:jus
npm run test:e2e
```

Playwright uses installed Chrome locally. Install it with `npx playwright install chrome` if needed. For production browser validation, set `E2E_PRODUCTION=1` before running `npm run test:e2e`; the suite starts the built previews automatically.

The npm/Turbo monorepo has an Angular CLI multi-project workspace and four shared libraries:

- `packages/domain`: framework-independent contracts, Zod validation, workflow eligibility, commands, registry rules and calendar-only date utilities.
- `packages/data-access`: typed adapter, deterministic fixtures, report queries, stale-response-safe client and scoped Angular store.
- `packages/ui`: owned Helm components over Spartan Brain/CDK, semantic tokens, Alexandria typography, TanStack Angular Table, ECharts, Phosphor icons and local CSV/Excel exports.
- `packages/core`: application bootstrap, lazy routes, two shells, shared product features, transaction sections, typed forms and extensibility contracts.

Applications own their catalogs, reports, authentic assets, brand tokens and overrides. M3 supplies its own property-fields section. JUS retains the original sample catalog without introducing justice-service rules. There is no production authentication, backend or payment connection. Mutations affect the current in-memory session; reload and reset restore the deterministic reference fixtures.

Read [architecture](docs/ARCHITECTURE.md), [validation](docs/VALIDATION.md), [design](DESIGN.md), and the [migration record](docs/angular-migration.md) for implementation, measured parity coverage and validation results.
