# Angular Workspace

This file tells coding agents how to work in this repository: clarify ownership, choose where code belongs, connect features to data and routing, and verify changes. It is not a center list, brand guide, or record of the initial prototype.

Write all Markdown documentation in English, including headings, comments, and example labels. Keep the application's localized UI content separate from the documentation language.

## Confirm feature ownership first

Before implementing a new feature, page, component, service, pipe, directive, or route, establish whether it is specific to one center, shared by several/all centers, or shared behavior with center-specific configuration.

If the request does not make this clear, ask the user first: "Is this feature specific to a center, or shared? If specific, which center? If shared, what should vary between centers?" Ask in the user's language and wait for the answer before choosing the implementation location. You can inspect existing code while waiting.

An explicit answer in the current request or earlier task context is sufficient; do not ask again. For a bug fix or maintenance task whose ownership is already evident, preserve that ownership unless the requested behavior changes it. Do not interrupt unrelated documentation or tooling tasks with a feature-scope question.

Do not assume that a feature is shared because several pages within one center use it. Do not assume one center's rules, routes, or API shape apply to others. The team may implement a feature in one center first and later extract the confirmed common behavior. Do not generalize that first implementation without agreement on what is shared.

Briefly explain the intended placement and important tradeoffs before changes that span applications and libraries.

## Inspect the current workspace

Discover applications and libraries from `angular.json`, npm workspaces, and the filesystem. Never hardcode a center list or count in shared code or tooling.

Read `docs/ARCHITECTURE.md` and the relevant package README before architecture changes. Consult `docs/api-configuration.md`, `docs/center-navigation.md`, and `docs/center-generator.md` for those areas. Use `docs/VALIDATION.md` to find available checks.

For visual changes, read `DESIGN.md` and inspect the current interface and semantic tokens. Center-specific values and historical examples describe existing applications; they are not universal requirements for new centers. `docs/angular-migration.md` and external reference captures are historical context for migration/parity work, not a permanent restriction on explicitly requested new behavior.

Use the installed versions recorded in manifests and the lockfile. Check Angular/Spartan MCP and Context7 documentation before uncertain framework or library API work.

## Where code belongs

| Location               | Responsibility                                                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/<center>/src`    | Center-owned pages, components, services, pipes, directives, routes, navigation, environments, assets, catalogs, and overrides.                    |
| `packages/domain`      | Framework-independent types, validation, business rules, and calculations confirmed to be shared.                                                  |
| `packages/data-access` | Shared API services, adapters, response mapping, clients, request state, and stores.                                                               |
| `packages/ui`          | Generic controls, display components, UI pipes/directives, semantic styles, and font imports. No center or product workflow knowledge.             |
| `packages/core`        | Shared product pages, feature components, layouts, workflow coordination, and typed extension contracts. Not a default location for every service. |
| `libs/ui`              | Shared Spartan Helm primitives generated through the configured Spartan CLI.                                                                       |

Keep center-specific code in its application even if multiple local pages use it. Put shared HTTP/data services in `data-access`; services in `core` coordinate shared product features. Put product-aware shared pipes/directives in `core`, and generic UI ones in `ui`.

Shared packages never import applications, branch on center IDs, or require a global center union. Applications compose shared features through typed configuration, inputs, providers, adapters, and existing extension points. Do not copy an entire shared page just to change a label or supported configuration.

Preserve dependency boundaries: applications may use the shared packages; `core` may use `ui`, `data-access`, and `domain`; `data-access` may use `domain`; `ui` may use `domain` only for generic date utilities. Domain imports no Angular or application code.

Use public package entry points and export new shared APIs from the owning entry point. Declare direct dependencies in that package and keep the single root lockfile consistent. Run import-boundary checks when imports change.

## API configuration and services

Each application owns `src/environments/environment.ts`, `src/environments/environment.production.ts`, and `src/app.config.ts`. Always import the base environment file; build configuration selects the production replacement. Keep both environment shapes compatible. These are public browser settings, not secrets.

The application provides its API address with `provideApiConfig({ baseUrl: environment.apiBaseUrl })`. Shared services inject `API_CONFIG` from `@workspace/data-access` and use Angular `HttpClient`. Pages request data through a service/store; they should not pass base URLs through component inputs or import application environments into shared packages.

`startCenter(centerModule, appConfig)` merges application providers with shared bootstrap providers. Keep root service configuration at application scope. Use application configuration for application-specific providers and interceptors.

Share a service when endpoint behavior and data contracts agree. A different base URL alone does not handle different endpoint paths, response shapes, or business operations. When these differ, inject a typed contract/adapter and supply the implementation from the application. Existing transaction features use `CenterDataAdapter`; preserve that boundary when connecting them to a backend.

Unique endpoints can have services under `apps/<center>/src/services` or a local feature folder. A shared page needing such behavior depends on a shared contract supplied by the application, not a direct import of that local service.

Preserve loading, empty, error, retry, cancellation, and stale-response handling. Keep the last useful data when refresh fails. Scope records, drafts, caches, and mutations to the current application/center; reject foreign operations. Validate/map external responses as needed; TypeScript response types do not validate runtime JSON.

## Pages, routes, and navigation

Each center owns its route registration and menu configuration. `routes.ts` connects URLs to pages; `navigation.ts`, where present, describes menu links, groups, labels, icons, and order. Menu entries are not authorization rules; removing a link does not remove a route.

A center-specific page belongs under `apps/<center>/src/pages` or its local feature folder. A confirmed shared product page belongs in `packages/core` and is registered or composed by the applications that use it. Centers can have different URL structures, navigation trees, and page choices.

Inspect current route contracts before using them. Do not claim a custom wrapper supports all Angular Router options unless it does. If a feature needs lazy loading, child routes, guards, resolvers, or route providers beyond the current contract, extend it deliberately or use suitable app-owned composition. Do not silently discard route options.

Register a new page's route in each requested application. Add menu links only when requested or implied by the feature. Preserve existing routes, typed extensions, and registration conflict checks unless the task changes them.

## Code and generation conventions

Use Angular standalone patterns, native template control flow, Signals/computed state, typed Reactive Forms/CVAs, Router/RxJS, and strict TypeScript/templates. Keep components zoneless-compatible and follow installed Angular defaults instead of adding redundant metadata.

Every owned component in `packages` has a matching folder with separate `name.ts` and `name.html` files connected through `templateUrl`. Follow the same convention for new application components. Official Spartan sources retain their generated structure. Add primitives only when needed and import them through `@spartan-ng/helm/<primitive>`.

Use Angular CLI generators for Angular artifacts when helpful. Select the target with `--project=<angular-project-name>` and place files intentionally with `--path`. A path alone does not select a project. Inspect `scripts/ng.mjs` before recommending custom shorthand; do not assume component/page shortcuts support services, pipes, or directives. Plain domain types/functions do not need Angular scaffolding.

Keep npm workspaces, one lockfile, Turbo, and Angular CLI orchestration. Preserve the existing Tailwind/Spartan/CDK UI stack and installed libraries. Do not introduce another workspace manager, framework, bundler configuration, or component stack without an explicit request.

## Appearance and behavior

Use the active application's brand assets and semantic tokens. Do not hardcode center names, brand colors, API addresses, or business rules in shared features. Keep center-owned values in application configuration and assets. Shared status meanings stay consistent across brands.

Preserve Arabic/RTL support, responsive layouts, current typography, keyboard interaction, and visible focus. Portaled UI inherits the active application's tokens and direction. Use semantic Tailwind utilities; avoid `::ng-deep`, duplicated page themes, and center-ID color branches.

Existing demo catalogs, screens, authentication, and sample API calls are starting examples, not approved business requirements. Do not invent service rules or represent demo operations as real backend behavior. Implement authentication, payments, or other integrations when the task defines them. Preserve unrelated workflows.

Keep forms and drafts intact after rejected operations. Preserve genuine local export/preview behavior. Calendar-only dates must not shift through UTC serialization.

## Verification and handoff

Match verification to the change and the user's scope. Use type checks, lint/import boundaries, focused tests, and affected production builds as appropriate. Broaden checks when shared changes or failures justify it; do not run a full browser matrix for documentation edits or small unrelated changes.

For visual/interaction changes, check affected applications, relevant shells, responsive widths, keyboard/focus, and loading/error/empty states. Distinguish actual checks from historical results. Report pre-existing failures separately; do not claim parity without evidence.

Explain what changed, where it belongs, how applications supply their configuration, and how it was checked. Preserve unrelated changes and valid project skills. Do not push, deploy, or publish unless explicitly requested.
