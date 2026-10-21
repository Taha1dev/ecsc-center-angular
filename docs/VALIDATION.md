# Validation

Run from the repository root with Node 24.15+ and npm 12.0.2:

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Type checks cover all seven Angular projects plus test/config TypeScript. Lint combines TypeScript AST import boundaries, ESLint and Angular template checks. Vitest covers preserved catalogs, all field kinds, registry extensions/conflict rejection, eligibility/transitions/commands, deterministic fixtures, report/adaptor contracts, center isolation, concurrent claims, loading/retry/rejection and stale responses. Additional tests cover date-only arithmetic, export escaping and Angular route/form/section registrations.

Playwright starts all three apps. Tests cover every route and all fourteen transaction sections across sidebar/navbar shells at 390, 768, 1280 and 1536px, checking RTL, overflow and runtime errors. Interaction checks cover blank login, foreign routes, dependent filters, draft/apply/cancel date ranges, sorting, pagination, columns, selection, claims, collection modes, accepted/rejected forms, reports, local CSV/Excel downloads, shell switching, Escape, focus restoration and mobile focus trapping. Dedicated action-form tests exercise each transaction workflow. Axe scans representative pages; calendar keyboard and equivalent 200% reflow checks supplement automated scans.

For production validation, first build, then set `E2E_PRODUCTION=1` and run `npm run test:e2e`. Built application previews use ports 5300/5301/5302. The production server is a small local static SPA server, without backend behavior.

The React reference remains separate and runnable at `E:/Development/ecsc-center-react-reference`. Its captured baseline is commit `973e72cbd6823737e904dd499ef28e4e0bfe9bc8`, reference date 2026-10-06 and Asia/Damascus timezone. Compare identical center, shell, route/section, viewport, fonts, fixture state and overlays. Reference captures and check logs are retained in `E:/Development/ecsc-center-migration-evidence`. Test artifacts are ignored under `test-results/`.

Current measured results and remaining discrepancies are maintained in [angular-migration.md](angular-migration.md). Historical React checks are baseline evidence, not Angular validation. Passing compilation alone does not establish visual or functional parity.

`node scripts/compare-reference.mjs` compares all 474 baseline cases against the production previews. It requires live React reference previews on ports 4173/4174/4175. Set `VISUAL_LIVE_REFERENCE=0` and `VISUAL_REFERENCE_CACHE` to an aligned Playwright capture directory to reuse its unchanged reference images. `VISUAL_OUTPUT` selects an external evidence directory; `VISUAL_PAGES` and `VISUAL_WIDTHS` limit a follow-up run to comma-separated inventory page names and widths. Do not rebuild application outputs during capture.

`node scripts/compare-overlays.mjs` compares 84 open-state pairs: date ranges, expanded charts, account menus, notifications, note dialogs, report parameters and previews, across every center and shell at 390/1536px. `OVERLAY_OUTPUT` selects its external evidence directory; `OVERLAY_STATES` limits follow-ups, and `OVERLAY_RETRY_MANIFEST` reruns only failed cases from a previous manifest. The scripts wait for font and chart readiness and do not mask differing regions. Large PNG inventories are developer evidence, not part of the application deliverable.
