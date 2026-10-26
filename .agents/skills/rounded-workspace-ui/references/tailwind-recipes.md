# Angular and Tailwind examples

These snippets illustrate composition with existing components. They are examples, not files to add automatically. Use [DESIGN.md](../../../../DESIGN.md) and the actual [shared stylesheet](../../../../packages/ui/src/styles/globals.css) for token definitions.

## A small shared panel

Keep behavior and application data outside a generic display wrapper. An owned component has a matching folder with separate TS and HTML files.

`workspace-panel.ts`:

```ts
import { Component, input, output } from '@angular/core';
import { AppPanel, HlmButton } from '@workspace/ui';

@Component({
  selector: 'app-workspace-panel',
  imports: [AppPanel, HlmButton],
  templateUrl: './workspace-panel.html',
})
export class WorkspacePanel {
  readonly title = input.required<string>();
  readonly busy = input(false);
  readonly refresh = output<void>();
}
```

`workspace-panel.html`:

```html
<app-panel>
  <header class="mb-4 flex flex-wrap items-center justify-between gap-3">
    <h2 class="text-section-title font-semibold">{{ title() }}</h2>
    <button hlmBtn type="button" variant="outline" [disabled]="busy()" (click)="refresh.emit()">
      Refresh
    </button>
  </header>
  <section class="min-w-0" [attr.aria-busy]="busy()">
    <ng-content />
  </section>
</app-panel>
```

Use the relative component import instead of a package barrel when implementing this wrapper inside the UI package itself. Across packages, use public exports.

## Responsive page flow

Place this inside the existing application shell; do not add a second `main` landmark. Omit the aside when there is no useful secondary task.

```html
<div class="min-w-0 space-y-5">
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="min-w-0">
      <h1 class="text-page-title font-semibold">Page title</h1>
      <p class="mt-1 text-sm text-muted-foreground">Current scope and useful context.</p>
    </div>
    <ng-content select="[page-actions]" />
  </header>
  <div class="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
    <section class="min-w-0 space-y-4"><ng-content /></section>
    <aside class="min-w-0"><ng-content select="[page-aside]" /></aside>
  </div>
</div>
```

The example column width is a local layout choice, not a shared token requirement. Check the full viewport, navigation width, and actual content before keeping it.

## RTL, overflow, and states

Use logical utilities such as `ms-*`, `pe-*`, and `text-start`. Use `bdi` for identifiers or external content with a different reading direction. Let tables scroll horizontally in their own wrapper rather than expanding the document.

Use complete semantic class strings. Do not derive a color from a center ID, copy a palette into the template, or use a border token as a control background. Keep loading/error/empty states in the data-owning feature and pass only the display inputs a generic component needs.

Use Angular native template control flow and existing typed form wrappers. Keep overlays in Spartan Brain/CDK rather than recreating focus trapping or menu keyboard logic. Preserve disabled reasons, Escape handling, focus restoration, and portal theme/direction inheritance.

Use brief color/opacity transitions only when useful and respect reduced motion. Verify the actual screen at relevant widths and with keyboard focus; production CSS must include utilities used by shared sources.
