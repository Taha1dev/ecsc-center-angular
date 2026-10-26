# Archived Angular migration evidence

Historical record only. This is not current verification, a platform-wide product specification, or a requirement to preserve a fixed set of centers.

## Provenance and scope

The migration record was written around 2026-10-21. Its external React baseline was commit `973e72cbd6823737e904dd499ef28e4e0bfe9bc8`, using sample date 2026-10-06 and the Asia/Damascus timezone. The former records are preserved in repository history, including maintenance source commit `c2daa945445037bdfee46ee8a6ef41e42c2fb7c9`.

That work compared the example applications identified as ECSC, M3, and JUS against a separate React checkout. Those names describe the comparison cohort, not a platform center registry. External checkout paths, screenshots, manifests, and original logs are not bundled here and have not been independently revalidated by the current maintenance.

## Observations recorded at the time

The historical report described:

- Strict compilation, library/application builds, domain/adapter tests, browser workflows, and representative accessibility/reflow checks.
- A route sweep of 474 reference/application pairs, followed by focused page and overlay comparisons.
- A final focused page sample with median changed pixels of 0.0225%, maximum 0.6382%.
- An open-state sample with median changed pixels of 0.2486%, maximum 1.8319%.

These are reported historical measurements with different scopes, not one final clean run of every scenario. They are not acceptance thresholds or evidence for later changes. Complete pixel parity was not claimed. Reported remaining differences included chart interpolation/ticks, rasterization, and small calendar alignment differences. Reflow approximations were checked; native browser-UI zoom was not separately automated.

The original capture process initially exposed coordinate artifacts from one screenshot method. Later comparisons used matched Playwright captures, fonts, viewport, timezone, fixtures, and shell state. This methodological distinction is useful when interpreting older screenshots.

## Retained tools

`scripts/archive/compare-reference.mjs` and `scripts/archive/compare-overlays.mjs` retain the historical comparison machinery. They use a baseline-specific center/state matrix and external reference manifests; they are not general workspace discovery tools. Reference input paths must be supplied explicitly, and output defaults to ignored `test-results` subfolders. A runnable compatible external reference is still required for live comparisons.

Do not treat these tools as evidence that current apps match an old reference. Current verification commands and limitations belong in [VALIDATION.md](../VALIDATION.md), and current architecture/design belong in their canonical documents.
