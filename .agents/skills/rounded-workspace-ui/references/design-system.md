# Visual system

## Reference interpretation

Observe `../assets/dashboard-reference.jpg`: the enclosing rounded frame, inset navigation, compact selected navigation row, soft card edges, metric cards above a wide table, small capsules and stacked utility column. Notice the restrained rim highlight and ambient tint.

Transfer those relationships to service-center work. The screenshot is a presentation crop, not a required aspect ratio. Do not reproduce crypto content, market tickers, decorative presentation labels, tiny typography or exchange widgets. Keep important values/actions truthful.

## Proposed token scale

Use these as a coherent starting system, mapped to existing equivalent tokens. These are design choices, not exact measurements from the image.

| Role | Desktop target | Mobile adaptation |
| --- | --- | --- |
| Workspace shell | 28px radius | 16px or edge-to-edge |
| Major panel/card | 20px radius | 16–20px |
| Nested field/item | 12–14px radius | Same |
| Button/input/selected navigation | 12px radius | Same |
| Small filter/badge | Full capsule | Same |
| Page gutter | 24px | 12–16px |
| Panel padding | 20–24px | 16px |
| Grid gap | 16–24px | 12–16px |
| Internal rhythm | 4, 8, 12, 16px | Same |
| Standard control | 40px visual height | 44px touch target when needed |
| Page title | 24–28px, semibold | 22–24px |
| Panel title | 16–18px, semibold | Same |
| Main metric | 28–32px, semibold | 24–28px |
| Data/control labels | 14–16px | Same |
| Metadata | 12–13px | Same |

Use a subtle 1px border and restrained neutral shadow. Prefer faint external shadow on light surfaces and an optional inner rim on dark surfaces. Keep the canvas quieter than cards.

## Composition

- Keep primary navigation around 240–264px where space permits. Preserve an existing 286px contextual transaction rail; do not force two rails plus a utility column into a narrow viewport.
- Give main work `minmax(0, 1fr)`. Use an optional 280–320px utility column only for useful secondary tasks and sufficient space.
- Choose breakpoints by measured content fit, including the full shell. Stack utility content at intermediate widths; keep primary work before it in DOM reading order.
- Use 2–4 metric cards according to content. Use two at medium widths and one on narrow mobile when Arabic labels/values need room.
- Keep tables inside one panel with internal horizontal scrolling and row dividers. Clip visual corners without clipping focus rings. Avoid separate rounded cards around every cell.
- Group titles/descriptions and filters/actions with logical alignment. Wrap naturally and keep primary actions available on mobile.
- Give consequential metrics/charts more space than secondary summaries. Avoid duplicate titles.

## Card anatomy

| Pattern | Structure | Treatment |
| --- | --- | --- |
| Metric | Label/icon, value, comparison/context | Small icon well and clear value |
| Entity/document | Identity, supporting fields, status/actions | Semantic icon, tonal metadata, action footer |
| Chart | Header/controls, plot, legend/table alternative | Quiet plot and meaningful series colors |
| Table/list | Header/filters, collection, pagination/footer | Shared container, subtle row boundaries |
| Form/utility | Title, fields, summary, primary action | Inset fields, explicit validation |
| Attention item | ID/title, reason, deadline, eligible action | Compact row with severity text/icon |

Keep notes/activity as readable lists or timelines, attention content as task-oriented lists, and transaction groups as accessible accordions. Avoid making every content type a uniform card grid.

## Theme translation

Use semantic roles: canvas/background, card, foreground, muted foreground, border, inset surface, primary, primary soft, success, warning, danger and ring. Define a missing role in the approved token location rather than embedding center colors in components.

For light mode use a neutral off-white canvas, white/near-white raised cards, neutral inset regions and measured contrast. In an already-supported dark mode use distinct near-black canvas/charcoal cards and a restrained rim. Keep status semantics identical across brands.

Ambient tint is optional: one static decorative region behind a shell/header, brand-derived, faint and pointer-events-none. Remove it if it hurts readability or violates repository rules. Avoid large blur filters, heavy glassmorphism, photographic backgrounds and animated gradients.

## Review traps

- Use shared radius roles rather than arbitrary rounding.
- Reduce excessive nested cards, borders and shadows with inset grouping.
- Preserve table density when making dashboard cards spacious.
- Preserve branding rather than copying the orange reference accent.
- Keep keyboard focus visible outside clipped containers.
- Keep long Arabic names/errors and numeric values readable.
- Avoid fabricated trends, unsupported percentages and decorative controls that do nothing.
