# UI

This package contains the controls and display components we share across the applications. They receive values and emit events; they do not decide which center is active or fetch transaction records.

Examples include a field, a table, a dialog, a chart, and an empty state.

## Where things live

| Location                 | Contents                                                |
| ------------------------ | ------------------------------------------------------- |
| `src/components/`        | Shared components and the adapters that compose them    |
| `src/services/`          | UI services, such as the toast service                  |
| `src/styles/globals.css` | Shared fonts, semantic tokens, and Tailwind integration |
| `src/lib/`               | Supporting utilities, including local exports           |
| `src/index.ts`           | The public exports                                      |

Domain-specific actions and transaction rules belong in core or domain. A component that knows how to process a refund is more than a generic UI control.

## Adding a component we own

Run this from the repository root:

```sh
ng g c status-card --project=ui --path=packages/ui/src/components --flat=false --inline-template=false --style=none --skip-tests
```

It creates:

```text
src/components/status-card/
  status-card.ts
  status-card.html
```

Keep one component per folder, with its template in the HTML file. Use the existing semantic color utilities so the component picks up each center's brand.

To make it available outside this package, add this to `src/index.ts`:

```ts
export * from './components/status-card/status-card';
```

Consumers can then import `StatusCard` from `@workspace/ui` and add it to their component's `imports`.

Angular pipes and directives can also be generated with `ng g p` and `ng g d`. A plain formatting function or a type can be written by hand.

## Spartan components

Official Spartan Helm files live in [libs/ui](../../libs/ui), outside this package. Add only the primitive you need:

```sh
ng g @spartan-ng/cli:ui accordion
```

Import it through its public alias:

```ts
import { HlmAccordionImports } from '@spartan-ng/helm/accordion';
```

The CLI uses the `maia` style from the root `components.json`. Keep those generated files in their official location.

Our `AppSelect`, for example, composes the global Helm select primitives and exposes the field API used by the product. It does not keep a second copy of Helm. Existing button and input exports from `@workspace/ui` also point to the global implementations.

The separate HTML and folder rule applies to our components in `packages`; generated Spartan files keep their upstream structure.

See the [Spartan guide](../../docs/spartan-ui.md) for setup and usage, or [core](../core/README.md) for shared product features.
