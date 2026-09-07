# CMP-006: Build-a-Critter mouth orientation is incorrect

## Status

**Resolved**

- Owner: Codex
- Reported: 2026-09-07
- Last updated: 2026-09-07
- Affected area: Build-a-Critter Lab mouth rendering and missing-model fallback

## Original report

> orientation of the mouth is incorrect

## Description

The Build-a-Critter mouth can render in the wrong plane or direction instead of facing the child
as a recognizable expression. A three-year-old should immediately see the selected smile or round
mouth on the front of the critter without needing to interpret an edge-on or inverted shape.

The visual orientation must be correct for every supported body and mouth combination and must not
depend on successful GLB loading. The bundled mouth models and primitive missing-asset fallbacks
should follow one front-facing expression contract while retaining their existing typed socket,
replacement, persistence, and recovery behavior.

## Reproduction

1. Prevent the Build-a-Critter component models from loading so primitive fallbacks are used.
2. Enter Build-a-Critter Lab.
3. Attach the smile mouth.
4. Observe that the torus segment is rotated out of the screen plane and appears as an incorrect
   bar-like mouth instead of a front-facing smile.
5. Repeat with the round-mouth fallback and compare both fallbacks with their GLB equivalents.

## Pre-fix implementation notes

- Loaded `mouth-smile.glb` and `mouth-o.glb` geometry is authored in the XY plane with positive Z
  depth and faces the fixed application camera correctly.
- `MouthFallback` creates a `TorusGeometry`, which is already generated in the XY plane, then
  rotates it by `Math.PI / 2` around X. That turns the fallback into the XZ plane and presents it
  nearly edge-on to the camera.
- The half-torus smile also needs an explicit in-plane Z rotation so its arc opens upward like the
  bundled smile asset.
- Existing missing-model coverage proves the room remains playable and now captures the fallback,
  but it does not separately assert both mouth variants' orientation contract.

## Resolution

- The fallback mouth now remains in the camera-facing XY plane instead of rotating 90 degrees
  around X.
- A typed renderer-only pose helper applies no rotation to the complete round mouth and rotates the
  half-torus smile by `Math.PI` around Z so the arc opens upward.
- The render boundary validates mouth identifiers before selecting a loaded model or fallback,
  avoiding unsafe assertions or malformed component state.
- The real missing-model browser flow disables service-worker caching, assembles separate smile and
  round-mouth critters, and captures both results at desktop and tablet viewports.

## Desired behavior

- Smile and round mouths face the camera in the critter's front XY plane.
- The smile arc opens upward and remains recognizable without text or audio.
- The round mouth remains a complete, front-facing ring.
- Loaded GLBs and primitive fallbacks communicate the same expression orientation.
- Mouth orientation remains correct for round and tall bodies, during critter reactions, and in
  reduced-motion mode.
- Replacing one mouth with another updates only the selected component and cannot corrupt the
  serializable assembly state.

## Acceptance criteria

- [x] The faulty primitive smile orientation is reproduced and recorded.
- [x] The primitive smile is front-facing and opens upward.
- [x] The primitive round mouth is a front-facing complete ring.
- [x] Both fallback variants match the semantic orientation of their bundled GLB equivalents.
- [x] Mouth orientation is unchanged by body selection, reaction animation, or reduced motion.
- [x] Mouth replacement, compatibility, persistence, and missing-model recovery continue to work.
- [x] Unit coverage verifies the renderer-only pose for both mouth variants without WebGL.
- [x] Deterministic desktop and tablet visual coverage protects the true missing-model fallback.
- [x] The correction works under the configured GitHub Pages base path.

## Implementation checklist

- [x] Inspect the GLB bounds and the primitive torus coordinate plane.
- [x] Define a typed renderer-only fallback mouth pose.
- [x] Remove the out-of-plane rotation and orient the smile arc correctly in-plane.
- [x] Keep the round-mouth ring complete and front-facing.
- [x] Add focused unit coverage for smile and round poses.
- [x] Update deterministic missing-model visual baselines.
- [x] Verify loaded-model assembly and reload behavior remain unchanged.
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

| Date       | Evidence                                                           | Result                                  |
| ---------- | ------------------------------------------------------------------ | --------------------------------------- |
| 2026-09-07 | GLB bounds, scene placement, primitive geometry, and tests audited | Incorrect fallback X rotation confirmed |
| 2026-09-07 | Typed smile/round pose unit coverage                               | Passed                                  |
| 2026-09-07 | Missing-model smile and round desktop/tablet visual baselines      | Passed and visually inspected           |
| 2026-09-07 | Formatting, lint, typecheck, 123 unit/integration tests, and build | Passed; bundle budgets passed           |
| 2026-09-07 | Full E2E suite under `/carlys-magic-playroom/`                     | Passed: 42 tests                        |
| 2026-09-07 | Low-quality all-room lifecycle performance checks                  | Passed on desktop and tablet            |
| 2026-09-07 | Unchanged playroom-only performance samples                        | 18.6/18.5 ms and 34.4/34 ms             |
| 2026-09-07 | Local Pages preview at `/carlys-magic-playroom/`                   | HTTP 200                                |

## Status history

| Date       | Status   | Note                                                    |
| ---------- | -------- | ------------------------------------------------------- |
| 2026-09-07 | Open     | Documented from the report; implementation not started. |
| 2026-09-07 | Resolved | Front-facing smile and round fallback poses verified.   |
