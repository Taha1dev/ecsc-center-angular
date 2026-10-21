# Angular migration — implementation and validation record

The requested deliverable is the separate project `E:/Development/ecsc-center-angular`.
The React project remains runnable and unchanged in its application code. No publishing or pushing is authorized.

## Baseline and preservation

- Source commit: `973e72cbd6823737e904dd499ef28e4e0bfe9bc8`.
- Reference checkout: `E:/Development/ecsc-center-react-reference`, detached at that commit; all 259 tracked files verified against the source.
- Original project: `E:/Development/ecsc-center`. Reference capture/documentation additions were made before the user clarified that the Angular project must be separate. Existing application code and user changes are preserved.
- Reference date: 2026-10-06, Asia/Damascus. Fixtures remain deterministic and reset on reload, with local mutations scoped to one center.
- Reference evidence: `E:/Development/ecsc-center-migration-evidence/reference/manifest.json` and 474 captures across all centers, shells, routes and specified widths/reflow states.
- Full route/feature/interaction inventory: [angular-migration-inventory.md](angular-migration-inventory.md).

## Implemented structure

Angular CLI multi-project workspace; npm workspaces, one root lockfile, Turbo. Applications `apps/ecsc`, `apps/m3`, `apps/jus` own authentic assets, catalogs, reports, themes and composition. Libraries: pure `domain`, adapter/client/store `data-access`, owned Helm/Brain controls and patterns `ui`, and product layouts/features/registration `core`.

Implemented login, dashboard and chart workspaces, both shells, inboxes, dynamic filters, tables/collections, all fourteen transaction sections and action forms, previews, reports, design-system route, notifications, reset, invalid-route states, and the M3 property-field override. Pure domain, registry, adapter, fixture, data-client and export rules were reused.

## Versions

Verified against npm stable metadata and official Angular documentation on 2026-10-19; `npm view @angular/core version` rechecked on 2026-10-21 returned 22.2.3. Angular/CLI/CDK 22.2.3, TypeScript 6.0.3 (resolved by the final lockfile), Node 24.15.0, npm 12.0.2, Tailwind 4.3.3, Spartan Brain 1.8.0, TanStack Angular Table 9.3.1, ngx-echarts 22.0.0, ECharts 6.1.0, ng-icons/Phosphor 36.1.0, Zod 4.6.5, ExcelJS 4.4.0, Vitest 5.0.5, Playwright 1.64.1, RxJS 7.8.2, Fontsource Alexandria 5.3.0, ng-packagr 22.2.4, angular-eslint 22.6.0, Turbo 2.11.9. Tailwind Merge 3.7.0 resolves demonstrated conflicts between Helm defaults and caller utility classes. Visual comparison uses pixelmatch 8.0.0 and pngjs 7.0.0; accessibility uses axe-core/Playwright 4.14.0. No prereleases or peer-conflict bypass flags.

## Actual MCP use

Both official server processes have been called through a local JSON-RPC stdio MCP client (logs in the external evidence directory). This is actual initialization, tool discovery and `tools/call`, not configuration-only evidence.

- Angular: `get_best_practices`, `list_projects`, `search_documentation`, `run_target` (successful ECSC production build).
- Spartan: `spartan_components_list`, `spartan_components_get` (dialog/popover APIs, dropdown-menu example, select code and accordion API), `spartan_components_dependencies`, `spartan_accessibility_check`, `spartan_docs_get` (installation). Some initial upstream example fetches failed; select/accordion retries and the final popover API fetch succeeded. Installed declarations were also inspected.
- The official Spartan process required making its missing `ajv` dependency available with `npx --package=@spartan-ng/mcp --package=ajv spartan-mcp`.
- On resume, the desktop Angular MCP is exposed but rooted in the projectless Documents folder and rejects the E: workspace as outside its allowed roots. Its documentation search works. The locally launched official Angular MCP discovers all seven projects and supplies workspace-aligned practices.
- Context7 queried for Angular, TanStack Angular Table, Playwright/Axe, ECharts circular geometry, Tailwind Merge and public CDK overlay/menu APIs.

## Validation — 2026-10-21

- Root strict type checks passed for all seven projects and test/config TypeScript, including the final presentation and numeric/date sorting changes.
- Final ESLint and automatic import boundaries passed for 96 source files.
- Vitest: 34/34 passed, including the 19 preserved domain/architecture checks, date/export tests and Angular registration contracts.
- All four ng-packagr libraries and all three production applications built. Turbo's seven explicit project build tasks declare dependency edges and individual outputs. Library consumers compile against emitted dependency declarations; shared CSS is included in the UI package. Dashboard/ECharts and ExcelJS load lazily; application initial bundles remain under the 1 MB warning budget.
- Production browser checks cover blank entry/foreign-route recovery; 456 route visits across all centers, both shells and 390/768/1280/1536px; table sorting/paging/visibility/selection/bulk claims; collection switching; dependent filters/date drafts; rejected/accepted forms; all ten reports per center, retries, empty results and real local CSV/Excel downloads; shell switching; action workflows; chart controls/drill; notifications/reset; keyboard/focus and RTL.
- All 51 production scenarios were validated: 47 passed in the full run, followed by a clean 4/4 focused rerun. Three assertions had incorrectly expected numeric sorting to start ascending; the reference and Angular both start descending. The corrected workflows verify both directions. The remaining JUS case timed out while creating a browser context, before application steps, and passed on rerun. Browser fixture setup now has a 90-second budget; assertions still use 15 seconds and retries remain disabled. Logs: `angular-release-browser.log` and `angular-release-browser-rerun.log` in the evidence directory.
- Axe scans representative login/dashboard/inbox/applicant pages, calendar keyboard controls and equivalent 200% reflow passed for all centers. Native browser UI zoom is not separately automated; reflow uses the equivalent half-size viewport.
- Final clean `npm ci` succeeded from the final lockfile: 633 packages installed, 641 audited in 48 seconds. The subsequent seven-project strict checks and production builds passed. No dependency changes followed that installation.
- Earlier diagnostic browser runs exposed ambiguous test selectors for hidden mounted tables and resource-contention timeouts. Selectors now target visible controls, and the final suite runs separately from visual capture.
- Follow-up production checks verified the final date-picker implementation: correct initial month/year, variable week counts, 2020–2030 navigation limits, range extension, draft-only clearing, cancellation and application. Native date fields that were absent from the reference were removed. The three enhanced calendar scenarios passed. All three representative Axe/reflow cases, report/export cases and chart-control cases passed after these changes.
- Owned Helm menu triggers retain CDK's menu stack and keyboard handling while applying the reference's 12px viewport collision gutter through the public positioning strategy API. Pointer opening no longer paints a keyboard focus ring on the first item. Mobile tests verify both edges, Escape/focus restoration and ArrowDown navigation.
- Final follow-ups passed: 15/15 table/form/menu/action-workflow cases, 6/6 responsive chart/menu layout cases, and 3/3 enhanced calendar cases. SVG height is checked against its available frame on desktop and mobile. A targeted UI library type check and test/config TypeScript check also passed. These follow-ups validate the final changes; they are not represented as a single clean 51-test invocation.
- The chart host uses `h-full!` intentionally: ngx-echarts can install an inline 400px fallback while a dialog opens. The utility preserves the actual flex-frame height; a measured mobile case now has matching host/inner/SVG heights of 348px. Owned Helm popovers preserve the preferred RTL anchor and push into view instead of Spartan's opposite-edge fallback.

## Visual evidence method

The initial reference inventory was captured through CDP. A later direct Playwright recapture revealed coordinate-shift artifacts in some original CDP PNGs despite identical DOM geometry. For example, a fresh ECSC 1536px login PNG was byte-identical to Angular, while the old CDP PNG showed a displaced brand region. Those historical captures are retained but are not used to justify layout changes.

`scripts/compare-reference.mjs` therefore captures the unchanged runnable React reference and Angular with the same Playwright/Chrome 155 browser, timezone, viewport, DPR, shell preference, route, fixtures and font readiness. It compares full images using pixelmatch's 0.1 per-pixel threshold, includes layout/height differences, and uses no ignore regions. Cached reference images can be reused only from this aligned live capture. Pixel differences are diagnostic measurements, not a blanket acceptance tolerance. Exact visual parity is claimed only for individual measured identical captures.

## Running the delivered applications

From `E:/Development/ecsc-center-angular`, use `npm ci`, then `npm run dev:ecsc`, `npm run dev:m3` or `npm run dev:jus` (ports 5200/5201/5202). `npm start` starts ECSC; `npm run dev` starts all three through Turbo. `npm run build` builds all seven projects; `build:ecsc`, `build:m3` and `build:jus` build each app and its dependencies. Production preview commands use ports 5300/5301/5302.

The active workspace has no React application, React runtime dependencies, Radix React or Vite project configuration. Angular CLI may use Vite internally for its development server. The preserved React reference is external. No push, deployment or publication was performed.

A passing build alone is not parity evidence. Measurements below distinguish tested equivalence from rendering differences.

## Measured parity and remaining differences

| Evidence stage                                    | Coverage                                                                                                                                       | Measured result                                                                                                                                                                                                                                                              |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Complete route sweep before the final refinements | 474 cases: all three centers, both shells, 390/768/1280/1536px, login and equivalent reflow                                                    | Median changed pixels 0.5155%; 12 identical login captures; no runtime, token or document-overflow errors. This stage identified spacing differences subsequently corrected. Its maximum 4.4579% was the earlier design-system spacing issue, not a claimed final tolerance. |
| Final focused route follow-up                     | 36 dashboard/transaction-fields/overview cases at 390/1536px across every center and shell                                                     | Median 0.0225%, maximum 0.6382%; matching image dimensions in all 36 cases; no runtime, token or document-overflow errors.                                                                                                                                                   |
| Final open-state matrix                           | 84 pairs: date picker, expanded chart, account menu, notifications, note form, report parameters and preview; all centers/shells at 390/1536px | Median 0.2486%, maximum 1.8319% (M3 navbar/mobile expanded chart); six identical captures; zero unresolved capture errors.                                                                                                                                                   |

The open-state matrix combines the full sweep with a targeted retry of transient Chrome `ERR_NETWORK_CHANGED`/`ERR_NETWORK_ACCESS_DENIED` failures on loopback and a 12-case date-popover follow-up after its anchor correction. Failed captures were replaced only by successful reruns of the same cases. The final date follow-up ranged from 0.129% to 0.832%. The consolidated evidence index is `E:/Development/ecsc-center-migration-evidence/angular-final-overlay-matrix.json`; metrics are in `angular-final-validation-summary.json`.

The final follow-ups target changed routes/controls. The complete 474-case sweep was not repeated after every localized refinement; its earlier figures must not be presented as final measurements of every page. Comparisons include all visible pixels and layout heights, without ignore regions. The numbers above are observations, not a blanket percentage acceptance threshold.

Remaining visible differences are localized to ECharts versus Recharts curve interpolation, automatic category-axis tick selection, SVG/text rasterization and small calendar caption/day alignment differences. Complete pixel identity is not claimed. No omitted product screen or workflow is currently identified, and no MCP setup blocker remains for the implementation. Native browser-UI 200% zoom was not separately automated; equivalent reflow was tested as described above.

The delivered workspace is a complete Angular application implementation, with the preserved reference kept separately. No React runtime is required to develop, build or run it.
