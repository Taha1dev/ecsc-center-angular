# 06 · Build, preview, and check your work

[README](../README.md) · Previous: [Data and API](05-data-and-api.md)

Now build the center independently and check the parts you changed. Keep track of the working directory: `npm run build` at the root has a different scope from the same command inside an app.

## Run and build

For a terminal using direct `ng` commands, run `.\dev.ps1` at the repository root first. Then enter `apps/guide-center` when the table calls for an app folder.

| Working directory | Command | Result |
| --- | --- | --- |
| Root | `npm run dev:guide-center` | Start this app with test settings; open its printed URL |
| `apps/guide-center` | `npm run dev` | Start the same development server |
| `apps/guide-center` | `npm run build:dev` | Build configuration `test`, using `environment.ts`, unoptimized with source maps |
| `apps/guide-center` | `npm run build` | Build this app for production |
| `apps/guide-center` | `ng build` | Same production default, inferred from the current app folder |
| Root | `npm run build:guide-center` | Turbo production build of this app and its library build tasks |
| Root | `npm run build` | Turbo production builds for workspace packages/apps |
| `apps/guide-center` | `npm run preview` | Serve this app's existing output |
| Root | `npm run preview:guide-center` | Same local preview |

For example, from a new root PowerShell terminal:

```powershell
.\dev.ps1
cd apps/guide-center
npm run build:dev
```

For production, run `npm run build` there, or `ng build`. Production replaces `src/environments/environment.ts` with `environment.production.ts` through `angular.json` and optimizes/hashes output. Always import the base environment file in code. Environment values are compiled in; rebuild after changing them.

Both configurations write to `dist/apps/guide-center/browser/` at the repository root. A later build replaces earlier output in that directory. Shared source used by the app is included; application-local Angular builds do not run all separate library build tasks or build other centers. Root Turbo builds order package tasks first. Shared root configuration, scripts/templates, and Helm sources participate in global cache inputs.

Preview **does not build** or choose an environment. Build first, run preview, and open its printed URL. Its port is the configured dev port plus 100. A missing `index.html` means you need to build; stale content means you need to rebuild. Stop a running server with `Ctrl+C`.

![Earlier successful filtered build and preview output rendered as a transcript](assets/create-center/07-build-and-preview-transcript.png)

*Earlier capture from 26 October 2026. Its timings and task counts describe that run only; it is not evidence of checks run for a later checkout.*

## What the checks cover

All commands below run from the **repository root**:

| Command | Actual scope |
| --- | --- |
| `npm run typecheck` | Turbo package checks, test/config TypeScript, then Helm sources |
| `npm run lint` | Static boundaries and owned-component structure, then ESLint over apps/packages/tests |
| `npm test` | Vitest `tests/unit/**/*.test.ts`, in Node |
| `npm test -- tests/unit/center-generator.test.ts` | Focused generator/deletion regressions |
| `npm run typecheck:spartan` | Installed Helm sources; skips when none are installed |
| `npm run test:e2e` | Playwright `tests/e2e`, with configured application servers |

The unit suite covers domain/data behavior, registration/navigation, date/export logic, and tooling. Angular-generated `*.spec.ts` files are **not** included in it. The Node suite is not a general Angular TestBed/browser harness; generating specs does not make them executable. Playwright specs are separate, including each generated center's smoke test.

Playwright uses installed Chrome. If unavailable, run `npx playwright install chrome` from the root. Server discovery reads valid applications and their ports from Angular configuration. Existing scenarios may target specific examples; discovering a new server does not create complete feature coverage for it.

To test production previews, build the apps needed by the scenarios first. Then, from a root PowerShell terminal:

```powershell
$env:E2E_PRODUCTION = '1'
npm run test:e2e
```

On a POSIX shell, use `E2E_PRODUCTION=1 npm run test:e2e`. Limit a browser run with `npm run test:e2e -- <file>` when appropriate; check which application servers its configuration still starts. There is no need to run an unrelated full browser matrix for prose-only edits.

A passing build checks compilation, not complete UI correctness. For runtime changes, check the affected screens, useful mobile/desktop widths, keyboard/focus, overlays, reflow, and loading/error/empty states. Static boundary checks cover literal imports and selected direct center-ID branches; indirect aliases and semantic misuse still need review.

## Troubleshooting

| Symptom | First check |
| --- | --- |
| Unknown `page` or center selector | Run `.\dev.ps1` again in that terminal |
| Bare `ng build` cannot select a project | Enter the app folder, or name the project explicitly from the root |
| Port occupied | Stop its owner or change the app's dev port in `angular.json`; check the preview port too |
| New source files are not visible | Wait for the dev rebuild; preview needs a fresh build |
| API setting appears wrong | Confirm the build configuration and which server URL you opened |
| Compilation passes but a page is missing | Check both the route and menu registration from chapter 04 |

## Delete the disposable center

Stop its servers and leave its app folder first. From the **root**, preview the deletion:

```sh
npm run center:delete -- guide-center --dry-run
```

To delete it, run from an interactive terminal:

```sh
npm run center:delete -- guide-center
```

Review the listed targets, then type exactly:

```text
delete guide-center center
```

Any other response cancels. Confirming removes the app including local customizations, its generated smoke test and build output, and its Angular/npm/Turbo registrations. npm updates the root lockfile and workspace links afterward. It does not remove shared example files you added to a package; review those separately.

`center.deletionProtected: true` in an app's package manifest blocks deletion regardless of ID. Generated manifests start with `center.generated: true` and `deletionProtected: false`; structural/path checks still apply, so a flag alone does not make an arbitrary folder deletable. The tool rechecks metadata/configuration after confirmation.

If Windows reports a lock, stop the app's servers and close terminals/Explorer windows inside its folder before retrying. The tool backs up before removal and attempts restoration on failure; if recovery fails, it retains the backup and reports its location.

You have followed the path from application setup to generated code, routing, visible API data, and an independently built center. Return to the chapter for the task you need next.

[README](../README.md) · Previous: [Data and API](05-data-and-api.md)
