---
name: rounded-workspace-ui
description: Refine service-center dashboards, inboxes, forms, and admin workspaces in Angular with Tailwind, Spartan, and CDK. Use when improving rounded workspace layouts or reviewing their visual consistency while preserving application branding and Arabic RTL. Not for marketing pages or architecture-only work.
---

# Rounded Workspace UI

Refine the requested interface using the repository's existing visual system. This skill supports layout and interaction work; it does not authorize new business rules, broad redesigns, or changes to unrelated applications.

## Inspect before changing

Read [DESIGN.md](../../../DESIGN.md) and inspect the affected components, theme tokens, navigation, and states. Use [architecture](../../../docs/ARCHITECTURE.md) to keep generic controls, shared product features, and app-owned behavior in their proper layers.

Inspect `assets/dashboard-reference.jpg` as a composition reference when visual tools are available. Transfer its hierarchy, inset navigation, rounded layers, and restrained elevation, not its crypto content, dark palette, typography, or presentation crop.

Read [visual decisions](references/design-system.md) for composition guidance and [Angular/Tailwind examples](references/tailwind-recipes.md) when implementing. Token values belong in the canonical stylesheet, not a second scale in this skill.

## Apply the refinement

- Preserve the requested scope, existing identity, localized content, routes, state, and behavior. Do not infer universal rules from a named example center.
- Start with one representative affected view, inspect it, then apply the confirmed correction to the rest of the requested scope.
- Compose through existing Angular components and owned Helm primitives. Use typed inputs/outputs, Signals where appropriate, and Spartan Brain/CDK for overlay and keyboard behavior. Keep owned component templates in external HTML files.
- Author appearance with semantic Tailwind utilities. Preserve light surfaces, shared status meanings, current fonts/icons, and app-owned brand values. Do not add a parallel theme or `::ng-deep` overrides.
- Use spacing and hierarchy before decoration. Avoid unnecessary nesting, fixed heights that clip content, and meaningless utility columns or cards.
- Preserve Arabic shaping, RTL logical alignment, mixed-direction isolation, visible focus, labels, and portal direction/theme inheritance. Respect reduced motion.

## Verify and report

Inspect the affected apps and states at relevant responsive sizes. Include long labels, keyboard/focus, overlays, loading/error/empty states, and reflow when those are affected. Do not run an unrelated full browser matrix for a small correction.

Use [validation guidance](../../../docs/VALIDATION.md) for code checks. A build is not visual QA. State what was inspected, what changed, and any limits. Preserve the reference assets and unrelated changes; do not deploy or publish.
