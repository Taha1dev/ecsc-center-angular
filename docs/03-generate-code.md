# 03 · Generate code and use it

[README](../README.md) · Previous: [Create a center](02-create-center.md) · Next: [Pages and navigation](04-pages-and-navigation.md)

Run the commands in this chapter from the repository root. In each new PowerShell terminal, start with:

```powershell
.\dev.ps1
```

The examples build a small customer card and a page that hosts it. For a command without a target, the first question is exactly:

```text
Where should this go?
  1. Centers — used by one center (default)
  2. Packages — shared code
Choose a number or name [1]:
```

Choose `Centers` (type `1` or `centers`). At `Choose a center:`, select `guide-center` by name or its displayed number. The choices come from registered applications with source folders on disk; their order is not a permanent registry.

Choosing `Packages` opens `Choose a package:`. Services offer `data-access — API and data services` (default) or `core — shared feature behavior`. Components, pages, pipes, and directives offer `ui — general UI code` (default) or `core — shared product features`. These are the picker choices, not every Angular project.

## Generating a Component

```sh
ng g c customer-card
```

Choose **Centers**, then **guide-center**. Open `apps/guide-center/src/components/customer-card/customer-card.ts`:

```ts
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-customer-card',
  templateUrl: './customer-card.html',
})
export class CustomerCard {
  readonly name = input.required<string>();
}
```

In the adjacent `customer-card.html`:

```html
<article class="rounded-panel border bg-card p-5">
  <h2 class="font-semibold">Customer</h2>
  <p class="mt-2">{{ name() }}</p>
</article>
```

The component accepts display data. Generate its parent page next, then import it into that page and use `<app-customer-card [name]="'Nour'" />` as shown below.

For a generic shared card, select **Packages → ui** instead. The files go to `packages/ui/src/components/customer-card/`. Export it from `packages/ui/src/index.ts` with `export * from './components/customer-card/customer-card';`, then import `CustomerCard` from `@workspace/ui` in the consumer. A shared product-aware component belongs in **core** instead. See [ownership](01-workspace.md#import-across-packages).

## Generating a Page

```sh
ng g page getting-started
```

Choose **Centers → guide-center**. This creates `apps/guide-center/src/pages/getting-started/getting-started.ts` and `.html`. Replace the TS with this complete parent:

```ts
import { Component } from '@angular/core';
import { CustomerCard } from '../../components/customer-card/customer-card';

@Component({
  selector: 'app-getting-started',
  imports: [CustomerCard],
  templateUrl: './getting-started.html',
})
export class GettingStarted {}
```

In `getting-started.html`:

```html
<section dir="ltr" class="space-y-5">
  <h1 class="text-page-title font-semibold">Getting started</h1>
  <app-customer-card [name]="'Nour'" />
</section>
```

`page` is a shortcut for a component under `pages/`. It creates neither a URL nor a menu entry. [Chapter 04](04-pages-and-navigation.md) registers this page and shows a final version using the helpers below. Until then, the generated page is not reachable by URL. Do not generate the same file twice.

## Generating a Service

Now give the page a little local draft state:

```sh
ng g s customer-draft
```

Choose **Centers → guide-center**. Open `apps/guide-center/src/services/customer-draft.service.ts`:

```ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CustomerDraftService {
  readonly name = signal('  Nour  ');
  readonly saving = signal(false);
}
```

In `getting-started.ts`, extend the Angular import with `inject`, import `CustomerDraftService` from `../../services/customer-draft.service`, and add `readonly draft = inject(CustomerDraftService);` inside `GettingStarted`. Then change the card binding to `[name]="draft.name()"`. The name now comes from the service.

Services use dependency injection; do not put them in a component's `imports`. `providedIn: 'root'` gives each running application its own instance. Use a component-level `providers` entry for state that should belong to each page instance.

For a shared API service, choose **Packages → data-access**; its default folder is `packages/data-access/src/services/`. Shared feature state can go in **core**, under `packages/core/src/services/`. Export shared services through their package entry point. The complete HTTP example follows in [chapter 05](05-data-and-api.md).

## Generating a Pipe

```sh
ng g p display-name
```

Choose **Centers → guide-center**. Replace `apps/guide-center/src/pipes/display-name.pipe.ts` with:

```ts
import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({ name: 'displayName' })
export class DisplayNamePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return value?.trim() || 'Unavailable';
  }
}
```

Import `DisplayNamePipe` from `../../pipes/display-name.pipe` in the page and add it to the decorator's `imports`. Use `[name]="draft.name() | displayName"` on the card. The surrounding spaces disappear, and blank values show `Unavailable`.

For a shared display pipe, choose **Packages → ui**; the default file is `packages/ui/src/pipes/display-name.pipe.ts`. Product-specific shared pipes can use **core**. Export it through the package's `src/index.ts` before importing it by package name.

## Generating a Directive

```sh
ng g d busy
```

Choose **Centers → guide-center**. Open `apps/guide-center/src/directives/busy.directive.ts`:

```ts
import { Directive, input } from '@angular/core';

@Directive({
  selector: '[appBusy]',
  host: { '[attr.aria-busy]': 'appBusy() ? "true" : null' },
})
export class BusyDirective {
  readonly appBusy = input(false);
}
```

Import `BusyDirective` from `../../directives/busy.directive`, add it to the page's `imports`, and put `[appBusy]="draft.saving()"` on its `<section>`. This exposes busy state to assistive technology; it does not disable clicks.

For a generic shared directive, choose **Packages → ui**; the default file is `packages/ui/src/directives/busy.directive.ts`. Use **core** for shared product behavior. Export it through that package before consuming it elsewhere.

## Adding a Spartan Component

Add only the primitive you need, from the root:

```sh
ng g @spartan-ng/cli:ui button
```

This command uses Spartan's generator, not the Centers/Packages picker. The root `components.json` selects `libs/ui`, the public alias `@spartan-ng/helm`, and the `maia` style. Button source lives in `libs/ui/button/src/lib`; it is already installed in this checkout, so the command may skip it. Never choose `all` just to add one control.

In the page's TS, import `HlmButton` from `@spartan-ng/helm/button` and add it to `imports`. Use:

```html
<button hlmBtn type="button" (click)="draft.name.set('Nour')">Reset name</button>
```

The button uses the shared primitive and active center tokens. The complete consuming page is in [chapter 04](04-pages-and-navigation.md#finish-the-page). Another primitive follows the same pattern: `ng g @spartan-ng/cli:ui accordion`, `HlmAccordionImports` from `@spartan-ng/helm/accordion`, then add that array to component `imports` and use the generated accordion elements.

Official Helm sources keep their generated structure and inline templates. Owned components in `packages` use matching folders and separate TS/HTML. UI wrappers compose the same global primitives; they are not a second Helm implementation. Theme colors and fonts still come from center/shared styles.

## Skip the questions

After trying the picker, use explicit targets for daily work. Run these from the root, only for names you have not already generated:

```sh
ng g c --center-name=guide-center another-card
ng g page --guide-center another-page
ng g s another-api --project=data-access
ng g p another-label --project=ui
ng g d another-state --center-name=guide-center
```

`--center-name=<id>` and `--<id>` select a center. `--project=<name>` selects an Angular project directly. Choose one target form per command. With a center selector, the name has no leading dash.

## Optional flags and paths

| Option | Meaning |
| --- | --- |
| `--path=features/customers/components` with a center selector | Relative to that center's `src`; traversal outside it is rejected |
| `--path=packages/ui/src/components` with a package target/picker | Relative to the repository root |
| `--style=css` | Add a component/page stylesheet; center shortcuts and picker defaults use no CSS file |
| `--dry-run` | Preview files without writing them |
| `--no-skip-tests` | Request a component/page spec; it does not configure a test runner |

For example, `ng g c --center-name=guide-center address-card --path=features/customers/components --style=css --dry-run` previews a nested component. Direct Angular `--project` component generation uses the project's schematics defaults; it does not apply every interactive wrapper default.

Services are always injectable and services/pipes/directives always skip specs through this wrapper. Components/pages skip specs by default. Generated `*.spec.ts` files are not part of the current Node Vitest suite; [chapter 06](06-build-and-check.md#what-the-checks-cover) explains actual discovery.

[README](../README.md) · Previous: [Create a center](02-create-center.md) · Next: [Pages and navigation](04-pages-and-navigation.md)
