# Current visual system

This specification describes the adopted Angular interface, not the historical reference implementation. It applies to shared UI while leaving each application's identity, content, catalogs, and approved workflows under that application's ownership. Existing apps do not define a closed set of centers.

## Sources of truth

- Semantic tokens, font imports, shared spacing/type utilities, and elevation: `packages/ui/src/styles/globals.css`.
- Application values: `apps/<id>/src/brand.css`, its profile/configuration, and its public assets. Generated defaults also record source values in `brand.json`.
- Layout and responsive behavior: `packages/core/src/layout/shell` and the transaction page/layout sources.
- Control appearance and interaction: owned Helm sources in `libs/ui`, generic wrappers in `packages/ui`, and Spartan Brain/CDK behavior.

Do not duplicate a palette or page theme in shared components. Use semantic Tailwind utilities and application-owned configuration. Do not branch on center IDs to choose colors, assets, or behavior.

## Identity and assets

Each app has a fixed identity when launched. The current shell/login has no global center chooser. Shell selection changes layout, not identity or theme mode.

Preserve supplied logos and favicon bytes. Each application's Angular assets configuration maps its public files to runtime URLs; the generator currently maps its public folder under `/assets`. Root `assets` contains tooling source files, not automatically served public content. New centers receive copies of shared default branding assets and the stars pattern; existing apps can retain their own patterns and logo sizing.

A default identity is an optional starting choice. It is not mandatory for other centers. Keep universal status meanings separate from brand accents.

## Surfaces, colors, and controls

The current workspace is light-only: a quiet canvas, white card/popover surfaces, inset navigation, subtle borders, and restrained elevation. Brand colors emphasize navigation, primary actions, and selected states. Shared semantic success/warning/info/danger/neutral roles retain consistent meaning across brands.

Inputs, textareas, selects, and outline buttons use the shared card surface. `--input` is a border-contrast token and may be dark; it must not be reused as a large control fill. Primary and secondary buttons use their respective brand tokens. Keep hover, focus-visible, disabled, invalid, and loading states meaningful.

Owned Helm components currently use Maia's rounded control styling, including capsule-like `rounded-4xl` buttons/inputs/selects and `rounded-xl` textareas. Generic product wrappers may apply their own size utilities. Do not claim every control uses the `radius-control` token just because that token exists.

## Geometry

Current shared geometry tokens are defined in the stylesheet. Their roles are:

| Token              | Role                                                     |
| ------------------ | -------------------------------------------------------- |
| `radius-workspace` | Outer desktop workspace and inset navigation             |
| `radius-panel`     | Major cards and panels                                   |
| `radius-inset`     | Subordinate groups/surfaces                              |
| `radius-control`   | Available product control geometry where explicitly used |
| `shadow-panel`     | Subtle panel elevation                                   |
| `shadow-float`     | Floating surfaces                                        |

Read numeric values from the stylesheet when changing geometry rather than copying a second token table into each guide. Use a clear hierarchy of radii and spacing; do not put a separate elevated card around every cell or label.

The desktop sidebar is 248px expanded and 80px collapsed. It appears at the large breakpoint; smaller viewports use a mobile navigation sheet. On transaction pages, the sidebar can compact between the large and extra-large desktop breakpoints to preserve content space. Long navigation scrolls internally with a hidden scrollbar, while brand/footer controls remain available.

The transaction contextual rail is 286px at the `2xl` breakpoint (currently 1536px). Below that width, an accessible section picker replaces it. These are current shared implementation choices, not a reason to impose one application's business section structure on every center.

Use `min-w-0` through flex/grid content. Tables own horizontal overflow; the document must not overflow sideways. The document owns normal vertical scrolling, with bounded navigation, dialog, and menu scrolling where useful.

## Typography and RTL

Use the shared self-hosted Alexandria family and its installed weights. Keep Arabic shaping natural; avoid negative Arabic tracking. Operational text must remain readable, with supporting metadata subordinate rather than tiny. Use existing type utilities instead of adding competing scales.

Preserve Arabic-first RTL layout and mixed-direction isolation for identifiers, phone numbers, email addresses, and external sample content. Overlays inherit the active document's direction, tokens, and fonts. Calendar-only values must not shift dates through UTC conversion.

## Layout and interaction

Both sidebar and navbar shells use the same page content and data. Navigation groups may render as inline disclosures, dropdowns, or collapsed-rail menus. Mobile navigation is an accessible sheet. Changing the shell preserves route/feature state where implemented.

Compose pages with a clear title, a compact useful toolbar, and appropriately grouped content. Use cards for entities, lists/timelines for narrative content, and tables for comparable records. Empty states explain the next useful action. Charts retain legends, table alternatives, and meaningful status colors; data controls must not imply live backend behavior when displaying samples.

Forms use typed Angular controls and accessible labels/feedback. Preserve drafts after rejection. Menus/dialogs retain keyboard handling, Escape, focus restoration, and disabled reasons. Add icons to clarify meaning, not to replace labels. Product icons use the existing Phosphor system; official generated Spartan primitives may use their generated icon set.

## Scope and limitations

Existing transaction sections, reports, sample KPIs, login behavior, and export workflows are product/demo implementations. Their current shapes are not universal service-center business rules. New requirements must establish what is shared and what is application-specific.

Backend authentication, real payments, independent app-owned Router trees, and exact parity with every historical reference rendering are not established by this visual specification. Current routing limits belong in [architecture](docs/ARCHITECTURE.md); verification limits belong in [validation](docs/VALIDATION.md).

When changing appearance, inspect the actual affected states at useful responsive widths, including keyboard focus, portals, long labels, loading/error/empty states, and reflow. Preserve identity and behavior unless the task explicitly changes them.
