# CMP-005: Build-a-Critter legs do not connect to the body

## Status

**Open**

- Owner: Unassigned
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

## Current implementation notes

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

- [ ] The defect is reproduced and recorded for each valid body/leg combination:
      round/bouncy, round/stompy, tall/bouncy, and tall/tall.
- [ ] Each valid GLB body/leg combination connects at a defined attachment point without a visible
      gap or implausible overlap.
- [ ] Primitive fallbacks connect correctly when the body model, leg model, or both fail to load.
- [ ] Replacing legs and switching bodies cannot leave a stale, detached, or incompatible leg
      component in the preview.
- [ ] The connection remains intact during all critter reactions and in reduced-motion mode.
- [ ] The correction works at the supported desktop and tablet visual-test viewports and under the
      configured GitHub Pages base path.
- [ ] Socket compatibility, serialized creature validity, save migration, and reload behavior are
      unchanged and continue to pass.
- [ ] Automated unit coverage verifies the renderer-side attachment calculation or component
      transform contract without requiring WebGL.
- [ ] Deterministic visual-regression coverage protects representative round and tall critters,
      including at least one missing-model fallback case.

## Implementation checklist

- [ ] Capture the current gap in deterministic desktop and tablet screenshots.
- [ ] Inspect the local origins and bounds of every body and leg GLB.
- [ ] Define a typed, renderer-only attachment transform or anchor contract for body and leg
      variants.
- [ ] Apply the alignment contract consistently to loaded models and primitive fallbacks.
- [ ] Verify body changes, leg replacement, rapid repeated selection, and room re-entry.
- [ ] Verify bounce, wave, sparkle, and reduced-motion presentations.
- [ ] Add focused unit tests for all valid body/leg attachment mappings.
- [ ] Add or update deterministic end-to-end and visual-regression coverage.
- [ ] Run the required repository validation commands.

## Likely files

- `src/rooms/critter/CritterScene.tsx`
- `src/rooms/critter/critter.model.ts`
- `src/rooms/critter/critter.content.ts`
- `tests/unit/critterAssetModel.test.ts`
- `tests/unit/critterModel.test.ts`
- `tests/e2e/startup.spec.ts`
- Critter baselines under `tests/e2e/startup.spec.ts-snapshots/`

## Validation record

| Date       | Evidence                                                                 | Result                                  |
| ---------- | ------------------------------------------------------------------------ | --------------------------------------- |
| 2026-09-07 | Existing scene transforms, fallback geometry, models, and tests inspected | Open; reproduction and fix are pending |

## Status history

| Date       | Status | Note                                                    |
| ---------- | ------ | ------------------------------------------------------- |
| 2026-09-07 | Open   | Documented from the report; no implementation started. |
