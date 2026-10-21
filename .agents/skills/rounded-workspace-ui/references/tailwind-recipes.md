# React and Tailwind recipes

Adapt these sketches to installed component APIs. Reuse existing shared primitives and typed slots. Map tokens once; do not paste theme CSS into components.

## Tailwind v4 token mapping

Add missing geometry/elevation mappings only in the approved shared theme stylesheet. Reuse equivalent tokens. Supply elevation through the established theme mechanism.

```css
@theme inline {
  --radius-workspace: 1.75rem;
  --radius-panel: 1.25rem;
  --radius-inset: 0.875rem;
  --radius-control: 0.75rem;
  --shadow-workspace-panel: var(--panel-elevation);
}
```

Use `rounded-workspace`, `rounded-panel`, `rounded-inset`, `rounded-control` and `shadow-workspace-panel` after verifying compiled CSS. A light starting elevation is `0 2px 8px rgb(15 23 42 / 0.04)`, defined in theme CSS, never inline JSX. Keep brand values app-owned according to current architecture. Preserve scanning of shared sources.

## Page composition

```tsx
<div className="min-w-0 space-y-5 p-4 lg:p-6">
  <header className="flex flex-wrap items-start justify-between gap-4">
    <div className="min-w-0 space-y-1">
      {/* Existing localized title and description */}
    </div>
    <div className="flex flex-wrap items-center gap-2">
      {/* Existing filters and real actions */}
    </div>
  </header>
  <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
    <section className="min-w-0 space-y-4">{/* Primary work */}</section>
    <aside className="min-w-0 space-y-4">{/* Useful secondary work */}</aside>
  </div>
</div>
```

Place this inside the existing shell. Avoid adding a second main landmark if the shell already owns one. Choose the utility breakpoint based on the full sidebar-plus-content width. Omit utility columns without a meaningful task. Preserve RTL logical placement and DOM reading order.

## Shared panel variant

```tsx
<section className="min-w-0 rounded-panel border border-border bg-card text-card-foreground shadow-workspace-panel">
  <header className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
    {/* Title and action slots */}
  </header>
  <div className="min-w-0 p-5">{/* Content */}</div>
</section>
```

Use existing heading semantics. Optional inset regions may use `rounded-inset bg-muted/40 p-3` when actual contrast works. Keep focus visible and place overflow clipping on dedicated visual/scroll wrappers.

## Metric/entity details

Use `rounded-control bg-primary/10 p-2.5 text-primary` for an icon well with verified tokens. Use `text-sm text-muted-foreground` for labels and `text-3xl font-semibold tabular-nums` for numeric values. Isolate mixed-direction content with `bdi`. Keep comparisons truthful and optional.

## Navigation and filters

Use `rounded-control` for selected navigation, semantic selected colors, icons around 18–20px, readable 14px labels and `aria-current`. Use logical `text-start`, `ms-*`, `me-*`, `ps-*`, `pe-*` and borders for RTL.

Use `rounded-full` for compact filter chips where useful. Preserve semantics: tabs for associated panels, buttons with `aria-pressed` for toggles and Radix selects for selections. Do not replace controls with styled divs.

## Tables and dialogs

Apply rounding/elevation to the shared table container. Keep an inner `overflow-x-auto` region and row separators. Accept typed toolbar labels/actions; preserve stable row IDs, sorting, selection and pagination.

Use restrained panel radii on dialogs and existing Radix titles, descriptions and focus behavior. Ensure portals inherit center tokens. Preserve consequential-action confirmations.

## Motion and checks

Use complete literal classes such as `transition-colors duration-150 motion-reduce:transition-none`. Avoid per-row transforms and large backdrop blur. Verify shared-source utilities in production CSS rather than assuming development output proves scanning is correct.

Check geometry, density, focus, Arabic wrapping and narrow layouts using real states. Run required checks and report evidence actually obtained.
