# Visual decisions

Use [the current design specification](../../../../DESIGN.md) and [shared tokens](../../../../packages/ui/src/styles/globals.css) for repository-specific values. Inspect the actual component utilities before assuming a token controls its geometry.

## Composition

- Give the primary task most of the available space. Add a utility column only when it supports a real secondary task and fits alongside navigation.
- Use inset navigation and an outer workspace surface with a clear hierarchy of panel and inset shapes. A reference image's crop is not a required screen ratio.
- Keep `minmax(0, 1fr)` and `min-w-0` through grid/flex content. Stack secondary content before it compresses the primary task.
- Separate titles, actions, and data through spacing, alignment, and type hierarchy. Do not give every element equal emphasis.
- Keep comparable records in tables or consistent collections. Notes and activity are readable lists/timelines. Avoid elevated cards around every table cell.

## Surface anatomy

| Surface        | Useful content                                              |
| -------------- | ----------------------------------------------------------- |
| Metric         | Label, value, and truthful scope/comparison                 |
| Entity         | Identity, key fields, optional status and relevant actions  |
| Chart          | Header, controls, plot, legend, and alternative data view   |
| Form           | Labels, grouped fields, feedback, and clear action          |
| Attention item | Record identity, reason, deadline, and eligible next action |

Use restrained borders/shadows and the existing semantic roles. Keep backgrounds quieter than the data. Tint and icons clarify meaning; they should not manufacture urgency or imply fabricated activity.

## Identity and interaction

The reference's dark crypto theme is not an instruction to add dark mode. Preserve the app's current mode, brand assets, typography, and common status semantics. Use center-agnostic component variants and configuration rather than center-ID conditionals.

Keep important Arabic text readable and naturally shaped. Isolate mixed-direction values with `bdi` where useful. Avoid truncating important errors or identifiers to force a layout to fit.

Interactive controls need visible focus, meaningful labels, reachable touch targets, and consistent disabled/loading behavior. Menus and dialogs keep CDK/Brain keyboard and focus behavior. Scroll or clip only the region that needs it; do not hide focus rings.

## Common review failures

- Copying fixed dimensions or palettes from a reference instead of reading the current implementation.
- Inventing trends, counts, live indicators, or unsupported product rules.
- Adding page-specific theme CSS rather than fixing an owned shared component.
- Keeping a side column when it causes narrow primary content.
- Removing error/retry/empty states while polishing the populated layout.
- Claiming universal visual parity from a passing build or a single screenshot.
