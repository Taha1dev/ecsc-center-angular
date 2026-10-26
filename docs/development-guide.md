# Developing centers and shared libraries

This guide describes the current workspace and marks proposed changes separately. One center's behavior is not a rule for every center. Existing screens and sample data are a starting point; real business requirements still need to be defined.

## 1. Decide who owns the feature

| Location                   | Responsibility                                      | Example                              |
| -------------------------- | --------------------------------------------------- | ------------------------------------ |
| `apps/<center>/src`        | Center-specific pages, extensions, and integrations | Local page or custom form            |
| `packages/ui/src`          | General display components and UI pipes/directives  | Card, field, dialog                  |
| `packages/core/src`        | Shared product pages, features, and components      | Shared customer page                 |
| `packages/data-access/src` | Shared data services, state, and adapters           | API service or store                 |
| `packages/domain/src`      | Types and business rules independent of Angular     | Customer type or validation function |

Shared code does not have to be used by every application. A shared feature can be tried in one application before others adopt it. Sharing source files does not share runtime state between independently running apps.

Here, `core` means shared product features. It is not a general folder for all services.

## 2. Organize a feature

The following is an example for new code, not a request to move existing files:

```text
apps/<center>/src/features/customers/
  pages/
  components/
  services/
  pipes/
  directives/

packages/core/src/features/customers/
  pages/
  components/

packages/data-access/src/customers/
packages/domain/src/customers/

packages/ui/src/
  components/
  pipes/
  directives/

libs/ui/
  <spartan-component>/src/
```

Keep related feature code close together. Only general UI elements belong in `ui`. A component that understands customer workflows, transactions, or product permissions belongs in `core` or the application.

## 3. Generate files

Enable the workspace command once per PowerShell terminal:

```powershell
.\dev.ps1
```

Then use short commands:

```sh
ng g c customer-card
ng g s customers-api
ng g p display-name
ng g d busy
```

The wrapper asks whether the code belongs to **Centers** or **Packages**. Center choices are discovered from the registered applications that exist on disk.

For shared services, the default package is `data-access`; `core` is the other choice. For shared components, pipes, and directives, the default is `ui`; `core` is the other choice.

Services are always injectable and generated without tests. Pipes and directives also skip test files. Components created through the picker have separate TS/HTML files and skip tests by default.

You can skip the questions when you know the target:

```sh
ng g c --center-name=new-center customer-card
ng g page --center-name=new-center customers
ng g s customers-api --project=data-access
ng g p display-name --project=ui
ng g d busy --project=ui
```

Replace `new-center` with an existing application's ID. The shortcut `page` creates a component under `pages`; it does not register a route.

Common options:

- `--path`: select a folder. With a center selector it is relative to the center's `src`. With `--project` or the package picker it is relative to the repository root.
- `--style=css`: generate a component stylesheet. Center shortcuts default to `--style=none` because the project uses Tailwind.
- `--dry-run`: preview files without writing them.
- `--no-skip-tests`: create a component/page spec file. These specs are not executed by the current Node Vitest setup; see [test discovery](VALIDATION.md#unit-tests-and-generated-test-files). Services, pipes, and directives always skip tests through this wrapper.

Run `.\dev.ps1` once in each new PowerShell terminal before using `ng`. This enables the workspace picker and center shortcuts.

## 4. Create a center-specific component and page

```sh
ng g c --center-name=new-center customer-card --path=features/customers/components
ng g page --center-name=new-center customers --path=features/customers/pages
```

The component files are:

```text
apps/new-center/src/features/customers/components/customer-card/customer-card.ts
apps/new-center/src/features/customers/components/customer-card/customer-card.html
```

An example `customer-card.ts`:

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

In `customer-card.html`:

```html
<article class="rounded-panel border bg-card p-4">
  <p>{{ name() }}</p>
</article>
```

The page imports the component:

```ts
import { Component } from '@angular/core';
import { CustomerCard } from '../../components/customer-card/customer-card';

@Component({
  selector: 'app-customers',
  imports: [CustomerCard],
  templateUrl: './customers.html',
})
export class Customers {}
```

In `customers.html`:

```html
<h1>Customers</h1>
<app-customer-card name="Example customer" />
```

A child component needs an entry in the parent's `imports` and its selector in the template. It does not need a route or registration in `centerModule`. A page is also an Angular component; its role is usually to render at a route.

## 5. Register a local page

Add the page to `apps/new-center/src/routes.ts`, preserving existing entries:

```ts
import type { CenterPages, CenterRoute } from '@workspace/core';
import { Customers } from './features/customers/pages/customers/customers';

export const extensions: CenterRoute[] = [
  { path: 'customers', label: 'Customers', component: Customers },
];
export const pages: CenterPages = {};
```

The generated `config/module.ts` already passes `routes: extensions` and `pages`. The URL becomes `/centers/new-center/customers`.

A route label adds a menu link only when the application uses default navigation. With custom navigation, add its menu link separately. See [center navigation](center-navigation.md).

`pages` replaces a built-in page at its existing URL. For example, `pages.dashboard` replaces dashboard content rather than creating a new URL.

## 6. Routing ownership and limits

Applications own their extension registrations and navigation. The current shared router still supplies the common URL prefix and built-in destinations. It does not yet accept arbitrary app-owned Angular Routes arrays. See [the routing contract and limits](ARCHITECTURE.md#routing-and-its-current-limits) before using child routes, lazy loaders, guards, or route providers.

Do not register a second router over the existing bootstrap or document a proposed separation as implemented. Different center needs should lead to a deliberate contract change, not a copied UI library.

## 7. Build a general shared component

Run `ng g c status-card`, choose **Packages**, then **ui**. The files go under `packages/ui/src/components/status-card`.

In `status-card.ts`:

```ts
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-card',
  templateUrl: './status-card.html',
})
export class StatusCard {
  readonly title = input.required<string>();
  readonly description = input('');
}
```

In `status-card.html`:

```html
<section class="rounded-panel border bg-card p-4">
  <h2 class="font-semibold">{{ title() }}</h2>
  <p class="text-muted-foreground">{{ description() }}</p>
  <ng-content />
</section>
```

Export it from `packages/ui/src/index.ts`:

```ts
export * from './components/status-card/status-card';
```

Consumers import it from `@workspace/ui`, add it to `imports`, and use its selector. Use relative imports within one library and public package imports across library boundaries.

## 8. Build a shared product page

Choose **Packages**, then **core** when running the component/page picker. For a feature-specific location, use an explicit path:

```sh
ng g c customers-page --project=core --path=packages/core/src/features/customers/pages --inline-template=false --flat=false --style=none --skip-tests
```

Export the page from `packages/core/src/index.ts` when applications need it:

```ts
export { CustomersPage } from './features/customers/pages/customers-page/customers-page';
```

Each application can import it from `@workspace/core` and register it in its own routes. Internal feature components do not need public exports unless external consumers use them. A page existing in a library does not create a URL on its own.

## 9. Services and API access

Use `ng g s customers-api` and choose the target. For direct selection:

```sh
ng g s customers-api --project=data-access
ng g s customer-draft --center-name=new-center --path=features/customers/services
```

The wrapper supplies injectable generation, the service filename suffix, and test skipping.

A simple state service:

```ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CustomerDraftService {
  readonly search = signal('');
}
```

Use `inject(CustomerDraftService)` in the page. Services belong in dependency injection, not the component's `imports`. `providedIn: 'root'` gives each running Angular application its own instance, not one shared instance across the repository. For state owned by a particular page instance, provide the service on that page.

Shared API services inject `API_CONFIG` and use `HttpClient`. Each application provides the address from its environment through `app.config.ts`. Shared pages should not receive base URLs through inputs or import an application's environment file. See [API configuration](api-configuration.md) for the working JSONPlaceholder example and adapter guidance.

The common bootstrap already provides `HttpClient`. Packages must still declare direct dependencies for imports they use, including `@angular/common` for HTTP. Pure rules belong in `domain`, not an Angular service. Center-specific behavior stays local or is supplied through an adapter contract.

## 10. Pipes

Run `ng g p display-name`, choose **Packages**, then **ui**:

```ts
import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({ name: 'displayName' })
export class DisplayNamePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return value?.trim() || 'Unavailable';
  }
}
```

Export it from `packages/ui/src/index.ts`:

```ts
export * from './pipes/display-name.pipe';
```

Import it from `@workspace/ui` and add it to the consuming component's `imports`:

```html
{{ customerName | displayName }}
```

A local pipe can be generated with `ng g p short-reference --center-name=new-center`. A shared product-aware pipe belongs in `core`. Pipes should not make API calls or hide mutation rules.

## 11. Directives

Run `ng g d busy`, choose **Packages**, then **ui**:

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

Export it from `packages/ui/src/index.ts` and add it to `imports` where needed:

```html
<section [appBusy]="loading()">Page content</section>
```

This directive announces busy state; it does not disable clicks. A center-specific directive can be generated with `ng g d read-only --center-name=new-center`. Generating it does not automatically add it to every page.

## 12. Shared Spartan components

Brain provides behavior; Helm sources live in root `libs/ui`, generated with the `maia` style. Every center uses the same sources through `@spartan-ng/helm/<component>`. Do not reinstall them for each center.

```sh
ng g @spartan-ng/cli:ui accordion
```

Or run `ng g @spartan-ng/cli:ui` to choose multiple components. Do not select a center. `components.json` controls the output folder and alias.

For a button, import `HlmButton` from `@spartan-ng/helm/button`, add it to `imports`, and use `<button hlmBtn>Save</button>`. The existing `@workspace/ui` compatibility export refers to the same class. `AppField` and `AppSelect` compose these global primitives.

Keep official Spartan source structure, including its inline templates and generated icons. The matching-folder and external-HTML rule applies to owned components in `packages`. Shared styles connect Tailwind and the preset for all centers. Use `npm run typecheck:spartan` to check the primitives. Do not run a theme generator over existing center branding just to add a component.

Spartan CLI dependencies do not change the workspace's Angular CLI and Turbo orchestration. See the [Spartan guide](spartan-ui.md).

## 13. Dependencies and exports

- Applications may import `core`, `ui`, `data-access`, and `domain`.
- `core` may import the other three libraries.
- `data-access` may import `domain`.
- `ui` has no product services or data dependencies; its domain exception is generic date utilities.
- `domain` does not import Angular.
- Shared packages do not import applications, and applications do not import one another's source.
- Cross-package imports use public exports rather than private file paths.

Declare npm dependencies in the package that directly imports them and keep one root lockfile. A package being present in root `node_modules` does not make its components available in Angular templates.

`ng-package.json` controls a library's entry point and build output. It does not register components, services, or routes. Usually, adding a public component means updating `src/index.ts`, not changing `ng-package.json`.

## 14. Start with one center, then share confirmed behavior

1. Choose the first feature and distinguish sample behavior from real requirements.
2. Put general UI in `ui`.
3. Put confirmed shared rules/types in `domain`, and common reads, mutations, and state in `data-access`.
4. If a product page is already known to be shared, build it in `core` and enable it in one center first.
5. If sharing is uncertain, start locally. Extract the agreed common part later and update imports rather than copying it into a second app.
6. Keep routes, branding, and real differences in the applications. Supply variation through inputs, typed configuration, adapters, or providers.
7. Other centers can use the shared implementation with their own data and extensions. Sharing a page does not require identical route names or menu layouts.

## 15. Verification

These examples describe how to add code; they are not features automatically installed in the applications. The routing separation proposed above has not been implemented by this guide.

Use checks appropriate to the actual change:

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Add relevant browser checks for visual and workflow changes. See [VALIDATION.md](VALIDATION.md) for details.

References: [Angular CLI](https://angular.dev/cli/generate), [Angular routes](https://angular.dev/guide/routing/define-routes), and [Spartan CLI](https://spartan.ng/documentation/cli).
