# Service Center Workspace

An Angular project with several center applications in one repository. Each center has its own pages, routes, branding, and settings. Common code lives in shared packages so we can reuse it across centers.

Run all commands below from the **repository root**, where `package.json` lives.

## Run the project

Use Node.js 24.15 or newer within the 24.x release line, and npm 12. The project's npm version is listed in `package.json`.

After cloning the repository:

```sh
npm ci
```

In each new PowerShell terminal, enable the project's `ng` command:

```powershell
.\dev.ps1
```

Keep using that terminal for the commands below. This only sets up `ng` for the current terminal; it does not start the applications, install a global CLI, or change your PowerShell profile.

Start all centers:

```sh
npm run dev
```

Each center runs on a different port, usually starting at `5200`. The terminal shows each application's URL. The actual ports are configured in `angular.json`.

For day-to-day work, you can start just the center you need:

```sh
npm run dev:test-center
```

Replace `test-center` with the center ID you want to run. Use `npm run` to list the available scripts.

## Where should code go?

Before adding a feature, decide whether it belongs to one center or should be shared across centers. Several pages using a service within the same center does not automatically make it shared code.

| Folder                 | What belongs here                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `apps/<center>/src`    | Pages, components, services, routes, and settings owned by one center.                    |
| `packages/domain`      | Shared data types, business rules, and calculations that do not need Angular.             |
| `packages/data-access` | Shared API services, response mapping, and data loading/error state.                      |
| `packages/ui`          | General UI elements, such as cards, fields, and tables, without center-specific behavior. |
| `packages/core`        | Shared product pages, features, and layouts that bring UI and feature behavior together.  |
| `libs/ui`              | Spartan components available to all applications.                                         |
| `scripts`              | Project tools, including center creation, deletion, and generation shortcuts.             |
| `docs`                 | Detailed guides.                                                                          |

The folders in `packages` are local libraries, not center applications. Apps use them through names such as `@workspace/core` and `@workspace/data-access`. There is no need to publish them to npm.

A feature can start inside one center. Once its common behavior is clear, move that part into the appropriate shared package. Shared packages must not import files from a center application.

## Create a center

```sh
npm run center:new -- new-center
```

Choose a lowercase ID using Latin letters and hyphens. The generator first asks:

```text
Does this center have a defined visual identity? (y/n):
```

- `n`: skip the color questions and use the default identity: primary `#002623`, secondary `#988561`, and the shared `id.webp` image for both the logo and favicon.
- `y`: enter the primary and secondary colors as before. You can supply your own logo with `--logo`; otherwise, the generator creates a temporary marker.

It then asks for `Center name`, the display name.

The default source image lives in `assets/branding/default-center/id.webp`, alongside `brand.json` with its colors. The generator copies it into the new center's `public/brands/<center>/logo.webp`. Each application has its own `public/` folder; there is no global public folder served by every center. See [shared assets](assets/README.md).

For a preview without questions or file changes:

```sh
node scripts/create-center.mjs new-center --name "New Center" --visual-identity n --dry-run
```

It creates `apps/new-center`, including branding files, `routes.ts`, `navigation.ts`, API configuration, and test/production environments. It also adds run/build scripts and selects a port that is not already assigned in the workspace configuration.

New centers use the shared stars pattern on the login page by default, for both default and custom identities.

Start the new center:

```sh
npm run dev:new-center
```

Generated business data is illustrative; replace it with the center's actual content. If you selected a custom identity without supplying a logo, replace the temporary logo too. The following examples use `new-center`; replace it with any existing center ID when working on another app.

## Create a page or component in a center

After running `.\dev.ps1`, `ng` uses the project's local Angular CLI and center shortcuts. You do not need a global Angular CLI installation.

Create a page:

```sh
ng g page --center-name=new-center customers
```

Create a component:

```sh
ng g c --center-name=new-center customer-card
```

These commands create:

```text
apps/new-center/src/
├── pages/customers/
│   ├── customers.ts
│   └── customers.html
└── components/customer-card/
    ├── customer-card.ts
    └── customer-card.html
```

The shortcuts create separate TS and HTML files and skip test files by default. CSS files are optional because the project uses Tailwind. Options such as `--style=css`, `--path`, and `--dry-run` are explained separately below.

`page` is a project shortcut for creating a component under `pages`. It does not register a route automatically.

## Add the page to routes and navigation

After generating `customers`, import it in `apps/new-center/src/routes.ts`:

```ts
import { Customers } from './pages/customers/customers';
```

Add this entry to the existing `extensions` array, keeping the other routes:

```ts
{ path: 'customers', component: Customers }
```

The page is now available at:

```text
/centers/new-center/customers
```

To show it in a custom menu, add a link in `navigation.ts`:

```ts
{ kind: 'link', id: 'customers', label: 'Customers', path: 'customers' }
```

When `navigation` is `undefined`, the center uses the default menu. You can keep that menu and add `label: 'Customers'` to the route entry in `extensions` to show its link automatically. Alternatively, define a navigation array to control the whole menu.

`routes.ts` decides which page opens for a URL. `navigation.ts` decides how links appear in the menu. Centers can have different routes and menu layouts. See [center navigation](docs/center-navigation.md) for groups and nested links.

## Create a service, pipe, or directive

Run the command with a name:

```sh
ng g s customers-api
ng g p short-reference
ng g d busy
```

Each command asks where the code belongs:

```text
Where should this go?
  1. Centers - used by one center (default)
  2. Packages - shared code
```

Enter a number or the option name. Press Enter to accept the first option.

Choose **Centers** to see the applications registered in the workspace. The list is read each time you run the command, so newly created centers appear automatically. After you select a center, files go into its `src/services`, `src/pipes`, or `src/directives` folder.

Choose **Packages** to select a shared library:

| What you are creating | Default package                            | Other choice                       |
| --------------------- | ------------------------------------------ | ---------------------------------- |
| Service               | `data-access` for API calls and data state | `core` for shared feature behavior |
| Pipe or directive     | `ui` for general UI behavior               | `core` for shared product behavior |

Files go into the selected package's `src/services`, `src/pipes`, or `src/directives` folder. Services use `.service.ts` filenames, pipes use `.pipe.ts`, and directives use `.directive.ts`.

**Services are always injectable and generated without test files.** You do not need `--injectable` or `--skip-tests`. Pipes and directives also skip test files. The wrapper rejects options that turn these defaults off.

If you already know the destination, skip the questions:

```sh
ng g s customers-api --project=data-access
ng g s customer-draft --project=core
ng g p short-reference --center-name=new-center
ng g d busy --project=ui
```

Use `--path` only when you need a different folder. With a center selector the path is relative to its `src`; with `--project` or the package picker it is relative to the repository root.

The generator creates the starting files; you still write the behavior. Use `inject(...)` to access a service. Add a pipe or directive to the consuming component's `imports`. Export shared code from the package's `src/index.ts` when applications need to import it.

Plain types and functions in `domain` are regular TypeScript files and do not need an Angular generator.

## Create a shared component

```sh
ng g c customer-card
```

Choose **Packages**, then `ui` for a general UI component or `core` for a shared product feature. The default choice is `ui`. The component gets its own folder under `src/components`, with separate TS and HTML files and no test file by default.

The same command also supports **Centers** when the component belongs to a single application. Existing shortcuts such as `ng g c --new-center customer-card` still work without questions.

For a card generated in `ui`, export it from `packages/ui/src/index.ts`:

```ts
export * from './components/customer-card/customer-card';
```

Then import it in the application that needs it:

```ts
import { CustomerCard } from '@workspace/ui';
```

Add `CustomerCard` to the component's `imports`, then use the selector declared in its file. Shared pages that understand product behavior belong in `core`, rather than `ui`.

## Generation options

Start with the command you need, then add options when useful:

| Option                     | What it does                                                                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--new-center`             | Selects the center named `new-center` for a supported generator. Replace it with any center ID, such as `--test-center`.                         |
| `--center-name=new-center` | Another way to select a center without questions. Use this or `--new-center`, not both.                                                          |
| `--project=data-access`    | Selects an application or library without questions. The wrapper chooses the usual folder automatically for services, pipes and directives.      |
| `--path=...`               | Chooses the output folder. With a center shortcut it is relative to that center's `src`; with `--project` it is relative to the repository root. |
| `--style=css`              | Creates a CSS file alongside a page or component. Center shortcuts default to `--style=none`.                                                    |
| `--skip-tests`             | Skips the generated test file. Already enabled for the interactive generators; required for services, pipes and directives.                      |
| `--no-skip-tests`          | Includes the generated test file for a component or page. Not allowed for services, pipes or directives.                                         |
| `--injectable`             | Always enabled automatically for services; no need to pass it.                                                                                   |
| `--type=service`           | Already set to service or directive for those generators. Override only when you intentionally want another suffix.                              |
| `--type-separator=.`       | Already enabled for pipes, giving filenames such as short-reference.pipe.ts.                                                                     |
| `--dry-run`                | Shows which files would be generated without writing them.                                                                                       |

For example, create a page with a CSS file:

```sh
ng g page --new-center customers --style=css
```

Or choose a feature folder and preview the result:

```sh
ng g c --center-name=new-center customer-card --path=features/customers/components --dry-run
```

The name follows the center selector without a dash: `customers`, not `-customers`.

## Add a Spartan component

```sh
ng g @spartan-ng/cli:ui accordion
```

The files go into `libs/ui/accordion` and are available to every center. Add components as you need them.

```ts
import { HlmAccordionImports } from '@spartan-ng/helm/accordion';
```

Add `HlmAccordionImports` to your component's `imports`. See the [Spartan guide](docs/spartan-ui.md) for a complete example.

## Configure a center's API

```text
apps/<center>/src/
├── app.config.ts
└── environments/
    ├── environment.ts
    └── environment.production.ts
```

Set `apiBaseUrl` in both the test and production environment objects:

```ts
export const environment = {
  production: false,
  name: 'test',
  apiBaseUrl: 'https://api.example.com',
};
```

`app.config.ts` provides these settings to services. Read them inside a service with:

```ts
import { inject } from '@angular/core';
import { API_CONFIG } from '@workspace/data-access';

private readonly api = inject(API_CONFIG);
```

Use `this.api.baseUrl` to build request URLs. Pages call the service without needing to know the server address. When centers have different endpoint behavior or response shapes, provide an implementation that handles those differences behind a shared contract. Changing the URL alone does not translate the data.

Always import `environment.ts`. Production builds replace it with the production file automatically. Environment values are included in the browser bundle, so do not put passwords or private keys in them.

Layal and `test-center` have a working API example in their navigation menu. It requests posts, users, and todos from JSONPlaceholder. See [API configuration and the example](docs/api-configuration.md).

Current transaction data is kept in memory and resets when the app reloads. Login is also a demo. The API example does not connect the rest of the application to a backend.

## Build a center

```sh
npm run build:new-center
```

This builds the center and the libraries it depends on, without building the other centers. Importing components or services from `packages` is expected; the required code is included in the output.

The files to upload to your hosting service are in:

```text
dist/apps/new-center/browser/
```

Preview the production build locally:

```sh
npm run preview:new-center
```

Build a test version:

```sh
ng build new-center --configuration=test
```

Use `npm run build` to build all applications and libraries. When deploying, configure the host to return `index.html` for application routes so that direct links to pages work.

## Delete a generated center

```sh
npm run center:delete -- new-center
```

The tool lists what it will remove and asks you to type this exact phrase before continuing:

```text
delete new-center center
```

This tool is intended for generated centers. Some original applications are protected from deletion. Review the listed changes before confirming.

## Checks and further reading

| Command             | What it checks                           |
| ------------------- | ---------------------------------------- |
| `npm run typecheck` | TypeScript types and Angular templates.  |
| `npm run lint`      | Code rules and imports between packages. |
| `npm test`          | Logic tests.                             |
| `npm run test:e2e`  | Browser tests; requires Chrome.          |

Choose checks that fit the change you made. See the [validation guide](docs/VALIDATION.md) for details.

For more detail:

- [Project architecture](docs/ARCHITECTURE.md)
- [Center generator and its options](docs/center-generator.md)
- [Pages, components, and services](docs/development-guide.md)
- Package READMEs: [domain](packages/domain/README.md), [data-access](packages/data-access/README.md), [ui](packages/ui/README.md), and [core](packages/core/README.md)
- [AGENTS.md](AGENTS.md): instructions for coding agents working in this repository.

If `ng` reports an unknown center argument or does not recognize `page`, run `.\dev.ps1` again in that terminal. A global Angular CLI does not provide these shortcuts. Outside PowerShell, use `node scripts/ng.mjs` in place of `ng`.
