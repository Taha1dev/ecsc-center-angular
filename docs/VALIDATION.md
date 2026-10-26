# Verification

Run checks from the repository root after `npm ci`. Supported Node/npm versions are defined in `package.json`; do not infer current versions from historical migration records.

| Command                     | Actual scope                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------- |
| `npm run typecheck`         | Turbo package type checks, test/config TypeScript, then the dedicated Spartan check         |
| `npm run lint`              | Static import/component boundaries, followed by ESLint over `apps`, `packages`, and `tests` |
| `npm test`                  | Vitest files matching `tests/unit/**/*.test.ts`, in a Node environment                      |
| `npm run build`             | Production builds for workspace packages in dependency order                                |
| `npm run build:<id>`        | One configured application's build plus library dependencies                                |
| `npm run test:e2e`          | Playwright files under `tests/e2e`, using configured application servers                    |
| `npm run typecheck:spartan` | Direct checking of installed Helm sources                                                   |

Root scripts are authoritative. An empty/missing task is not coverage, and passing compilation alone does not establish visual or behavioral parity.

## Unit tests and generated test files

Vitest currently runs the hand-maintained tests under `tests/unit`. These include domain/data contracts, date/export behavior, navigation/registration checks, component structure, generator/deletion behavior, and workspace tooling regressions. Explicit source aliases are read from `tsconfig.json`, including installed Helm entry points.

Angular-generated `*.spec.ts` component files are **not** included by `npm test`. The Node Vitest suite is not configured as a browser/TestBed component-testing harness. Some registration tests load Angular's JIT compiler, but that does not make arbitrary generated TestBed specs executable. Do not add every `.spec.ts` to discovery without deliberately configuring a compatible environment and setup.

The workspace wrapper skips service/pipe/directive specs, and skips component specs by default. `--no-skip-tests` for a component can create a starting file, but does not add execution support. Put meaningful tests in the supported suite, or explicitly set up component testing when the task requires it. Do not generate superficial tests to inflate coverage.

Playwright `*.spec.ts` files under `tests/e2e` are separate browser tests, including smoke tests created by the center generator.

## Browser tests

Playwright uses installed Chrome (`channel: chrome`). If needed:

```sh
npx playwright install chrome
```

Servers are discovered from Angular application configuration with valid entry files, explicit ports, and build outputs. No fixed center count is assumed. Existing scenario files may target particular example applications; discovery of a new server does not automatically create full scenario coverage for it.

For production previews, build first, then set the flag using your shell:

```powershell
$env:E2E_PRODUCTION = '1'
npm run test:e2e
```

```sh
E2E_PRODUCTION=1 npm run test:e2e
```

Run a selected browser file through `npm run test:e2e -- <file>` when appropriate. Inspect its application dependencies before limiting server startup. Generated smoke scenarios cover the scaffold's demo routes/sections, not arbitrary future routes or real backend rules.

For visual/runtime changes, check affected apps and relevant shells, useful mobile/tablet/desktop widths, overflow, keyboard/focus, portals, and populated/loading/error/empty states. Include reflow where relevant. A half-width viewport is a reflow approximation, not a claim of native browser zoom testing.

## Tooling and documentation changes

Use focused generator, deletion, boundary, and discovery tests for script changes. Validate generated plans and help output without modifying real apps where possible. After shared build configuration changes, run affected builds and check Turbo's dry-run task/global inputs.

Check Markdown links, referenced paths, English documentation, workspace registration files, and stale current-state claims. Documentation-only edits do not require a full browser matrix.

Static import rules cover literal imports/exports, literal dynamic imports/require, and selected direct center-ID branch shapes. They do not prove complete center independence or runtime authorization.

## Reporting

Report commands actually run and their outcomes. Separate pre-existing failures and unverified behavior from new failures. Do not repeat an old test count or parity percentage as a current result.

[Archived migration evidence](archive/angular-migration.md) records a dated comparison against a separate reference. The historical comparison scripts live under `scripts/archive` and are not normal platform validation or discovery tools. External reference inputs are not bundled, so those comparisons cannot be assumed reproducible from this checkout alone.
