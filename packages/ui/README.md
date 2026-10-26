# UI

Generic display components, form wrappers, tables/charts, semantic styles, fonts, and export helpers. UI receives typed inputs and emits events; it does not know a center's catalog, routes, store, or business workflow.

## Public entry point

Import from `@workspace/ui` (`src/index.ts`). It exports the owned `App*` components, table/chart types, export helpers, toast service, and compatibility re-exports of selected global Helm primitives. Import official primitives directly through `@spartan-ng/helm/<primitive>` when appropriate.

## Source map

- `src/components`: general controls and display patterns, one folder and external HTML per owned component.
- `src/styles/globals.css`: canonical semantic tokens, typography, shared geometry, and font/preset imports.
- `src/lib`: non-component utilities such as local exports.
- `src/services`: UI-owned services.
- Root `libs/ui`: shared Spartan Helm source, not a second implementation under this package.

UI does not import core, data-access, or applications. Its current domain dependency is limited by convention to generic date helpers. Keep product-aware components in `core` or an application. Use semantic utilities and supplied display data rather than center-ID branches or duplicate themes.

Public exports are explicit in `src/index.ts`. The package build includes its shared CSS export; applications import it through their styles entry. See [design](../../DESIGN.md), [Spartan](../../docs/spartan-ui.md), and [development examples](../../docs/development-guide.md).
