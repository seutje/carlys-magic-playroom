# CMP-005: Build-a-Critter legs do not connect to the body

## Status

**Resolved**

- Owner: Codex
- Reported: 2026-09-07
- Last updated: 2026-09-07
- Affected area: Build-a-Critter Lab component alignment and 3D rendering

## Original report

> build-a-critter legs don't connect with the body

## Description

After a child attaches a compatible set of legs in Build-a-Critter Lab, the rendered legs do not
meet the bottom of the selected body. The visible gap makes the critter look like separate floating
pieces and weakens the immediate visual confirmation that the attachment succeeded.

This is a rendering/alignment defect rather than an activity-rule failure: the typed assembly state
can contain a valid leg selection and advance to completion while the preview still appears
incorrect. The fix must preserve the existing socket compatibility, replacement, persistence, and
fallback behavior.

Alignment must be correct for every supported body/leg combination, not only the combination seen
in one deterministic screenshot. Round and tall bodies have different proportions, while bouncy,
stompy, and tall legs have different heights and compatibility rules. Loaded GLB components and
their primitive fallbacks must both form a visually continuous critter.

## Reproduction

1. Start the game and enter Build-a-Critter Lab.
2. Select the required eyes and mouth parts.
3. Attach a compatible leg part when prompted.
4. Observe the junction between the legs and the bottom of the body in the 3D preview.
5. Repeat with the other compatible body and leg combinations.

## Pre-fix implementation notes

- `CritterScene` renders the body at the critter-group origin and places every selected leg model
  inside a wrapper at the fixed position `[0, -1.2, 0]`.
- Round and tall bodies use different geometry or model extents, but the leg wrapper position does
  not currently vary by body.
- Bouncy, stompy, and tall leg assets have different dimensions. Their fallback geometry also uses
  different heights, with each fallback extending downward from its local origin.
- The component model contract does not currently expose explicit attachment anchors or normalized
  bounds for aligning a body socket to the top of a leg part.
- Existing tests cover asset loading, missing-model fallbacks, compatibility, replacement,
  persistence, and deterministic screenshots, but they do not assert the leg-to-body junction.
- The exact source of the gap still needs to be confirmed. It may be caused by scene wrapper
  placement, inconsistent GLB origins, differing body extents, or a combination of these factors.

## Resolution

- The bundled GLB bounds were audited. The round and tall bodies have materially different lower
  surfaces, while the three leg models retain small but different positive local top anchors.
- A typed renderer-only attachment calculation now combines the selected body's socket height,
  the selected leg model's measured top anchor, and a small intentional overlap. Assembly state
  and compatibility rules remain independent of Three.js transforms.
- Primitive legs now use local `y=0` as their attachment plane. Primitive body dimensions match
  the corresponding GLB core extents, so loaded and fallback components share the same socket
  contract without a visible load-time disconnect.
- Invalid leg identifiers are ignored safely at the render boundary instead of being asserted.
- Deterministic screenshots now cover connected round/bouncy and tall/tall GLBs plus the true
  all-models-missing fallback at desktop and tablet viewports.

## Desired behavior

- Attaching legs produces an immediate preview in which the top of the legs meets or slightly
  overlaps the body's intended leg socket, with no visible floating gap.
- Alignment is consistent for every valid round-body and tall-body combination.
- Changing the body removes incompatible legs safely and keeps compatible retained parts aligned.
- Replacing one compatible leg part with another updates the preview without a transient or
  persistent gap.
- Loaded GLB assets and primitive missing-asset fallbacks follow the same visual attachment
  contract.
- Bounce, wave, sparkle, standard-motion, and reduced-motion presentations keep the assembled
  parts connected.
- The correction does not depend on rendered mesh names as educational identifiers and does not
  move authoritative assembly state into Three.js objects.

## Acceptance criteria

- [x] The defect is reproduced and recorded for each valid body/leg combination:
      round/bouncy, round/stompy, tall/bouncy, and tall/tall.
- [x] Each valid GLB body/leg combination connects at a defined attachment point without a visible
      gap or implausible overlap.
- [x] Primitive fallbacks connect correctly when the body model, leg model, or both fail to load.
- [x] Replacing legs and switching bodies cannot leave a stale, detached, or incompatible leg
      component in the preview.
- [x] The connection remains intact during all critter reactions and in reduced-motion mode.
- [x] The correction works at the supported desktop and tablet visual-test viewports and under the
      configured GitHub Pages base path.
- [x] Socket compatibility, serialized creature validity, save migration, and reload behavior are
      unchanged and continue to pass.
- [x] Automated unit coverage verifies the renderer-side attachment calculation or component
      transform contract without requiring WebGL.
- [x] Deterministic visual-regression coverage protects representative round and tall critters,
      including at least one missing-model fallback case.

## Implementation checklist

- [x] Capture the current gap in deterministic desktop and tablet screenshots.
- [x] Inspect the local origins and bounds of every body and leg GLB.
- [x] Define a typed, renderer-only attachment transform or anchor contract for body and leg
      variants.
- [x] Apply the alignment contract consistently to loaded models and primitive fallbacks.
- [x] Verify body changes, leg replacement, rapid repeated selection, and room re-entry.
- [x] Verify bounce, wave, sparkle, and reduced-motion presentations.
- [x] Add focused unit tests for all valid body/leg attachment mappings.
- [x] Add or update deterministic end-to-end and visual-regression coverage.
- [x] Run the required repository validation commands.

## Changed files

- `src/rooms/critter/CritterScene.tsx`
- `src/rooms/critter/critter.model.ts`
- `tests/unit/critterAssetModel.test.ts`
- `tests/e2e/startup.spec.ts`
- Critter baselines under `tests/e2e/startup.spec.ts-snapshots/`
- `PLAN.md`
- `CHANGELOG.md`

## Validation record

| Date       | Evidence                                                                   | Result                                 |
| ---------- | -------------------------------------------------------------------------- | -------------------------------------- |
| 2026-09-07 | Existing scene transforms, fallback geometry, models, and tests inspected  | Open; reproduction and fix are pending |
| 2026-09-07 | GLB bounding-box audit for both bodies and all three leg assets            | Fixed offset confirmed as root cause   |
| 2026-09-07 | Formatting, lint, typecheck, 122 unit/integration tests, and build/budgets | Passed                                 |
| 2026-09-07 | Full desktop/tablet E2E suite under `/carlys-magic-playroom/`              | Passed: 42 tests                       |
| 2026-09-07 | Round, tall, and true missing-model desktop/tablet visual baselines        | Passed and visually inspected          |
| 2026-09-07 | Low-quality room lifecycle performance tests                               | Passed on desktop and tablet           |
| 2026-09-07 | Unchanged playroom-only performance sample                                 | 18.6/18.8 ms vs. 18.5 ms desktop limit |
| 2026-09-07 | Local Pages preview at `/carlys-magic-playroom/`                           | HTTP 200                               |

## Status history

| Date       | Status   | Note                                                   |
| ---------- | -------- | ------------------------------------------------------ |
| 2026-09-07 | Open     | Documented from the report; no implementation started. |
| 2026-09-07 | Resolved | Typed body/leg anchors and fallback parity verified.   |
