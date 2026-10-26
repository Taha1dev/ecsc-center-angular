# Architecture

## Platform and applications

The workspace contains independently built Angular applications plus local libraries. The number of centers is open-ended: there is no shared closed union or fixed registry of identities. `angular.json` defines projects; npm workspaces link their packages; Turbo orders tasks and caches declared outputs.

Applications own assets, brand values, environment settings, catalog/demo definitions, reports, navigation, route extensions, integration implementations, and local features. These are legitimate app-specific choices. Sharing a feature does not make one application's palette, catalog, or workflow a platform requirement.

Use [the development guide](development-guide.md) for implementation examples. Each library README describes its public entry point and local conventions.

## Ownership and dependency direction

```text
apps -> core / ui / data-access / domain
core -> ui / data-access / domain
 data-access -> domain
ui -> domain (generic date utilities only)
domain -> no Angular or application code
```

- `domain`: types, validation, calculations, registry rules, and commands agreed to be shared; framework independent.
- `data-access`: adapter contracts, clients/stores, HTTP services, response mapping, and request state.
- `ui`: generic controls and display helpers, font imports, semantic styles, and local export utilities. No product store or application imports.
- `core`: shared product pages, layouts, transaction features, and typed rendering/composition contracts.
- `libs/ui`: private `@spartan-ng/helm` workspace with generated/owned Spartan primitives and secondary entry points.

Applications must not import another application's source. Cross-package imports use public entry points. Owned components under `packages` use one matching folder, one TS component, and one external HTML template. Spartan output keeps its own structure.

`check-boundaries.mjs` inspects static imports, exports, literal dynamic imports, and literal `require` calls. It rejects relative cross-app imports, forbidden package dependencies, private workspace imports, and invalid owned component structure. It also detects direct literal comparisons/switches on common center-ID property shapes without enumerating names. This is a bounded static guard, not complete data-flow analysis: indirect aliases, computed imports, and semantic misuse still require review.

## Composition contracts

`main.ts` calls `startCenter(centerModule, appConfig)`. `CenterModule` registers a profile, catalog, demo settings, reports, adapter, and optional pages, routes, navigation, capabilities, transaction sections, action presentations/forms, and inbox customization.

`defineCenter` validates references and registrations. Registry additions append, overrides replace known entries, and conflicts reject. `CENTER_MODULE` and `CENTER_DATA_CONFIG` make the selected module and adapter/catalog available through DI. The bootstrap establishes the document identity, metadata, direction, common HTTP providers, overlays, and router, then merges application providers using Angular's `mergeApplicationConfig`.

Extension contracts keep shared features independent of application imports. Apps supply configuration, components, adapters, and providers. Shared code does not select behavior by enumerating center IDs.

## Routing and its current limits

Apps own their extension registrations and can replace supported shared pages. Navigation is an independent menu tree. Its links do not grant access or create routes. See [center navigation](center-navigation.md).

The current shared router still supplies `/login`, `/centers/<id>`, and standard product destinations. `CenterRoute` supports `path`, `label`, `icon`, and `component`; it does not forward arbitrary Angular `Routes` options such as child routes, lazy loaders, guards, or route providers. A page replacement uses the existing route.

Completely independent URL trees are a future contract change, not a feature already implemented. Extend composition deliberately when requested; do not duplicate a shared page merely to work around an undocumented route assumption.

## Data integration

Each application provides its API configuration from its environment. Shared services inject `API_CONFIG`; they never import an application environment. Root-provided services need root/application configuration. See [API configuration](api-configuration.md) for setup and HTTP examples.

The current transaction features use `CenterDataAdapter`. The memory implementation contains sample records; a real backend implementation must preserve its contract or deliberately evolve it. Clients validate reads, publish loading/error/pending state, scope operations, and protect against stale responses. `CenterDataService` exposes client state as Signals and cleans up its subscription.

Different backend shapes may require different adapters even when a page is shared. Unique endpoints can remain in an app-owned service. Shared pages depend on a shared contract supplied by the app rather than importing that local implementation.

Demo data, authentication, fees, transitions, and sample APIs are not approved production rules. Preserve application behavior while adding explicitly requested integrations. Calendar-only values use local calendar components; timestamps use the configured display policy.

## Scaffolding and deletion

The center generator reads neutral project/package templates under `scripts/templates/center`, using root dependency versions for generated Angular package declarations. It does not clone an application's configuration. Defaults are starting options, not a universal identity or business specification.

Runtime app discovery reads configured applications with valid source files, ports, and outputs. The generator reserves ports from configured entries even while preparing files in memory. No center name list is needed. See [center generation](center-generator.md).

Deletion requires structural/path checks and an exact confirmation phrase. `center.deletionProtected: true` in an application's package manifest protects it, regardless of its ID. The currently protected examples retain that metadata; generated manifests explicitly record their generated status and default to unprotected.

## Builds and tooling

Library builds use ng-packagr and emitted dependency declarations; apps compile against source aliases. Turbo orders dependencies before their consumers. `prepare-helm-package.mjs` maintains metadata for Spartan secondary entries.

Turbo's global inputs include Angular configuration, root TypeScript configuration, PostCSS/component/lint configuration, relevant scripts/templates, and shared Helm sources. Package sources retain Turbo's normal inputs. Changing a shared global input deliberately invalidates task hashes across the workspace. Root package/lockfile hashing also follows Turbo's built-in rules. This favors correctness over narrow cache reuse.

[Validation](VALIDATION.md) documents exact test discovery and verification limits. [DESIGN](../DESIGN.md) owns current appearance rules; historical migration evidence lives in [the archive](archive/angular-migration.md).
