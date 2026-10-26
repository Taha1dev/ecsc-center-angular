# Service Center Workspace — ECSC / M3 / JUS design system

Documentation labels below are English translations of the localized UI text. They do not change the application language.

## 1. Product identity and visual thesis

This is the employee application of the receiving service centers, not the upstream Hader platform. Hader forwards transactions; a source label may mention it. The app title, login, navigation, logos, dashboard and reports carry the selected center's identity.

Three independently built Angular CLI apps, one shared screen/component system, **three fully implemented center modules**:

| ID     | Center                   | Brand anchors                        | UI calibration                         | Asset                          |
| ------ | ------------------------ | ------------------------------------ | -------------------------------------- | ------------------------------ |
| `ecsc` | Gateway Center           | Blue `#2a3887`, orange `#f88f1f`     | Primary `#33418c`, secondary `#e78927` | `ecsc.png`                     |
| `m3`   | Property Services Center | Green `#41827a`, gold `#baa97d`      | Primary `#397b73`, secondary `#baa97d` | Extracted emblem from `m3.jpg` |
| `jus`  | Justice Center           | Deep green `#002623`, gold `#b9a77a` | Primary `#002623`, secondary `#b9a77a` | Supplied `jus.png`             |

Both should feel precise, confident, contemporary and comfortably readable. Color, composition, real data hierarchy and varied charts provide visual interest. No marketing landing page, default template, faded palette or excessive decoration. ECSC is energetic blue/orange; M3 is composed green/gold with equally clear contrast. They share layout, type, spacing, controls and interactions rather than becoming two unrelated redesigns.

## 2. Center themes and common semantic roles

The repo uses npm/Turborepo with `apps/ecsc`, `apps/m3`, `apps/jus`, `@workspace/core` and `@workspace/ui`. Common semantic tokens/fonts stay in shared globals; each app imports its own `src/brand.css` after globals through `src/styles.css`. Brand values are app-owned; shared screens use semantic roles only. JUS uses the supplied unchanged logo and the same authentic stars login pattern as M3. Its addition preserves existing component geometry and layouts; installing the project-local rounded-workspace-ui skill does not apply its visual refinements.

A typed center composition root updates `data-center` on `<html>` to the configured validated center ID. Brand CSS variables, metadata and bundled logo assets change coherently. Theme selection is center identity, not dark mode. Portaled dialogs, menus and notification surfaces must use the same current profile.

| Role                            | Shared utility                   | ECSC                   | M3                              |
| ------------------------------- | -------------------------------- | ---------------------- | ------------------------------- |
| Primary action/link/lead series | `primary`                        | Calibrated blue        | Calibrated green                |
| Brand selection surface         | `primary-soft`                   | Blue tint              | Green tint                      |
| Secondary highlight             | `secondary`                      | Orange                 | Gold                            |
| Secondary foreground            | `secondary-foreground`           | Dark brown             | Dark gold-brown                 |
| Main canvas                     | `background`                     | Cool near-white        | Neutral green-tinted near-white |
| Panels                          | `card`                           | White                  | White                           |
| Main / supporting text          | `foreground`, `muted-foreground` | Shared readable values | Shared readable values          |
| Navigation region               | `sidebar`                        | Deep blue              | Deep green                      |
| Categorical chart palette       | `chart-1`…`chart-5`              | Blue/orange-led        | Green/gold-led                  |

Status meanings below are **fixed across both centers**. Center green must not be substituted for the success token, nor center orange/gold for every waiting state. Use deliberate saturated brand accents and meaningful neutral surfaces; avoid a full-page colored wash. White small text on orange/gold is prohibited: use the supplied dark secondary foreground. The original M3 green is retained in its ramp; the slightly deeper primary control tone improves contrast. The secondary categorical chart series uses a deeper approved ramp step so orange/gold data marks remain distinct on white panels; secondary UI surfaces retain their supplied tones.

### Status semantics — one mapping everywhere

| State / meaning                             | Semantic set | Label meanings (English)                                 |
| ------------------------------------------- | ------------ | -------------------------------------------------------- |
| Draft / unassigned / neutral metadata       | `neutral`    | Draft, Unassigned, Normal                                |
| Received / claimed / processing             | `info`       | Received, Claimed, In progress                           |
| Waiting for payment / completion / approval | `warning`    | Awaiting payment, Awaiting completion, Awaiting approval |
| Successful completion / paid / accepted     | `success`    | Completed, Paid, Accepted                                |
| Rejected / cancelled / failed / overdue     | `danger`     | Rejected, Cancelled, Failed, Overdue                     |

`Overdue` is an independent deadline attribute, not a lifecycle state. A request can be `In progress` and `Overdue`; render two distinct labels. Urgency is independent too: an `Urgent` priority label uses warning, not a full red row. Fee payment state and transaction lifecycle must not be conflated.

Implement `StatusBadge` from a central map: background `*-soft`, text `*-foreground`, border `*-border`, optional meaningful icon. No colored cells that obscure text. Alerts, activity events and status charts reuse this map. Categorical charts use the fixed five chart tokens and visible legends; they do not define business state colors.

## 3. Arabic typography

**The product font is Alexandria**, self-hosted through Fontsource with only weights 400/500/600/700. Preserve the approved reference typography and palette. Use one family throughout navigation, controls, tables, dialogs and ECharts. Keep Arabic letter spacing natural and provide 1.7–1.75 line height for small UI text.

| Element                                       | Utility / size                | Weight / line height |
| --------------------------------------------- | ----------------------------- | -------------------- |
| Page title                                    | `text-page-title` (~28px)     | 600 / 1.45           |
| Section heading                               | `text-section-title` (~18px)  | 600 / 1.55           |
| Paragraph / important description             | `text-base` (16px)            | 400 / ~1.7           |
| Navigation, table, input, button, field label | `text-ui` or `text-sm` (14px) | 400–500 / 1.5–1.65   |
| Secondary metadata / chart ticks              | `text-xs` (12px)              | 400 / 1.6            |
| Standard metric                               | `text-metric` (~32px)         | 600–700 / 1.25       |
| Lead dashboard metric                         | `text-4xl` or `text-5xl`      | 600 / 1.2            |

No essential controls below 14px; no text below 12px. Avoid 300/light weight for working content. Do not use negative letter spacing on Arabic. Use `tabular-nums` for numeric alignment and intentional bidi isolation. Use `Intl.NumberFormat` / `Intl.DateTimeFormat` with one centralized formatting policy, Arabic locale and `Asia/Damascus`. Western digits may be used consistently for searchable IDs and metric comparison; Arabic labels remain mandatory. Never compress a national identifier by changing the font size.

## 4. Surfaces, spacing and density

- Base rhythm: 4px. Common gaps: 8, 12, 16, 20, 24 and 32px.
- Page padding: 16px mobile, 24px medium, 28–32px wide.
- Panels: `rounded-xl border border-border bg-card shadow-panel` (about 12px corner).
- Controls: `rounded-md` / `rounded-lg`, 40px default height; 36px compact toolbar actions; 44px primary touch controls.
- Tables: 52–60px comfortable rows, 40–44px compact rows, readable 14px text in both. Dense mode reduces padding, not font readability.
- Header: about 64–72px. Sidebar: about 248px expanded and 76px collapsed. These are design targets, not constraints that override text enlargement.
- Detail drawer: 420–520px on desktop, full-width on small screens. Form dialog: 480–640px; wide structured form: up to 760px.
- Use white panels and cool-light canvas. Use crisp white panels, a lightly tinted canvas, refined shadows and varied tonal KPI accents. Avoid neon, heavy gradients and large decorative backgrounds.
- Four compact tonal quick-stat cards lead the dashboard. A small deep-brand metric surface anchors the separately labelled secondary summary. The selected center's secondary accent supports a leading figure; orange/gold stays selective.
- Main document owns vertical scrolling. Tables may own horizontal scrolling. Avoid nested vertical scroll regions; exception: a genuinely long modal/combobox or sticky navigation confined to available height.
- Maintain `min-w-0` through grid/flex descendants. Tables must never expand the document beyond the viewport.

## 5. Shared primitives and visual states

The existing `@workspace/ui` package owns locally owned Helm components over Spartan Brain and Angular CDK primitives for Button, Input, Select, Combobox/Command, Popover, Calendar, DropdownMenu, Dialog, AlertDialog, Sheet, Tabs, Tooltip, Sidebar, Table, Pagination, Badge, Checkbox, Skeleton and Sonner. Reuse the installed catalog and version-specific APIs. Customized appearance belongs in Tailwind classes and typed variants.

Keep generic primitives/wrappers in `packages/ui`; keep shared center/transaction-aware adapters in `packages/core` and app-specific extensions inside each app. Product-specific status/action/field configs flow into shared UI as typed props; the UI package must not import fixtures or application state.

Build reusable product wrappers:

- `PageHeader`: breadcrumb/context, one title, optional supporting sentence, primary action.
- `FilterPanel`: dynamic field layout, clear apply/reset actions, optional advanced controls, applied-filter chips.
- `DataTable`: header, column configuration, row selection, sort, pagination, density, action column.
- `StatusBadge` / `PriorityBadge`: centralized text, icon and semantic style.
- `ActionMenu` / `ActionToolbar`: typed action descriptors; one primary action, up to two frequent secondary actions, remaining actions in a menu. Optional `group: { id, label, order? }` and `intent` preserve older flat callers. Group labels are compact and muted, with icons beside items and exactly one separator between populated groups. Product groups are View and details, Processing, Additional actions. Ordinary actions stay neutral, navigation uses primary, consequential actions use warning, destructive actions use danger. Disabled reasons and existing confirmation dialogs remain intact. Spartan Brain and Angular CDK handle RTL collision positioning, arrow-key traversal, disabled-item skipping and focus restoration.
- `FieldGroup`, `KeyValueList`, `EntityCard`, `DocumentCard`, `PaymentSummary`, `ActivityTimeline`.
- `MetricCard`, `ChartPanel`, `ChartLegend`, consistent tooltip treatment.
- `EmptyState`, `ErrorState`, `LoadingState`, form feedback and contextual notices.

Every control has default, hover, focus-visible, disabled and relevant loading/error states. Do not create decorative buttons that do nothing. Close button, cancellation, backdrop/Escape handling and focus restoration work in every dialog/sheet. Toasts use Arabic and stay clear of the focused field; serious validation errors remain beside the field.

## 6. Two app shells, one product

Two application layout variants must be available across all authenticated routes:

1. **SidebarShell** (default): right-side branded deep blue/green navigation + light topbar. Expanded/collapsed sidebar, clear active page, counts, compact center selector, user account, notifications and breadcrumbs.
2. **NavbarShell**: horizontal center-branded navigation along the top, light secondary context/action bar, no persistent global sidebar. Include accessible dropdown groupings when necessary.

Two centers × two navigational layouts are required. Shell choice is independent of center choice, and neither is a dark/light toggle. Keep the same route and content, filters, actions and typography in both. Use a small labelled view selector (`Layout` → `Sidebar` / `Navbar`) in the account menu or header; persist only this device preference. No duplicated pages. A demo center selector exposes both identities, changing center-specific metadata/data together.

Global destinations: Home, Personal inbox, Group inbox, Reports. A currently opened transaction is shown through breadcrumbs and an appropriate current context; avoid requiring users to choose a generic ID-less Transaction management route. A recent demo transaction link can be exposed in the demo entry.

At small widths both variants collapse to a real mobile navigation sheet. Login uses a separate AuthLayout without application navigation. Branding uses the selected center name and its supplied authentic symbol. No Hader wordmark or fabricated government emblem.

## 7. Login

A confident, credible employee login, with generous focus on the form, an understated center-branded deep blue/green region and a restrained orange (ECSC) or gold (M3) accent. The validated login route determines the center; the login form has no center selector. The same form/layout is reused. Desktop: split composition with about 42% brand region and 58% form region; mobile: compact brand header and full-width form. No stock photo or large hero.

Arabic username/email and password labels, password visibility, remember-device and help remain. One primary `Sign in` button submits the local prototype even with blank fields, by click or Enter. No separate demo bypass, credential persistence or authentication request. The identity panel contains only the authentic logo, center title and a decorative static pattern at 12% opacity. ECSC uses original orthogonal circuit traces inspired by [WebberUI circuit lines](https://webberui.com/en/docs/circuit-lines-background); M3 repeats the supplied transparent star strip without changing its geometry.

## 8. Homepage dashboard

Use the supplied dashboard inspiration for compact card proportions, a clean hierarchy and generous chart space. Keep Arabic RTL, authentic center identity and the brighter semantic palettes. A compact header presents title, selected date range, truthful last refresh and export. Four quick-stat `MetricCard variant="compact"` cards lead the work surface (four columns wide, two smaller, one mobile), with genuine period comparisons or a visible unavailable reason.

The primary trend uses `ChartPanel variant="primary"` / `ChartWorkspace variant="primary"`, spanning the full available main content width inside either shell. Its generous plot sits directly beneath quick stats. Supporting charts occupy a balanced two-column grid with the attention panel. Each compact toolbar includes period context, CSV/XLSX export, chart/table view and expansion. Tables scroll inside their panel on mobile, never at document level.

All additional metrics sit in the labelled secondary summary: all-time/month/year synthetic snapshots, sample today/week counts, active/total users and reference-day registrations. Wider snapshots stay fixed and are excluded from filtered exports. Account metrics come from deterministic dated fixtures. Definitions remain available through a compact expandable explanation.

The full-width recent-activity panel derives events from the selected center's receipt cohort. It shows actual action descriptions, applicant/actor, Damascus timestamps and links to the transaction activity section. Seed timestamps are deterministic and never precede receipt; new local edits use their actual session timestamps. Changing center or range changes the event source. There is no simulated live badge or fabricated increase.

One inclusive local calendar date range drives the four chart datasets, data tables, current-scope KPIs, exports and inbox links. Time aggregation (daily/weekly/monthly) changes bucket size, never the selected date range. Applied chips and reset remain visible. A refresh rereads local state and reports the actual completion time in Damascus; it does not imply a server update.

Transaction charts use the live 48-record sample, whose known coverage is 2026-10-01 through 2026-10-06. Account registration fixtures cover 2026-01-01 through the reference date. Missing prior coverage produces an explicit unavailable comparison, rather than invented percentages. Valid comparisons use the immediately preceding range with the same number of inclusive days. Previous zero totals have an absolute change and an unavailable percentage when the current value is positive.

The four charts are area (received/currently completed receipt cohorts), status donut, stacked radial rings by service group, and dated account registrations. The workload radial chart follows the shadcn radial structure: rounded arcs, muted background tracks and a central fixture-derived total. Each ring represents a service group, from inside to outside in the order of the Arabic group list; arc lengths use a shared scale anchored to the largest group in the period. Segments retain common status colors. The group list shows exact counts with accessible inbox links. Legend toggles affect presentation only; the total, table and exports preserve the complete selected dataset. Leave room for the wrapped legend on mobile and in the expanded chart. Current completion status is not an invented completion timestamp. All dates and account histories are demonstrative, never represented as measured production history.

Use vivid center-led categorical tokens with cyan/violet/rose support. Status charts continue to use the shared status map across both centers. Three-pixel lines, unique SVG gradient IDs, rounded bars, restrained area fills and active points improve readability. Chronology is left-to-right; visible text and tooltips are Arabic and RTL. Count axes start at zero; distributions expose counts and percentages with the full selected sample as denominator.

Every chart has keyboard series toggles with visible markers, a chart/table view, an expanded Spartan dialog and CSV/Excel/view-data menu. Hiding series changes presentation only: the accessible table and export retain every series, with this scope explained. Status/service links (and clickable chart marks) open the inbox with matching date and dimension parameters. The attention panel links overdue/open, unassigned and waiting records in that same range.

Date ranges use the shared Angular calendar inside Spartan Popover, Arabic locale, two months on desktop and one on mobile. Month/year dropdowns, keyboard day navigation, reference-based presets, draft/apply/cancel/clear and incomplete/required feedback are mandatory. Calendar dates serialize from local year/month/day, never via UTC `toISOString()`.

Shared exports use typed cells, Arabic metadata/headers, safe quoted UTF-8 BOM CSV and genuine XLSX from dynamically imported ExcelJS. Spreadsheet formula prefixes in text are neutralized; numbers remain numeric and Date cells retain a date format. Workbook sheets have useful widths, frozen headers and RTL views. Blob URLs are released; failures remain Arabic. No export or PDF preview claims official document generation.

## 9. Mailboxes

Personal and group inboxes share the same underlying UI and table configuration. Their headings, ownership scope, saved views and available actions differ.

Search filters are a substantial, first-class part of the page: ID/person search, processing team, transaction group/type, status, date range and priority; advanced owner/review/deadline fields when useful. Configure relevant dependencies (service group → transaction type) with local fixtures. The receiving provider is the selected center; center identity belongs in the context header and never mixes records from both centers. Teams/service examples are illustrative fixtures. No giant empty filter area. Desktop: orderly 3–4 column layout; mobile: stacked controls and collapsible advanced fields. Apply/reset buttons and removable applied-filter chips.

Table behavior: sorting, optional columns, pagination, row selection, comfortable/compact density and overflow-safe cells. Default columns: checkbox, transaction ID/type, applicant, service group, status, current step, received date, deadline/priority, employee where relevant, action menu. Center identity may be an optional metadata column, not a redundant default column. Choose a readable essential subset on narrower screens and retain the full desktop table inside horizontal scroll.

All rows are scoped to the selected center. ECSC types may include agency inquiries, vehicle services and entry permits; M3 includes cadastral statements, property-record extracts and ownership-transfer transactions. Each row resolves dynamic actions from its fixture, e.g. Open, Claim, Follow up, Transfer, Request completion, View activity log. One row may have two actions and another seven. Show a frequent action directly only when useful; remaining actions in a menu. Opening the transaction ID navigates reliably. Header bulk actions reflect selected IDs and eligibility; explain skipped records and do not silently mutate them.

Provide saved-view chips such as All, Unclaimed, In progress, Overdue. Counts derive from fixtures and active scope. Searching does not discard input focus. Refresh has a brief loading state and preserves applied filters and selection of existing rows.

## 10. Transaction workspace — at least 14 sections

Route identity and fixture keys include the center ID; opening a transaction from another center yields an Arabic not-found state, not the first available record. An opened transaction uses a compact identity summary (ID/type/applicant/receiving center/service group), lifecycle badge, deadline badge, owner and a readable step sequence. One primary next-action control plus frequent secondary controls and an overflow menu. Summary must not occupy half the viewport.

Do not squeeze 14 labels into a horizontal tab strip. Use a grouped contextual section navigator, about 190–220px at wide widths. Keep the main section large. At 1280px reduce or collapse the global sidebar before sacrificing the content. At tablet/mobile use a section picker or navigation sheet. A compact context rail for recent activity/fees is optional when space permits; don't create three permanent narrow columns.

Groups: Request data, Documents, Finance, Processing and follow-up.

| Section                | Preferred data presentation                      | Representative interaction                       |
| ---------------------- | ------------------------------------------------ | ------------------------------------------------ |
| Overview               | Key-value summary + workflow + recent events     | Follow next action, reveal full details          |
| Applicants             | Person/company cards; lead applicant identified  | Add/edit person in dialog, contextual menu       |
| Parties and agencies   | Linked entity cards or compact relationship list | View party/agency in drawer                      |
| Transaction fields     | Label/value groups, typed field controls         | Edit field or group; each field retains actions  |
| Required documents     | Checklist with provided/missing/optional text    | Add local demo document, inspect requirement     |
| Attachments            | Document cards/list with metadata                | Preview, local file selection, contextual action |
| Payments               | Payment summary + true multi-record table        | Create initial/final payment; local confirmation |
| Fees                   | Itemized fee list/table + totals                 | Inspect a fee, demo adjustment dialog            |
| Refunds                | Compact refund list with status                  | View/create illustrative refund                  |
| Decisions              | Decision cards with author/date/body             | Add/view decision with confirmation              |
| Actions                | Available-action list grouped by purpose         | Open each action's corresponding flow            |
| Notes                  | Internal note thread / activity-style cards      | Add/edit local note, resolve a note              |
| Activity and transfers | Chronological timeline with event filters        | Inspect event, filter actor/type                 |
| Print and output       | Document template cards + preview panel          | Configure template, print preview                |

Single record: use an entity card or labelled detail group. True comparable collections: use a table. Long narrative/history: use timeline/cards. Do not force every section into a DataTable. Every record retains its own actions regardless of presentation.

Section badges count items and signal missing requirements only when meaningful. Empty sections explain what will appear and offer an applicable action. For unavailable actions preserve discoverable reasons. Render short vs long action labels, 1 vs 8 actions, short vs long field values and files with long Arabic names.

## 11. Reports directory and dynamic parameter flow

Each center gets meaningful report definitions: ECSC service/employee/beneficiary reports, M3 cadastral/property/fee/processing reports, plus shared generic reports. Reports initially display a searchable directory, not a dashboard of completed graphs. Prominent autocomplete/combobox at the top, suggested reports when empty, filtered suggestions as the user types, keyboard navigation and enter selection. Also show browsable report cards/list with category, description and an explicit choose action.

Example categories: Transactions, Employees, Beneficiaries, Finance. Include 8–12 report fixtures with materially different parameter sets.

Choosing a report opens a consistent form panel or dialog with report-specific controls. Date range may be required by one report and optional/absent in another. Service group/team, status, employee, transaction type, payment type and grouping are descriptor-driven within the selected center.

Two controls are **always present and placed last**: `Report file type` and `Filename`. CSV and Excel generate real local downloads; PDF remains a clearly labelled preview. Date range is not universally mandatory. Changing report clears incompatible old parameters while preserving valid shared ones deliberately.

Primary flow: select report → fill valid parameters → `Create preview` → brief pending state → ready preview/results. Include return/edit parameters, one empty-result example and a retryable simulated error example. Clearly identify illustrative output; no fake claim that a real system report was exported.

## 12. Responsive and quality gates

- 1536px: spacious clear composition; avoid wasted full-width empty regions.
- 1280px: complete desktop workflow, no clipped labels/actions, content remains usable in both shells.
- 768px: fewer grid columns, adaptive section navigation, reduced table columns or scoped scrolling.
- 390px: readable Arabic, no global horizontal scroll, stacked forms, full-width sheets.
- 200% zoom: controls and labels reflow without overlap or lost actions.
- Keyboard: navigate shell, autocomplete, table actions, section picker and dialogs; focus is visible and restored.
- Empty / loading / validation-error / retryable-error / success / disabled states all have real examples.
- Inspect color roles and typography across pages. No isolated new shade, unexplained chart color or English tooltip.

## 13. Actual repo ownership, assets and center isolation

Baseline: `Taha1dev/ecsc-center` on `master`, commit `de993434e1481ffda1cf5d95448a37beb78d24ae`. Existing workspace manager is **npm**, runner **Turborepo**, app packages `ecsc`/`m3`, shared packages `@workspace/core`/`@workspace/ui`. Preserve npm/Turbo commands, one lockfile, Phosphor, RTL, product tokens and public exports. Use the Angular CLI multi-project workspace.

| Supplied file | Target in this repo                  | Responsibilities                                                               |
| ------------- | ------------------------------------ | ------------------------------------------------------------------------------ |
| `styles.css`  | `apps/<center>/src/styles.css`       | Single Tailwind import, shared globals import, app/UI source registration      |
| `globals.css` | `packages/ui/src/styles/globals.css` | Font/animation/compatibility imports, common tokens, theme mappings/base rules |

The Angular CLI application build includes only its app-local `src/styles.css`. Shared globals does not import Tailwind. Owned Helm components share the canonical semantic tokens; Spartan default examples do not replace the approved design. Default explicit source path `../../../packages/ui/src` is resolved from the app stylesheet. Correct the starter's invalid shared `@source` paths instead of copying them into this entry.

Apps own profiles, services, specialty reports and overrides. Core owns the generic provider, adapter contracts, rules, shells and shared feature defaults. Shared UI uses CSS tokens/props, never application imports. Use `@workspace/ui` exports, not cross-package source imports. No new `packages/theme` is needed.

### Brand asset handling

The inspected ECSC PNG contains the blue/orange symbol on a white disk. Move it to `apps/<center>/src/assets/brands/ecsc/logo.png`, preserving its geometry and source colors. Make its white disk intentional on both branded and white backgrounds.

The inspected M3 JPG (892×630) contains an interlocking green/gold emblem at the top, Arabic/English name below and a faint cadastral-map background. Move the original to `apps/<center>/src/assets/brands/m3/source.jpg`. Extract only the upper emblem to `logo-icon.png`: a useful approximate starting crop is x=310–585, y=95–350 on that source, but inspect and refine rather than blindly trusting coordinates. Remove the paper/background with transparency; exclude all lettering. Preserve antialiased edges, thin details, exact silhouette and green/gold colors. No generic icon, traced approximation or regenerated identity.

Use image imports in the center registry. Center-specific favicons, collapsed sidebar marks and mobile/header logos use authentic symbols. Check extracted M3 on white and dark green surfaces; do not claim transparency if the paper is still present. Keep the original source asset after extraction and only remove obsolete root asset locations after all references work. No source artwork is included in this task kit; the actual repo already owns it.

### Scope isolation

Route family `/centers/:centerId/...` keeps the center explicit; login uses the fixed validated module. Unknown IDs or foreign transaction IDs show an appropriate Arabic state. Fixture key includes `(centerId, transactionId)`. Same-number transactions in ECSC and M3 are independent.

Each independently hosted app binds its own center module; foreign-center routes are rejected. Dashboard/badges/filters/reports/notifications/title/favicon/logo/portals use that module. On shell switch within the same center, current section and form drafts remain stable. No claim of production center-access permissions is made.

Remove starter dark-mode provider/tokens/shortcut and English starter screen/title/favicon. Keep all app/control labels Arabic. Hader appears only where it accurately describes an incoming transaction's source.

## 14. Reference documentation

Use current docs matching installed dependencies:

- [Tailwind v4 Angular integration](https://tailwindcss.com/docs/guides/angular)
- [Tailwind theme variables and inline mappings](https://tailwindcss.com/docs/theme)
- [Apache ECharts handbook](https://echarts.apache.org/handbook/en/get-started/)
- [Angular CDK bidirectionality](https://material.angular.dev/cdk/bidi/overview)
- [TanStack Angular Table](https://tanstack.com/table/latest/docs/framework/angular/angular-table)
- [Alexandria Fontsource](https://fontsource.org/fonts/alexandria)

- [Tailwind v4 source scanning in monorepos](https://tailwindcss.com/docs/detecting-classes-in-source-files)
- [Angular multi-project workspaces](https://angular.dev/reference/configs/workspace-config)
- The repository uses npm workspaces; preserve its actual package-manager/task commands.

Current implementation references: [Spartan Brain and Helm](https://spartan.ng), [Angular accessibility](https://angular.dev/best-practices/a11y), [ExcelJS workbook documentation](https://github.com/exceljs/exceljs). The preserved React reference determines appearance and calendar behavior.

## Transaction workspace and attention refinement

On wide desktop, the contextual rail is 286px and uses a multiple-open Spartan Brain accordion: Request data, Documents, Finance, Processing and follow-up. Every section has its own Phosphor icon and a relevant count/status badge. Navigation opens the active group without closing others; collapsing retains the URL section and open form draft. Below 1536px the accessible section picker replaces the rail. The sidebar shell automatically contracts to an icon rail between 1024 and 1535px on transaction pages, preserving working space.

Comparable applicants, linked parties, documents and refunds use shared CollectionView tables/cards. Both views share records, selection and actions; the mounted table retains sorting and column settings during view changes. Payments and fees remain genuine tables. Narrative notes and activity retain their appropriate layout. Entity/document cards use a tinted icon header, clear identity, readable values and a separated action footer. Editable inputs have Arabic examples; unavailable read-only data uses Unavailable.

The attention panel has intrinsic height and shows up to five unique center/date-scoped transactions, including all applicable reasons, deadline and eligible claim action. Categories filter locally; View all opens the corresponding inbox with the same receipt-date scope. Claim uses the existing confirmation and updates the center store, counts, inbox and activity. Empty states remain compact.

## Independent center apps

The authorized application split supersedes the earlier single-app deployment and center-switcher design. apps/ecsc and apps/m3 own their branding assets, fixed CenterProfile, entry HTML, fixture selection and typed route/page customization. Both compose the shared @workspace/core product and @workspace/ui design system. Their existing dashboard, transaction, reports and login designs remain shared defaults. No center chooser appears in either shell or login; foreign-center URLs are rejected. Each HTML entry starts with its own Arabic title, favicon and data-center attribute before Angular paints.

## Modular composition

The 14 default transaction sections are separate components selected through the center section registry. M3 supplies its existing property-fields renderer app-side with the same spacing, controls and data; other sections remain shared. Counts, groups, order, visibility and icons can be supplied per entry. Forms and read-only previews use an action registry and retain confirmations, disabled reasons and keyboard behavior.

The design-system page demonstrates externally controlled table pagination/sorting/total count alongside client collections. Bulk-action text is provided by the product. Asynchronous adapters expose loading, retry and mutation states; drafts and shell preference remain UI-owned. Center palette values live in each app’s brand.css; fixed status colors stay in UI globals.

## Rounded workspace refinement

The project-local rounded-workspace-ui reference now guides geometry across ECSC, M3 and JUS, translated into the existing light theme and Arabic RTL. Shared Tailwind theme roles define a 28px workspace frame, 20px major panels, 14px inset regions and 12px controls; status and saved-view chips use capsules. Panel elevation is a subtle 2px/8px shadow, with stronger elevation reserved for popups/dialogs. These roles do not change brand or status colors.

Both shells sit inside the page gutter. The branded sidebar is inset 16px on desktop; the main frame has its own rounded header and neutral working surface. Mobile uses an 8px outer gutter, smaller frame rounding and 12px content padding, growing to 24px on desktop. Compact metrics, the full-width primary chart, supporting charts, attention list and recent activity retain their existing hierarchy. Inbox filters, table toolbar/footer, entity cards, transaction rail and inset field/requirement groups use the same shared shapes without changing density or behavior. Table scrolling remains inside a keyboard-focusable region; popups and dialogs retain the reference focus/confirmation behavior through Spartan Brain and CDK.

CenterProfile accepts optional `loginLogoSize: "standard" | "wide"`. JUS opts into `wide`: a 400×200px object-contain login box that scales proportionally to available width; navigation logos remain compact. Other centers retain their original login logo dimensions. The design-system page demonstrates all four geometry roles.

Shared IconWell containers use their semantic tone in a bottom-left to top-right color-to-deeper-color gradient, white icons, an integrated faint sheen and a tight inset/drop shadow. There is no separate white top border or highlight strip. Metrics, entity/document/report cards, chart headings, recent activity and attention items share this treatment across all centers, including their showcase examples. Attention items retain danger, info and warning tones. Card content and comparisons remain unchanged; there is no animated glow.
