# Working in this repository

This is a reusable Angular platform for an open-ended number of independent center applications. Existing apps are instances and examples, not a closed product model.

## Before changing code

- Preserve unrelated changes. Inspect the actual implementation and installed versions instead of treating historical documentation as current facts.
- For a new feature, establish whether it is center-specific, shared, or shared with configurable differences. Ask the user if the request and earlier task context do not answer that. Do not repeat an answered question or interrupt routine maintenance whose ownership is clear.
- Keep an uncertain feature local until its common behavior is agreed. Multiple pages using code in one app does not make it shared across centers.
- Read [architecture](docs/ARCHITECTURE.md), the owning package README, and the relevant specialized guide linked from [README](README.md). For appearance changes, use [DESIGN](DESIGN.md) and the current semantic tokens. Archived migration results are historical only.

## Implementation rules

- Preserve Angular standalone, strict types/templates, native control flow, Signals, typed forms, Router/RxJS, and zoneless-compatible patterns. Follow installed Angular defaults rather than adding redundant metadata. Consult available Angular/Spartan MCP or Context7 docs before uncertain API work.
- Keep npm workspaces, one lockfile, Angular CLI, and Turbo. Do not introduce another framework, workspace manager, or component stack without a request.
- Follow the dependency boundaries in architecture. Shared libraries never import apps or branch on named center IDs. Use public package exports. Declare direct dependencies in the owning package.
- Owned components have a matching folder and separate TS/HTML files. Generated Spartan sources retain their supported structure. Add primitives only when needed.
- Shared services receive configuration through typed DI contracts. Do not import an app's environment into a shared package or pass API addresses through page inputs. Preserve adapter boundaries, scoped state, loading/error/retry, and stale-response safety.
- Register pages through the actual route contract and configure menu links separately. Do not claim unimplemented Router options are supported. See [navigation](docs/center-navigation.md).
- Discover application identities from configuration and valid files, not hardcoded lists. Generator scaffolding belongs in neutral templates, not in an example app. Deletion protection is explicit package metadata.
- Preserve localized Arabic UI, RTL, current application-owned assets/branding, accessibility, and existing workflows. Do not invent business rules or present demo operations as production integrations. Rejected forms keep their drafts; calendar-only dates must not shift through UTC serialization.

## Verification and handoff

Use [VALIDATION](docs/VALIDATION.md) to select checks proportionate to the change. Run boundary checks after import changes and focused regressions after tooling changes. Broaden checks when shared scope or failures justify it. Browser checks are for relevant runtime/visual changes, not routine Markdown edits.

Write all Markdown in English, including example labels; this does not change the localized application language. Keep each topic in its canonical guide and link to it rather than repeating tutorials. Report actual checks, existing failures, and limitations separately from historical evidence.

Do not touch CI/CD, push, deploy, or publish unless explicitly requested. Keep changes locally reviewable and preserve valid project skills.
