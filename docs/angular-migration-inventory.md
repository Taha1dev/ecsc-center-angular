# React reference inventory for Angular parity

Baseline: `973e72cbd6823737e904dd499ef28e4e0bfe9bc8`. This inventory records the authoritative
React source and the behavior carried into the separate Angular workspace. All listed product
routes and sections have Angular implementations. Measured coverage, limitations and actual
MCP usage are recorded in [angular-migration.md](angular-migration.md).

## Applications and identity

| App  | Identity              | Data/catalog                                                       | Assets/customizations                                                                         |
| ---- | --------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| ecsc | مركز البوابة          | Agency/vehicle/entry sample catalog; 48 transactions               | Blue/orange authentic symbol, circuit login SVG, standard logo dimensions                     |
| m3   | مركز المصالح العقارية | Registry/ownership/property sample catalog; 48 transactions        | Green/gold extracted emblem, preserved source JPG, authentic stars; app-owned fields renderer |
| jus  | مركز العدل            | ECSC-derived sample definitions, separately scoped 48 transactions | Supplied unchanged emblem, stars, wide 400x200 responsive login logo                          |

All three apps own profile, service catalog, demo definitions, reports, composition module,
route/page registration, CSS brands and assets. Their current extra-route/page replacement
registrations are empty. Extensibility is still a required supported contract, tested with
synthetic registrations. There is no product center switcher. `CenterId` is a validated
string, not a shared union. Shared code must remain independent of app IDs/imports.

## Route inventory

`{center}` means the app's bound ID, not arbitrary access to another app's records.

| Route/state                          | Source                                                 | Required behavior                                                                                                                                 |
| ------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                  | core/src/App.tsx                                       | Redirect to /login, irrespective of remembered center                                                                                             |
| `/login`, optional `?center=`        | features/auth/login.tsx and LoginRoute                 | Accept matching/no center; reject foreign parameter; blank demo submission by click/Enter; password visibility; remember center only; help dialog |
| `/centers/{center}`                  | features/dashboard/dashboard.tsx                       | Date-scoped metrics, four charts, attention, activity, exports                                                                                    |
| `/centers/{center}/inbox/group`      | features/inbox/inbox.tsx                               | All bound center transactions; descriptor filters; saved views; claim/bulk flows                                                                  |
| `/centers/{center}/inbox/personal`   | same                                                   | Current-employee ownership scope, same controls and actions                                                                                       |
| `/centers/{center}/transactions/:id` | features/transactions/transaction.tsx                  | Bound-center lookup; default overview; `?section=` chooses registered/visible section                                                             |
| `/centers/{center}/reports`          | features/reports/reports.tsx                           | Search/category/directory, parameter and preview state machine, real CSV/XLSX                                                                     |
| `/centers/{center}/design-system`    | features/design-system/design-system.tsx               | Product primitive/pattern showcase, geometry examples and transaction links; preserve actual visible showcase                                     |
| App extra routes/page replacements   | app/module.tsx, types/routes.ts, apps/*/src/routes.tsx | Explicit registration, shared-route conflicts reject; component/page replacement contracts                                                        |
| Foreign center, invalid scope/path   | core/src/App.tsx                                       | Arabic not-found; no silent fallback to another center                                                                                            |
| Missing transaction/invalid section  | features/transactions/transaction.tsx                  | Dedicated Arabic state and inbox/overview recovery                                                                                                |

Inbox URL state supports `query`, `group`, `type`, `status`, `priority`, `team`, `owner`,
`receivedFrom`, `receivedTo`, `overdue`, `stage`, `view`. Preserve actual label-vs-ID
contracts used by those filters. Dashboard drill links supply the matching date/dimension
scope. The same numeric transaction ID in different apps identifies separate records.

## Navigation and general interaction inventory

- Sidebar shell: inset branded right navigation, expanded/collapsed states, current-page
  indication, inbox counts, light context bar and breadcrumbs. On transaction routes the
  sidebar contracts to a rail at 1024–1535px. Contextual 286px section rail starts at 1536px.
- Navbar shell: same mounted content, horizontal navigation, sticky 16px desktop/8px mobile
  inset at scroll zero; scrolling makes navigation edge-to-edge at top zero with lower rounding.
- Shell choice is localStorage `shell`, independent of center. Switching must preserve
  route, filter and draft state. Mobile shells use a navigation sheet.
- Skip link; account menu; notifications dialog from center records; reset confirmation;
  local reset refreshes data; logout navigates to login without introducing authentication.
- Arabic labels, RTL including portals, mixed-direction IDs/phone/email isolation,
  visible focus, keyboard menus/selects/accordions, disabled reasons, Escape and focus restoration.
- Preserve tooltips, popovers, dropdown grouping/separators/icons, local toast wording,
  confirmation and pending/error/empty states. No inactive decorative buttons.

## Dashboard inventory

Sources: `features/dashboard/dashboard.tsx`, `data/dashboard.ts`,
`components/product/dashboard-chart.tsx`, `attention-list.tsx`, `lib/attention.ts`,
UI `chart-workspace.tsx`, `chart.tsx`, `date-range-picker.tsx`, `export-menu.tsx`.

| Surface/control       | Required behavior                                                                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header date range     | Inclusive local calendar dates; draft/apply/cancel/clear/reset and chips; filters charts, current-scope KPIs, links, exports                                        |
| Daily/weekly/monthly  | Change bucket size while keeping chosen range                                                                                                                       |
| Refresh               | Adapter reread, loading, truthful completion time; no fake live update                                                                                              |
| Four compact metrics  | Transaction total, current completed, unique completed beneficiaries, dated account registrations; valid previous-period comparisons or explicit unavailable reason |
| Receipt trend         | Area chart; received/currently-completed receipt cohorts; chronology LTR, text RTL; no invented completion history                                                  |
| Status distribution   | Donut, counts/percentages with complete selected denominator, fixed shared status colors, inbox links                                                               |
| Group workload        | Stacked radial rings, background tracks/rounded arcs, shared maximum scale, central total, 15 status/group segments, exact group counts and links                   |
| Account registrations | Dated synthetic history and chart, scoped to selected range                                                                                                         |
| Every chart workspace | Legend visibility toggles, chart/table view, expand dialog, export menu, tooltips, keyboard toggles; complete export/table data stays intact when series hidden     |
| Attention panel       | Up to five unique scoped transactions with combined reasons, local category filter, linked inbox scope and confirmed claim                                          |
| Secondary summary     | Separately labelled fixed snapshots plus sample/account summaries; fixed snapshots excluded from filtered exports                                                   |
| Recent activity       | Cohort-derived actual event descriptions/actors/Damascus time; transaction activity links                                                                           |

Product date is 2026-10-06; transaction coverage is 2026-10-01 through 2026-10-06;
account history starts 2026-01-01. Demo definitions/values must remain deterministic.

## Inbox/table/collection inventory

Sources: `features/inbox/inbox.tsx`, UI `data-table.tsx`, `collection-view.tsx`,
`dynamic-fields.tsx`, `action-menu.tsx`, `action-registry.ts`, product transaction flow.

- Draft/applied filters, advanced fields, reset/removable chips and saved-view counts:
  all, unclaimed, processing, overdue, attention.
- Dependent group → service/type options; changing the parent clears incompatible values.
- Current-owner personal scope; no cross-center fixture access.
- Stable row IDs, client sorting, paging/page-size, optional-column visibility, density,
  page checkbox and selected IDs, empty state, table-contained horizontal scrolling.
- Single frequent row action and grouped dynamic overflow actions; eligibility reasons.
- Bulk claim confirmation, accepted/skipped counts and updates to summaries/activity.
- Refresh loading preserves filters and selection of existing rows.
- Controlled server pagination/sorting/totalRows contract; avoid reprocessing a server page.
  Selected IDs can span pages; provided row objects represent only loaded records.
- CollectionView for applicants/parties/attachments/refunds: initial table for >1 item,
  initial cards for one; stable selection across views; keep mounted table sort/visibility.
  Payments/fees stay true tables. Notes/activity stay narrative presentations.

## Fourteen transaction sections

All are registered components with descriptor order/group/count/visibility/icons. Unknown,
hidden or unsupported service-section IDs show recovery. Group accordions support multiple
open groups and open the active group without closing others; smaller widths use a picker.

| ID           | Arabic heading        | Presentation                                             | Workflows to preserve                                                                     |
| ------------ | --------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| overview     | نظرة عامة             | Labelled details, finance and document summary, activity | Links to payments/requirements, next actions, identity/lifecycle/priority/deadline/stages |
| applicants   | مقدّمو الطلب          | Collection/table/cards, lead badge                       | Add/edit name/kind/identifier/phone, shared row/card action, selection                    |
| parties      | الأطراف والوكالات     | Linked collection/table/cards                            | Reference/agency view sheet; empty-state wording                                          |
| fields       | حقول المعاملة         | Typed field label/value groups                           | Field-specific edit, values retained on rejection; M3 app-owned renderer/count override   |
| requirements | الوثائق المطلوبة      | Required/provided/optional checklist                     | Missing document attachment flow tied to requirement ID                                   |
| attachments  | المرفقات              | Document collection with metadata                        | File selection retains demo metadata, preview/info sheet, empty/add state                 |
| payments     | الدفعات               | Summary and actual multi-record table                    | Create initial/final payment, inspect/pay existing record, confirmed local behavior       |
| fees         | الرسوم                | Total and itemized table                                 | Inspect/adjust specific fee, typed amount and activity                                    |
| refunds      | المبالغ المعادة       | Collection/cards/table and status                        | Create illustrative refund, inspect request, approved/waiting state                       |
| decisions    | القرارات              | Authored narrative cards                                 | Add/inspect decision, confirmation, empty state                                           |
| actions      | الإجراءات             | Available-action cards                                   | Descriptor presentation/disabled reasons, corresponding dialog/sheet                      |
| notes        | الملاحظات             | Internal narrative thread                                | Add/edit, resolve/reopen with correct record, author/status/activity                      |
| activity     | سجل النشاط والتحويلات | Chronological timeline                                   | Actor and system/edit/transfer filters, empty result                                      |
| output       | الطباعة والمخرجات     | Template cards and preview sheet                         | إيصال استلام / ملخص المعاملة / بيان الرسوم; template choice and illustrative preview      |

Transaction action forms: claim, status, completion, transfer, applicant, field, document,
payment, fee, refund, decision, note, print and activity. Keep typed form drafts and command
builders, app override registration and validation. Save errors stay inline; rejected
mutations leave the form open and the user's inputs intact. Preview actions use sheets.
Inspecting a party/document/decision/refund uses record-specific read-only presentation.

## Reports

Sources: `data/reports.ts`, `features/reports/reports.tsx`, `lib/report-export.ts`,
apps/*/src/config/reports.ts and UI export/calendar utilities.

| ID        | Title                    | Parameters/behavior                                             |
| --------- | ------------------------ | --------------------------------------------------------------- |
| report-1  | المعاملات اليومية        | Required range, group, status; transactions                     |
| report-2  | أحمال فرق المعالجة       | Team, group; no universal required date                         |
| report-3  | أداء الموظفين            | Required range, owner                                           |
| report-4  | المعاملات المتأخرة       | Team, status; overdue criterion                                 |
| report-5  | المستفيدون الفعليون      | Group; completed criterion and unique beneficiary output        |
| report-6  | المسجلون الجدد           | Required range; deliberate empty-result example                 |
| report-7  | تحصيل الرسوم             | Required range, group, payment type; financial output           |
| report-8  | الدفعات والمبالغ المعادة | Owner, grouping; deliberate retryable failure; financial output |
| report-9  | App specialty 1          | Required range, group, dependent type                           |
| report-10 | App specialty 2          | Status, type                                                    |

ECSC/JUS specialties: خدمات الوكالات والمركبات; تصاريح الدخول.
M3 specialties: حركة السجل العقاري; نقل الملكية والبيانات العقارية.

Searchable keyboard combobox, category filtering and directory cards lead to the chosen
report. Parameters preserve only intentionally compatible values. File type/name are
always last. Invalid dates/reserved filename characters produce field errors. Preview
states are parameters/pending/ready/error with edit/back/cancel/stale-response protection.
Retry resolves the demonstration failure. CSV/XLSX download real bytes locally, typed
numbers/dates and RTL worksheets; PDF remains an explicitly labelled preview.

## Reusable code and extension boundaries

| Existing source                                                                           | Migration treatment                                                                                                                               |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| core/src/domain/{model,services,validation,workflow,registry,center-definition,errors}.ts | Reuse framework-independent contracts, Zod, typed values/commands, semantic checks and capability rules                                           |
| core/src/data/adapter.ts                                                                  | Preserve interface and memory adapter: scoped reads/commands, immutable read clones, rejected foreign scope, reset, concurrent claim checks       |
| core/src/data/client.ts                                                                   | Preserve snapshots/loading/error/pending/retry, latest-request version, mutation errors; bridge subscription through Angular service lifecycle    |
| core/src/data/{fixtures,dashboard,reports}.ts                                             | Preserve deterministic generators and derivations; remove presentation/icon coupling without changing values                                      |
| core/src/lib/{present-transaction,format,attention,report-export}.ts                      | Reuse derivations/format/export where independent; preserve date-only behavior and Damascus display                                               |
| ui/src/lib/{calendar-date,export-data}.ts                                                 | Reuse local-noon parsing/serialization, inclusive range/comparisons, CSV escaping/formula defense/ExcelJS output                                  |
| core/src/app/module.tsx                                                                   | Replace React contexts/components with typed Angular DI registration; preserve add/override ordering/conflict rejection and generic extension IDs |
| core/src/types/presentation.ts and lib/definitions.ts                                     | Separate icon/component associations from pure labels/derivations                                                                                 |
| apps/*/src/config                                                                         | Preserve app-owned business samples/catalogs/reports/profiles; move rendering types to Angular registrations                                      |
| scripts/check-boundaries.mjs                                                              | Retain automated AST enforcement; extend to new libraries and Angular public paths without allowing UI→domain inversions                          |

## Styling and asset inventory

Canonical fonts/tokens remain `packages/ui/src/styles/globals.css`, per-center values
remain apps/*/src/brand.css, each app imports/scans Tailwind once. Preserve Alexandria
400/500/600/700, full CSS-color tokens, common status palette and the current 28/20/14/12px
workspace/panel/inset/control geometry. Use authentic existing logo/favicon/pattern bytes.
JUS login sizing is profile-driven; shared code must not branch on the JUS ID.

Angular controls to implement with the same authored utilities/tokens: AppField,
AppDataTable, AppActionMenu, AppDialog, AppSheet, AppDateRangePicker, AppStatusBadge,
AppChart, CollectionView plus existing workspace/entity/document/activity/metric/filter
patterns. Spartan provides accessible primitives; its default design is not the reference.

## Test and screenshot inventory

Existing 19 Node tests exercise catalog/fixture validation for ecsc/m3/jus/synthetic center,
JUS equivalence/isolation, five field types, duplicate/dangling IDs, module/route registration,
registry ordering/conflicts, availability/transitions, typed commands, adapter paging/sorting/
clones/scope, claims, malformed input, loading/retry/rejection, center caches, stale reads
and AST boundaries. These tests were preserved, with composition checks ported to Angular DI.

Browser suites include smoke matrix, flows, controls, workspace keyboard, scope,
interactions, reports, HMR; visual pure/date/export, responsive matrix, interactions,
actual downloads and dashboard follow-ups; architecture injection of page/form/section
overrides, controlled table contracts, adapter read failures/retry and mutation rejection.
Architecture/HMR tests temporarily change source and must restore it; do not run while
capturing pristine reference screenshots or editing the same modules.

`capture-reference.mjs` records every valid default route/section for all three centers,
both shells and 390/768/1280/1536 widths, login at every width and six half-width/height
reflow approximations. Manifest records exact source commit, browser, timezone, viewport,
rendered text/headings/tokens and filenames. It deliberately resets fixture mutations via
full navigation. The aligned Playwright comparison script now compares Angular with the runnable
reference across the same 474 route/viewport cases. A separate overlay script covers open controls;
production interaction tests cover selection, filtering, sorting, density, collection modes,
failure/retry and accepted/rejected mutations. Reflow checks use the equivalent half-size viewport;
native browser UI zoom is not separately automated. See the migration record for actual results.
