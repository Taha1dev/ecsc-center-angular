# Spartan UI in this workspace

The CLI is installed. The root `components.json` contains:

```json
{
  "componentsPath": "libs/ui",
  "importAlias": "@spartan-ng/helm",
  "style": "maia"
}
```

Maia controls the generated Helm style. Center colors and Alexandria typography come from the existing theme tokens. Generated components are shared across applications rather than installed in one center.

Inputs, textareas, selects, and outline buttons use `bg-card` for a light surface. In this workspace, `--input` is a border token and can be dark, so these controls do not use `bg-input/30` as their background. Primary and secondary buttons still use the center's brand colors.

## Add a component

Enable the workspace CLI once in a new PowerShell terminal:

```powershell
.\dev.ps1
```

From the repository root:

```sh
ng g @spartan-ng/cli:ui autocomplete
ng g @spartan-ng/cli:ui accordion
```

You can also use the local script without enabling the PowerShell shortcut:

```sh
node scripts/ng.mjs g @spartan-ng/cli:ui autocomplete
```

No center selector is needed. Autocomplete files go into `libs/ui/autocomplete/src`, and the public import is `@spartan-ng/helm/autocomplete`. Run `ng g @spartan-ng/cli:ui` to choose multiple components interactively.

Add components as needed. Existing UI code uses `button`, `input`, `textarea`, `popover`, and `select`, so their shared sources are already present. Do not choose `all` unless you intend to add every component.

The generator skips an element it considers installed. Its alias is used as evidence of installation, so do not delete a component folder while leaving an alias pointing to the missing files.

## Use it in any center

Accordion example:

```ts
import { Component } from '@angular/core';
import { HlmAccordionImports } from '@spartan-ng/helm/accordion';

@Component({
  selector: 'app-example',
  imports: [HlmAccordionImports],
  templateUrl: './example.html',
})
export class Example {}
```

In `example.html`:

```html
<hlm-accordion>
  <hlm-accordion-item>
    <hlm-accordion-trigger>More details</hlm-accordion-trigger>
    <hlm-accordion-content>Example content.</hlm-accordion-content>
  </hlm-accordion-item>
</hlm-accordion>
```

Autocomplete follows the same import pattern:

```ts
import { HlmAutocompleteImports } from '@spartan-ng/helm/autocomplete';
```

Add it to the consuming component's `imports`, then use the elements shown in Spartan's examples.

## Source organization and checks

- Keep generated `libs/ui` files in Spartan's structure, including inline templates. The matching-folder and external-HTML convention applies to owned components in `packages`.
- `packages/ui` contains wrappers such as `AppField` and `AppSelect` that compose shared Helm primitives. It does not maintain a duplicate Helm implementation. Compatibility exports from `@workspace/ui` refer to the same global components.
- `libs/ui` is a private npm workspace named `@spartan-ng/helm`. Turbo builds its entrypoints before `packages/ui`. `prepare-helm-package.mjs` prepares metadata for later CLI additions without moving generated source files.
- Application imports use `@spartan-ng/helm/<component>`. The VS Code settings prefer public aliases over long relative paths.
- `packages/ui/src/styles/globals.css` imports the preset and scans the shared Tailwind sources for current and future centers.
- Changes under `libs/ui` invalidate the relevant Turbo cache through `globalDependencies`.

Check Spartan sources on their own:

```sh
npm run typecheck:spartan
```

When no primitives have been installed, the check prints a message and skips rather than failing because there are no TypeScript files.

References: [Spartan CLI](https://spartan.ng/documentation/cli), [components.json](https://spartan.ng/documentation/components-json), and [Autocomplete](https://spartan.ng/components/autocomplete).
