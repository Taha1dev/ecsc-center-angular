# Architecture

The workspace uses Angular CLI with standalone components, strict TypeScript and strict templates. Angular 22 supplies zoneless change detection and OnPush defaults. Signals hold synchronous state; computed values derive presentation; Router and RxJS manage route subscriptions. Typed Reactive Forms and ControlValueAccessor drive reusable application fields. Feature routes load lazily.

Every component in `packages` owns a matching folder containing `name.ts` and `name.html`, connected through `templateUrl`. Component files contain one component each; shared services and directives remain separate. Public library exports keep consumers independent of these internal paths. The root lint command checks this structure alongside import boundaries.

Official Spartan CLI output lives separately in `libs/ui/<primitive>/src`, with the `maia` style selected in root `components.json`. Import these shared primitives through `@spartan-ng/helm/<primitive>`. Generated upstream files retain their official structure; the folder/external-template rule above applies to owned components in `packages`. The shared stylesheet imports Spartan's preset and scans `libs/ui` for every center. Turbo includes these sources in its global cache inputs, and `npm run typecheck:spartan` checks them directly. See [Spartan usage](spartan-ui.md).

`libs/ui` is also a private npm workspace and Angular library with secondary entrypoints. Turbo builds it before `packages/ui`; library build tsconfigs resolve its emitted declarations while applications resolve the source aliases. Product field adapters compose these primitives rather than keeping a second Helm implementation. CLI additions receive ng-packagr metadata through `prepare-helm-package.mjs` at build time.

## Boundaries

`apps/* → core / ui / data-access / domain`; `core → ui / data-access / domain`; `data-access → domain`; `ui → domain` only for generic calendar utilities. Domain imports no framework or application code. UI does not know routes, centers, fixtures, schemas or stores. Shared product code does not import an app or branch on a center identifier.

`npm run lint` parses imports/re-exports/dynamic imports with the TypeScript AST and enforces these boundaries, public entry points and absence of obsolete React tooling. Every workspace declares its direct imports. npm workspaces link the libraries; Angular source paths support application compilation. ng-packagr builds each library against its dependency's declaration output. Turbo builds dependencies first and caches each project's own output directory.

## Center composition

`CenterModule.navigation` optionally owns the complete center navigation tree, independently of route definitions. Link/group entries render as inline disclosures, navbar menus or collapsed-rail menus using one shared renderer. Omitted navigation preserves legacy destinations and labeled extension routes. Missing icons receive separate defaults for standalone pages, groups and child links. Composition rejects duplicate IDs, empty groups and foreign/absolute paths. See [center navigation](center-navigation.md).

New centers can be scaffolded with `npm run center:new -- <id>`; see [the center generator guide](center-generator.md). The generator registers CLI/npm/Turbo tasks and creates app-owned configuration, brand tokens, neutral demo data and a browser smoke suite. Preview and Playwright server discovery use Angular application configuration rather than a fixed center list.

Each app's `src/main.ts` calls `startCenter(centerModule, appConfig)`. `src/config/module.ts` registers a profile, service catalog, demo settings, reports, adapter and optional rendering extensions. `defineCenter` reuses pure validation and rejects mismatched adapters, invalid service references, conflicting registry entries and conflicting routes. Center identifiers remain validated strings; adding an app does not require modifying a global union.

`CENTER_MODULE`, `CENTER_DATA_CONFIG` and `API_CONFIG` are typed DI contracts. Each application provides its API address through `src/app.config.ts`, using its own test/production environment files. Shared services inject the configuration without importing an application. `startCenter` merges application providers with its shared configuration through Angular's `mergeApplicationConfig`. See [API configuration](api-configuration.md). `startCenter` binds the validated identity, title, favicon and RTL direction before bootstrap. App-local HTML and CSS establish the correct initial brand before JavaScript loads. All overlays inherit the document's semantic tokens and RTL direction.

`CenterModule.sections` supports explicit add/override registrations with owned standalone section components, visibility predicates and counts. `actionForms` supports custom form components and typed command builders; reusable custom forms receive `context` and the typed form group. `defineActionForm` composes parsing with a command builder. App-owned inbox filter/column/matching descriptors, report definitions, extra routes and replacement pages use typed contracts. Rendering types remain outside the pure domain definitions. Registry conflicts reject rather than silently overwrite.

M3's property-fields override lives in `apps/m3/src/sections/property-fields.ts`. App-owned extra routes and page replacements are registered in `src/routes.ts`. The three real applications currently have no extra routes or replacement pages, as in the source product; synthetic registration tests cover these extension points.

## Data and mutations

The adapter interface remains the only data integration boundary. `createMemoryAdapter` owns isolated records for one center. `createDataClient` validates all reads, derives presentation, publishes loading/error/pending state, rejects foreign operations and prevents stale reads from replacing newer accepted results. `CenterDataService` bridges client snapshots into Signals and cleans up subscriptions.

Components call the store instead of reading fixtures directly. Accepted commands update only the intended record and append activity. Rejected commands leave data unchanged and forms open with their draft intact. Refresh failures preserve existing data and display an error. Reports retain request versions so late/cancelled previews cannot replace a newer selection. Retry and deliberately empty/error report samples remain intact.

The fixed fixture reference date is 2026-10-06. Calendar-only values serialize from local year/month/day; display does not route them through UTC timestamps. Actual event timestamps are formatted in Asia/Damascus. Reload restores the demo; reset targets only the current center.

## UI ownership

`packages/ui/src/styles/globals.css` is the canonical font/token definition. Each app imports Tailwind v4, globals and its brand CSS once through `src/styles.css`. Owned Helm components use semantic utility classes; there are no `::ng-deep` overrides or page-specific brand branches.

Spartan Brain supplies button, select, popover, dialog and accordion behavior; CDK supplies accessible menus, overlays and directionality. Locally owned Helm styles preserve approved geometry. AppDialog's sheet mode supplies the shared AppSheet equivalent. Common product patterns include AppField, AppDataTable, AppActionMenu, AppDialog, AppDateRangePicker, AppStatusBadge, AppChart and CollectionView. Transaction navigation and attention lists are shared product components.

Owned Helm menu/popover directives adapt public CDK/Brain positioning APIs to the approved collision gutter and RTL anchor. They retain the underlying menu stack, focus handling and overlay lifecycle. No library source or private member is patched.

Complex tables use TanStack Angular Table v9 with controlled pagination, sorting, visibility and true-only selection maps. Data references remain stable across state changes to prevent unwanted page resets. Collection views keep the table mounted while cards display so state survives mode changes.

ECharts is registered modularly and rendered with SVG through ngx-echarts. Legends affect presentation only; tables and exports include every series. ExcelJS loads lazily. CSV escapes spreadsheet formulas, Excel retains numbers and calendar dates with RTL worksheets, and PDF remains a preview/print workflow.
