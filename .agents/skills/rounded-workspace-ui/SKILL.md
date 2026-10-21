---
name: rounded-workspace-ui
description: Refine service-center dashboards, inboxes, transaction workspaces, forms and admin interfaces with rounded layered cards, inset navigation, compact toolbars and a balanced responsive layout inspired by the bundled dashboard reference. Use for ECSC/M3 visual refinements or requests for this rounded workspace style in React, Tailwind and shadcn. Preserve the existing brand and theme; support Arabic RTL and light surfaces without imposing the reference's dark crypto theme. Do not use for architecture-only refactors, marketing pages or unrelated visual styles.
---

# Rounded Workspace UI

## Start from the actual interface

1. Read repository instructions and inspect target pages, shared UI, tokens, routes and business interactions. Recheck current code; do not assume an earlier architecture still applies.
2. View `assets/dashboard-reference.jpg` when image tools are available. Read `references/design-system.md` for visual decisions and `references/tailwind-recipes.md` for implementation recipes. Treat dimensions as proposed tokens, not measured facts about the screenshot.
3. Preserve identity, content, data, behavior, URL state and accessibility. Translate the reference's geometry and hierarchy into the existing components.
4. Apply and inspect the complete visual system on one representative page within the requested scope, then propagate it across the other requested pages. Finish the authorized scope; do not stop at a proposal or demo.

## Preserve the visual signature

- Compose an inset workspace with a rounded outer shell, distinct navigation surface, dominant main column, and optional utility column for useful secondary tasks.
- Use rounded rectangles for cards and full capsules for small filters/badges. Maintain a hierarchy of radii rather than giving everything the same rounding.
- Structure cards with clear headers, meaningful content, subordinate metadata and restrained inset regions. Use spacing and hierarchy before decoration.
- Use a fine border and subtle shared elevation token. Reserve stronger elevation for dialogs/popovers. Avoid strong shadows on nested surfaces.
- Align titles, metrics, charts and actions to a consistent grid; preserve practical table/form density.
- Keep one dominant brand accent. Optional static ambient tint belongs behind navigation/header, away from text and data. Keep it faint and removable.
- Keep charts, status colors and interactions meaningful. Preserve loading, empty, error, disabled and selected states.

## Adapt theme and identity

- Default to the application's current mode. For ECSC/M3, preserve the existing light-only product unless explicitly changed. A dark reference does not authorize dark mode.
- Use neutral canvas, raised cards and inset surfaces in light mode. Preserve the same geometry in an already-supported dark mode.
- Preserve center semantic brand tokens, authentic logos and names. Verify current ECSC blue/orange and M3 green/gold tokens before editing.
- Keep component variants center-agnostic. Use semantic CSS variables; never branch on center IDs to choose colors.
- Treat the crypto labels, orange primary button, English typography and black background as reference content, not product requirements.

## Implement through shared components

- Refine existing panel/card, table, metric, toolbar, navigation, field, badge and dialog primitives. Add variants only when repeated usage justifies them.
- Keep product data/actions outside generic UI. Accept typed header, icon, toolbar and action slots.
- Use Tailwind utilities and complete literal class strings or cva maps. Follow the installed Tailwind version and shared-source scanning setup.
- Centralize geometry/elevation through existing tokens or approved theme mappings. Do not add page CSS, CSS modules, inline appearance styles or a parallel styling system.
- Preserve Radix/shadcn semantics and the established icon family. For ECSC/M3, retain Phosphor and Alexandria.
- Use grid/flex flow; reserve absolute positioning for decoration or genuine overlays. Avoid fixed heights that clip Arabic labels/errors.
- Preserve shared-component public APIs unless a compatible migration is required by the task.

## Arabic, responsive behavior and accessibility

- Mirror navigation/utility placement for RTL. Use logical alignment/spacing and `bdi` for mixed-direction identifiers. Preserve Arabic shaping; avoid negative tracking.
- Keep operational labels at least 14px, metadata at least 12px, and Arabic line height around 1.5–1.75. Do not imitate the screenshot's miniature text.
- Provide visible focus, labeled icon buttons, descriptive dialogs and text/icon status cues. Measure contrast on actual rendered tokens; decorative borders cannot replace focus rings.
- Provide sufficient touch hit areas; compact visuals can have larger hit areas when needed.
- Stack the utility column before the main work becomes narrow. Reuse existing mobile navigation. Keep contextual transaction rails only where they fit.
- Reduce outer padding/excessive shell rounding on mobile. Permit horizontal scrolling inside tables, never on the document.
- Respect reduced motion. Use short color/opacity transitions; avoid animated glows, hovering data rows or motion that obscures task progress.

## Verify before finishing

Inspect requested pages in both center identities with keyboard navigation, long Arabic labels, dialogs/portals, populated/empty/error states, and 390/768/1280/1536px widths. Check 200% zoom or report a reflow approximation explicitly. Confirm selection, sorting, filters, forms, route state and consequential-action confirmations still work.

Run repository-required checks appropriate to the change. Use screenshots for visual judgment; a build alone is not visual QA. If browser access is unavailable, report that limit without claiming visual checks passed.

Summarize changes and checks actually performed. Do not deploy or change business rules just to apply this style.
